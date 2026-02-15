const fastify = require("fastify");
const cors = require("@fastify/cors");
const cookie = require("@fastify/cookie");
const jwt = require("@fastify/jwt");
const { PrismaClient } = require("@prisma/client");
const { SAVE_SCHEMA_V1, validateSavePayload } = require("./saveSchema");
const { registerHealthRoutes } = require("./routes/health");
const { registerChangelogRoutes } = require("./routes/changelog");
const { registerLeaderboardRoutes } = require("./routes/leaderboard");
const { registerAuthRoutes } = require("./routes/auth");
const { registerSaveRoutes } = require("./routes/saves");
const { registerProfileRoutes } = require("./routes/profile");

const MAX_SAVE_BYTES = 2 * 1024 * 1024;
const AUTH_RATE_LIMIT_MAX = 20;
const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const REFRESH_COOKIE_NAME = "refreshToken";
const CSRF_COOKIE_NAME = "refreshCsrf";
const CSRF_HEADER_NAME = "x-csrf-token";
const CHANGELOG_DEFAULT_PER_PAGE = 10;
const CHANGELOG_MAX_PER_PAGE = 10;
const LEADERBOARD_DEFAULT_PER_PAGE = 10;
const LEADERBOARD_MAX_PER_PAGE = 10;
const USERNAME_MAX_LENGTH = 16;
const GITHUB_API_BASE = "https://api.github.com";

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return parsed;
};

const hasLinkRelation = (linkHeader, relation) => {
    if (typeof linkHeader !== "string" || linkHeader.trim().length === 0) {
        return false;
    }
    return linkHeader.split(",").some((segment) => (
        segment.includes(`rel="${relation}"`)
    ));
};

const parseGithubErrorMessage = async (response) => {
    try {
        const payload = await response.json();
        if (payload && typeof payload.message === "string") {
            return payload.message;
        }
    } catch {
        // Ignore malformed upstream payloads.
    }
    try {
        return await response.text();
    } catch {
        return "";
    }
};

const isGithubRateLimited = (response, message) => {
    if (response.status === 429) {
        return true;
    }
    if (response.headers.get("x-ratelimit-remaining") === "0") {
        return true;
    }
    if (response.status === 403 && /rate limit/iu.test(message)) {
        return true;
    }
    return false;
};

const resolveRetryAfterSeconds = (response) => {
    const headerValue = response.headers.get("retry-after");
    const fromHeader = headerValue ? Number.parseInt(headerValue, 10) : Number.NaN;
    if (Number.isFinite(fromHeader) && fromHeader >= 0) {
        return Math.floor(fromHeader);
    }
    const resetValue = response.headers.get("x-ratelimit-reset");
    const resetEpochSeconds = resetValue ? Number.parseInt(resetValue, 10) : Number.NaN;
    if (Number.isFinite(resetEpochSeconds) && resetEpochSeconds > 0) {
        const delta = resetEpochSeconds - Math.floor(Date.now() / 1000);
        return Math.max(0, delta);
    }
    return null;
};

const toBase64Url = (value) => (
    Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "")
);

