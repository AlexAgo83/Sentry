const registerProfileRoutes = (app, deps) => {
    const {
        prisma,
        maskEmail,
        resolveDisplayName,
        normalizeUsernameInput,
        isUsernameValid,
        normalizeUsernameCanonical,
        usernameMaxLength
    } = deps;

    app.get("/api/v1/users/me/profile", { preHandler: [app.authenticate] }, async (request, reply) => {
        const userId = request.user?.sub;
        if (!userId) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                username: true
            }
        });
        if (!user) {
            reply.code(404).send({ error: "User not found." });
            return;
        }
        reply.send({
            profile: {
                email: user.email,
                username: user.username ?? null,
                maskedEmail: maskEmail(user.email),
                displayName: resolveDisplayName(user)
            }
        });
    });

    app.patch("/api/v1/users/me/profile", { preHandler: [app.authenticate] }, async (request, reply) => {
        const userId = request.user?.sub;
        if (!userId) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }
        const rawUsername = request.body?.username;
        const normalizedUsername = normalizeUsernameInput(rawUsername);
        if (normalizedUsername === "__invalid__") {
            reply.code(400).send({ error: "Invalid username payload." });
            return;
        }
        if (normalizedUsername !== null && normalizedUsername.length > usernameMaxLength) {
            reply.code(400).send({ error: `Username must be ${usernameMaxLength} characters or fewer.` });
            return;
        }
        if (normalizedUsername !== null && !isUsernameValid(normalizedUsername)) {
            reply.code(400).send({ error: "Username must use letters and numbers only." });
            return;
        }

        const usernameCanonical = normalizeUsernameCanonical(normalizedUsername);
        if (usernameCanonical) {
            const existing = await prisma.user.findFirst({
                where: {
                    usernameCanonical,
                    id: { not: userId }
                },
                select: { id: true }
            });
            if (existing) {
                reply.code(409).send({ error: "Username is already taken." });
                return;
            }
        }

        try {
            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    username: normalizedUsername,
                    usernameCanonical
                },
                select: {
                    email: true,
                    username: true
                }
            });
            reply.send({
                profile: {
                    email: updated.email,
                    username: updated.username ?? null,
                    maskedEmail: maskEmail(updated.email),
                    displayName: resolveDisplayName(updated)
                }
            });
        } catch (error) {
            if (error && typeof error === "object" && error.code === "P2002") {
                reply.code(409).send({ error: "Username is already taken." });
                return;
            }
            throw error;
        }
    });
};

module.exports = { registerProfileRoutes };

