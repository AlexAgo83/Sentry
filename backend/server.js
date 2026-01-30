const fastify = require("fastify");
const cors = require("@fastify/cors");
const cookie = require("@fastify/cookie");
const jwt = require("@fastify/jwt");
const rateLimit = require("@fastify/rate-limit");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const MAX_SAVE_BYTES = 2 * 1024 * 1024;
const AUTH_RATE_LIMIT_MAX = 20;
const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000;

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
        allowedHeaders: ["Authorization", "Content-Type"]
    });

    app.register(cookie, {
        secret: config.COOKIE_SECRET
    });

    app.register(jwt, {
        secret: config.JWT_SECRET
    });

    app.register(rateLimit, { global: false });

    const createRateLimiter = ({ max, windowMs }) => {
        const hits = new Map();
        return async (request, reply) => {
            const forwardedFor = request.headers["x-forwarded-for"];
            const forwardedIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "";
            const key = forwardedIp || request.ip || "unknown";
            const now = Date.now();
            const timestamps = hits.get(key) ?? [];
            const recent = timestamps.filter((time) => now - time < windowMs);
            if (recent.length >= max) {
                reply.code(429).send({ error: "Too many requests." });
                return;
            }
            recent.push(now);
            hits.set(key, recent);
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

    const signRefreshToken = (userId) => app.jwt.sign(
        { sub: userId, type: "refresh" },
        { expiresIn: `${config.REFRESH_TTL_DAYS}d` }
    );

    const setRefreshCookie = (reply, token) => {
        reply.setCookie("refreshToken", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: config.isProduction,
            path: "/api/v1/auth/refresh",
            maxAge: config.REFRESH_TTL_DAYS * 24 * 60 * 60
        });
    };

    app.post("/api/v1/auth/register", {
        preHandler: [authRateLimit],
        config: { rateLimit: { max: 20, timeWindow: "1 minute" } }
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

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);
        setRefreshCookie(reply, refreshToken);
        reply.send({ accessToken });
    });

    app.post("/api/v1/auth/login", {
        preHandler: [authRateLimit],
        config: { rateLimit: { max: 20, timeWindow: "1 minute" } }
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

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);
        setRefreshCookie(reply, refreshToken);
        reply.send({ accessToken });
    });

    app.post("/api/v1/auth/refresh", {
        preHandler: [authRateLimit],
        config: { rateLimit: { max: 20, timeWindow: "1 minute" } }
    }, async (request, reply) => {
        const token = request.cookies.refreshToken;
        if (!token) {
            reply.code(401).send({ error: "Missing refresh token." });
            return;
        }

        try {
            const payload = await app.jwt.verify(token);
            if (!payload || payload.type !== "refresh") {
                reply.code(401).send({ error: "Invalid refresh token." });
                return;
            }
            const accessToken = signAccessToken(payload.sub);
            const refreshToken = signRefreshToken(payload.sub);
            setRefreshCookie(reply, refreshToken);
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
        if (!payload || typeof payload !== "object") {
            reply.code(400).send({ error: "Invalid save payload." });
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