const fromBase64Url = (value) => {
    const normalized = String(value ?? "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
};

const encodeLeaderboardCursor = (id) => {
    if (typeof id !== "string" || id.trim().length === 0) {
        return null;
    }
    return toBase64Url(JSON.stringify({ v: 1, id }));
};

const decodeLeaderboardCursor = (token) => {
    if (typeof token !== "string") {
        return null;
    }
    const trimmed = token.trim();
    if (!trimmed) {
        return null;
    }
    try {
        const payload = JSON.parse(fromBase64Url(trimmed));
        if (!payload || typeof payload !== "object") {
            return null;
        }
        if (payload.v !== 1) {
            return null;
        }
        if (typeof payload.id !== "string" || payload.id.trim().length === 0) {
            return null;
        }
        return { id: payload.id };
    } catch {
        return null;
    }
};

const normalizeGithubCommit = (entry) => {
    if (!entry || typeof entry.sha !== "string" || entry.sha.trim().length === 0) {
        return null;
    }
    const rawMessage = typeof entry.commit?.message === "string"
        ? entry.commit.message.trim()
        : "";
    const firstLine = rawMessage.split(/\r?\n/u)[0]?.trim() || "Untitled commit";
    const rawDate = entry.commit?.author?.date || entry.commit?.committer?.date;
    const timestamp = typeof rawDate === "string" ? Date.parse(rawDate) : Number.NaN;
    const committedAt = Number.isFinite(timestamp) ? timestamp : 0;
    const author = typeof entry.commit?.author?.name === "string"
        ? entry.commit.author.name
        : typeof entry.author?.login === "string"
        ? entry.author.login
        : "Unknown";
    const item = {
        sha: entry.sha,
        shortSha: entry.sha.slice(0, 7),
        message: firstLine,
        author,
        committedAt
    };
    if (typeof entry.html_url === "string" && entry.html_url.trim().length > 0) {
        item.url = entry.html_url;
    }
    return item;
};

const maskEmail = (email) => {
    if (typeof email !== "string") {
        return "****";
    }
    const [localPartRaw, domainRaw] = email.split("@");
    const localPart = (localPartRaw ?? "").trim();
    const domain = (domainRaw ?? "").trim();
    if (!localPart || !domain) {
        return "****";
    }
    if (localPart.length <= 2) {
        return `${localPart[0] ?? "*"}***${localPart[1] ?? ""}@${domain}`;
    }
    const maskedMiddle = "*".repeat(Math.max(1, localPart.length - 2));
    return `${localPart[0]}${maskedMiddle}${localPart[localPart.length - 1]}@${domain}`;
};

const normalizeUsernameInput = (value) => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value !== "string") {
        return "__invalid__";
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    return trimmed;
};

const isUsernameValid = (username) => {
    if (typeof username !== "string") {
        return false;
    }
    if (username.length > USERNAME_MAX_LENGTH) {
        return false;
    }
    return /^[a-z0-9]+$/iu.test(username);
};

const normalizeUsernameCanonical = (username) => (
    typeof username === "string" ? username.toLowerCase() : null
);

const resolveDisplayName = (user) => {
    const username = typeof user?.username === "string" ? user.username.trim() : "";
    if (username) {
        return username;
    }
    return maskEmail(typeof user?.email === "string" ? user.email : "");
};

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

    const corsOrigins = String(process.env.CORS_ORIGINS || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    const isOriginAllowed = (origin) => {
        if (!origin) {
            return true;
        }
        if (!config.isProduction) {
            return true;
        }
        return corsOrigins.includes(origin);
    };

    app.register(cors, {
        origin: (origin, cb) => cb(null, isOriginAllowed(origin)),
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type", CSRF_HEADER_NAME]
    });

    app.register(cookie, {
        secret: config.COOKIE_SECRET
    });

    app.register(jwt, {
        secret: config.JWT_SECRET
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
            return reply.code(401).send({ error: "Unauthorized" });
        }
    });

    registerHealthRoutes(app);
    registerChangelogRoutes(app, {
        parsePositiveInt,
        hasLinkRelation,
        normalizeGithubCommit,
        parseGithubErrorMessage,
        isGithubRateLimited,
        resolveRetryAfterSeconds,
        githubApiBase: GITHUB_API_BASE,
        defaultPerPage: CHANGELOG_DEFAULT_PER_PAGE,
        maxPerPage: CHANGELOG_MAX_PER_PAGE
    });
    registerLeaderboardRoutes(app, {
        prisma,
        parsePositiveInt,
        decodeLeaderboardCursor,
        encodeLeaderboardCursor,
        resolveDisplayName,
        defaultPerPage: LEADERBOARD_DEFAULT_PER_PAGE,
        maxPerPage: LEADERBOARD_MAX_PER_PAGE
    });
    registerAuthRoutes(app, {
        prisma,
        config,
        authRateLimit,
        refreshCookieName: REFRESH_COOKIE_NAME,
        csrfCookieName: CSRF_COOKIE_NAME,
        csrfHeaderName: CSRF_HEADER_NAME
    });
    registerSaveRoutes(app, {
        prisma,
        validateSavePayload,
        saveSchemaV1: SAVE_SCHEMA_V1,
        maxSaveBytes: MAX_SAVE_BYTES
    });
    registerProfileRoutes(app, {
        prisma,
        maskEmail,
        resolveDisplayName,
        normalizeUsernameInput,
        isUsernameValid,
        normalizeUsernameCanonical,
        usernameMaxLength: USERNAME_MAX_LENGTH
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
