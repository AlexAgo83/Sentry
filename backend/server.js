const fastify = require("fastify");
const cors = require("@fastify/cors");
const cookie = require("@fastify/cookie");
const jwt = require("@fastify/jwt");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { SAVE_SCHEMA_V1, validateSavePayload } = require("./saveSchema");

const MAX_SAVE_BYTES = 2 * 1024 * 1024;
const AUTH_RATE_LIMIT_MAX = 20;
const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const REFRESH_COOKIE_NAME = "refreshToken";
const CSRF_COOKIE_NAME = "refreshCsrf";
const CSRF_HEADER_NAME = "x-csrf-token";

const buildConfig = () => {
    const ACCESS_TTL_MINUTES = Number(process.env.ACCESS_TOKEN_TTL_MINUTES ?? 15);
    const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);
    const JWT_SECRET = process.env.JWT_SECRET;
    const COOKIE_SECRET = process.env.COOKIE_SECRET || JWT_SECRET;
    const isProduction = process.env.NODE_ENV === "production";

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is required.");
    }

    return {
        ACCESS_TTL_MINUTES,
        REFRESH_TTL_DAYS,
        JWT_SECRET,
        COOKIE_SECRET,
        isProduction
    };
};

const buildServer = ({ prismaClient, logger = true } = {}) => {
    const config = buildConfig();
    const prisma = prismaClient ?? new PrismaClient();
    const shouldDisconnect = !prismaClient;
    const app = fastify({ logger, bodyLimit: MAX_SAVE_BYTES });

    app.register(cors, {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type", CSRF_HEADER_NAME]
    });

    app.register(cookie, {
        secret: config.COOKIE_SECRET
    });

    app.register(jwt, {
        secret: config.JWT_SECRET
    });

    app.get("/health", async () => {
        return { ok: true };
    });

    const resolveClientKey = (request) => {
        const forwardedFor = request.headers["x-forwarded-for"];
        const forwardedIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "";
        return forwardedIp || request.ip || "unknown";
    };

    const resolveRouteKey = (request) => {
        return request.routeOptions?.url || request.routerPath || request.raw?.url || "unknown";
    };

    const createRateLimiter = ({ max, windowMs }) => {
        return async (request, reply) => {
            const key = resolveClientKey(request);
            const route = resolveRouteKey(request);
            const now = new Date();
            const resetAt = new Date(now.getTime() + windowMs);
            try {
                const result = await prisma.$transaction(async (tx) => {
                    const current = await tx.rateLimit.findUnique({
                        where: { key_route: { key, route } }
                    });
                    if (!current || current.resetAt <= now) {
                        await tx.rateLimit.upsert({
                            where: { key_route: { key, route } },
                            create: { key, route, count: 1, resetAt },
                            update: { count: 1, resetAt }
                        });
                        return { allowed: true, resetAt };
                    }
                    if (current.count >= max) {
                        return { allowed: false, resetAt: current.resetAt };
                    }
                    await tx.rateLimit.update({
                        where: { key_route: { key, route } },
                        data: { count: { increment: 1 } }
                    });
                    return { allowed: true, resetAt: current.resetAt };
                });

                if (!result.allowed) {
                    const retryAfter = Math.max(0, Math.ceil((result.resetAt.getTime() - now.getTime()) / 1000));
                    reply.header("Retry-After", String(retryAfter));
                    reply.code(429).send({ error: "Too many requests." });
                    return reply;
                }
            } catch (error) {
                request.log?.warn({ error }, "Rate limit lookup failed.");
            }
        };
    };

    const authRateLimit = createRateLimiter({
        max: AUTH_RATE_LIMIT_MAX,
        windowMs: AUTH_RATE_LIMIT_WINDOW_MS
    });

    app.decorate("authenticate", async (request, reply) => {
        try {
            await request.jwtVerify();
            if (!request.user || request.user.type !== "access") {
                throw new Error("Invalid token type.");
            }
        } catch {
            reply.code(401).send({ error: "Unauthorized" });
        }
    });

    const signAccessToken = (userId) => app.jwt.sign(
        { sub: userId, type: "access" },
        { expiresIn: `${config.ACCESS_TTL_MINUTES}m` }
    );

    const signRefreshToken = (userId, tokenId) => app.jwt.sign(
        { sub: userId, type: "refresh", jti: tokenId },
        { expiresIn: `${config.REFRESH_TTL_DAYS}d` }
    );

    const setRefreshCookie = (reply, token) => {
        reply.setCookie(REFRESH_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: config.isProduction,
            path: "/api/v1/auth/refresh",
            maxAge: config.REFRESH_TTL_DAYS * 24 * 60 * 60
        });
    };

    const setCsrfCookie = (reply, token) => {
        reply.setCookie(CSRF_COOKIE_NAME, token, {
            httpOnly: false,
            sameSite: "lax",
            secure: config.isProduction,
            path: "/",
            maxAge: config.REFRESH_TTL_DAYS * 24 * 60 * 60
        });
    };

    const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");
    const generateTokenId = () => (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex"));
    const generateCsrfToken = () => crypto.randomBytes(16).toString("hex");

    const issueRefreshToken = async (userId) => {
        const tokenId = generateTokenId();
        const refreshToken = signRefreshToken(userId, tokenId);
        const expiresAt = new Date(Date.now() + config.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
        await prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: hashToken(tokenId),
                expiresAt
            }
        });
        return refreshToken;
    };

    const issueAuthTokens = async (userId, reply) => {
        const accessToken = signAccessToken(userId);
        const refreshToken = await issueRefreshToken(userId);
        const csrfToken = generateCsrfToken();
        setRefreshCookie(reply, refreshToken);
        setCsrfCookie(reply, csrfToken);
        return { accessToken };
    };

    const verifyRefreshCsrf = (request, reply) => {
        const csrfCookie = request.cookies?.[CSRF_COOKIE_NAME];
        const csrfHeader = request.headers?.[CSRF_HEADER_NAME];
        if (!csrfCookie || typeof csrfHeader !== "string" || csrfCookie !== csrfHeader) {
            reply.code(403).send({ error: "Invalid CSRF token." });
            return false;
        }
        return true;
    };

    app.post("/api/v1/auth/register", {
        preHandler: [authRateLimit]
    }, async (request, reply) => {
        const { email, password } = request.body ?? {};
        if (typeof email !== "string" || typeof password !== "string") {
            reply.code(400).send({ error: "Invalid payload." });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || password.length < 6) {
            reply.code(400).send({ error: "Email or password is invalid." });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            reply.code(409).send({ error: "Account already exists." });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash
            }
        });

        const { accessToken } = await issueAuthTokens(user.id, reply);
        reply.send({ accessToken });
    });

    app.post("/api/v1/auth/login", {
        preHandler: [authRateLimit]
    }, async (request, reply) => {
        const { email, password } = request.body ?? {};
        if (typeof email !== "string" || typeof password !== "string") {
            reply.code(400).send({ error: "Invalid payload." });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            reply.code(401).send({ error: "Invalid credentials." });
            return;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            reply.code(401).send({ error: "Invalid credentials." });
            return;
        }

        const { accessToken } = await issueAuthTokens(user.id, reply);
        reply.send({ accessToken });
    });

    app.post("/api/v1/auth/refresh", {
        preHandler: [authRateLimit]
    }, async (request, reply) => {
        const token = request.cookies?.[REFRESH_COOKIE_NAME];
        if (!token) {
            reply.code(401).send({ error: "Missing refresh token." });
            return;
        }
        if (!verifyRefreshCsrf(request, reply)) {
            return;
        }

        try {
            const payload = await app.jwt.verify(token);
            if (!payload || payload.type !== "refresh" || !payload.jti) {
                reply.code(401).send({ error: "Invalid refresh token." });
                return;
            }
            const userId = typeof payload.sub === "string" ? payload.sub : null;
            if (!userId) {
                reply.code(401).send({ error: "Invalid refresh token." });
                return;
            }
            const record = await prisma.refreshToken.findUnique({
                where: { tokenHash: hashToken(payload.jti) }
            });
            if (!record || record.revokedAt || record.expiresAt <= new Date() || record.userId !== userId) {
                reply.code(401).send({ error: "Invalid refresh token." });
                return;
            }
            await prisma.refreshToken.update({
                where: { tokenHash: hashToken(payload.jti) },
                data: { revokedAt: new Date() }
            });

            const { accessToken } = await issueAuthTokens(userId, reply);
            reply.send({ accessToken });
        } catch {
            reply.code(401).send({ error: "Invalid refresh token." });
        }
    });

    app.get("/api/v1/saves/latest", { preHandler: [app.authenticate] }, async (request, reply) => {
        const userId = request.user?.sub;
        if (!userId) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }

        const save = await prisma.save.findUnique({ where: { userId } });
        if (!save) {
            reply.code(204).send();
            return;
        }

        reply.send({
            payload: save.payload,
            meta: {
                updatedAt: save.updatedAt.toISOString(),
                virtualScore: save.virtualScore,
                appVersion: save.appVersion
            }
        });
    });

    app.put("/api/v1/saves/latest", { preHandler: [app.authenticate], bodyLimit: MAX_SAVE_BYTES }, async (request, reply) => {
        const userId = request.user?.sub;
        if (!userId) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }

        const { payload, virtualScore, appVersion } = request.body ?? {};
        const validation = validateSavePayload(payload);
        if (!validation.ok) {
            request.log?.warn({ reason: validation.error, schema: SAVE_SCHEMA_V1.$id }, "Invalid save payload.");
            reply.code(400).send({ error: validation.error });
            return;
        }
        if (!Number.isFinite(virtualScore)) {
            reply.code(400).send({ error: "Invalid virtual score." });
            return;
        }
        if (typeof appVersion !== "string" || appVersion.trim().length === 0) {
            reply.code(400).send({ error: "Invalid app version." });
            return;
        }

        const saved = await prisma.save.upsert({
            where: { userId },
            update: {
                payload,
                virtualScore: Math.floor(virtualScore),
                appVersion: appVersion.trim()
            },
            create: {
                userId,
                payload,
                virtualScore: Math.floor(virtualScore),
                appVersion: appVersion.trim()
            }
        });

        reply.send({
            meta: {
                updatedAt: saved.updatedAt.toISOString(),
                virtualScore: saved.virtualScore,
                appVersion: saved.appVersion
            }
        });
    });

    app.addHook("onClose", async () => {
        if (shouldDisconnect) {
            await prisma.$disconnect();
        }
    });

    return app;
};

const start = async () => {
    const port = Number(process.env.API_PORT ?? 8787);
    const app = buildServer();
    await app.listen({ port, host: "0.0.0.0" });
};

if (require.main === module) {
    start().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = { buildServer };
