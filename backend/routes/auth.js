const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const registerAuthRoutes = (app, deps) => {
    const {
        prisma,
        config,
        authRateLimit,
        refreshCookieName,
        csrfCookieName,
        csrfHeaderName
    } = deps;

    const signAccessToken = (userId) => app.jwt.sign(
        { sub: userId, type: "access" },
        { expiresIn: `${config.ACCESS_TTL_MINUTES}m` }
    );

    const signRefreshToken = (userId, tokenId) => app.jwt.sign(
        { sub: userId, type: "refresh", jti: tokenId },
        { expiresIn: `${config.REFRESH_TTL_DAYS}d` }
    );

    const cookieSameSite = config.isProduction ? "none" : "lax";
    const cookieSecure = config.isProduction;

    const setRefreshCookie = (reply, token) => {
        reply.setCookie(refreshCookieName, token, {
            httpOnly: true,
            sameSite: cookieSameSite,
            secure: cookieSecure,
            path: "/api/v1/auth/refresh",
            maxAge: config.REFRESH_TTL_DAYS * 24 * 60 * 60
        });
    };

    const setCsrfCookie = (reply, token) => {
        reply.setCookie(csrfCookieName, token, {
            httpOnly: false,
            sameSite: cookieSameSite,
            secure: cookieSecure,
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
        return { accessToken, csrfToken };
    };

    const verifyRefreshCsrf = (request, reply) => {
        const csrfCookie = request.cookies?.[csrfCookieName];
        const csrfHeader = request.headers?.[csrfHeaderName];
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

        const { accessToken, csrfToken } = await issueAuthTokens(user.id, reply);
        reply.send({ accessToken, csrfToken });
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

        const { accessToken, csrfToken } = await issueAuthTokens(user.id, reply);
        reply.send({ accessToken, csrfToken });
    });

    app.post("/api/v1/auth/refresh", {
        preHandler: [authRateLimit]
    }, async (request, reply) => {
        const token = request.cookies?.[refreshCookieName];
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

            const { accessToken, csrfToken } = await issueAuthTokens(userId, reply);
            reply.send({ accessToken, csrfToken });
        } catch {
            reply.code(401).send({ error: "Invalid refresh token." });
        }
    });
};

module.exports = { registerAuthRoutes };

