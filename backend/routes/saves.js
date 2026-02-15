const registerSaveRoutes = (app, deps) => {
    const {
        prisma,
        validateSavePayload,
        saveSchemaV1,
        maxSaveBytes
    } = deps;

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

    app.put(
        "/api/v1/saves/latest",
        { preHandler: [app.authenticate], bodyLimit: maxSaveBytes },
        async (request, reply) => {
            const userId = request.user?.sub;
            if (!userId) {
                reply.code(401).send({ error: "Unauthorized" });
                return;
            }

            const { payload, virtualScore, appVersion } = request.body ?? {};
            const validation = validateSavePayload(payload);
            if (!validation.ok) {
                request.log?.warn({ reason: validation.error, schema: saveSchemaV1.$id }, "Invalid save payload.");
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
        }
    );
};

module.exports = { registerSaveRoutes };

