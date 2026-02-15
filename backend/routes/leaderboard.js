const registerLeaderboardRoutes = (app, deps) => {
    const {
        prisma,
        parsePositiveInt,
        decodeLeaderboardCursor,
        encodeLeaderboardCursor,
        resolveDisplayName,
        defaultPerPage,
        maxPerPage
    } = deps;

    app.get("/api/v1/leaderboard", async (request, reply) => {
        const cursorToken = typeof request.query?.cursor === "string"
            ? request.query.cursor
            : "";
        const cursor = decodeLeaderboardCursor(cursorToken);

        const page = parsePositiveInt(request.query?.page, 1);
        const requestedPerPage = parsePositiveInt(request.query?.perPage, defaultPerPage);
        const perPage = Math.min(maxPerPage, requestedPerPage);
        if (!cursor && page > 1) {
            reply.code(400).send({
                error: "Legacy pagination is not supported. Please update the client.",
                code: "legacy_pagination_not_supported"
            });
            return;
        }

        const orderBy = [
            { virtualScore: "desc" },
            { updatedAt: "desc" },
            { id: "asc" }
        ];
        const includeUser = {
            user: {
                select: {
                    id: true,
                    email: true,
                    username: true
                }
            }
        };

        const cursorRow = cursor
            ? await prisma.save.findUnique({
                where: { id: cursor.id },
                select: { id: true, virtualScore: true, updatedAt: true }
            })
            : null;
        if (cursor && !cursorRow) {
            reply.code(400).send({
                error: "Cursor is invalid.",
                code: "invalid_cursor"
            });
            return;
        }

        const where = cursorRow
            ? {
                OR: [
                    { virtualScore: { lt: cursorRow.virtualScore } },
                    {
                        AND: [
                            { virtualScore: cursorRow.virtualScore },
                            { updatedAt: { lt: cursorRow.updatedAt } }
                        ]
                    },
                    {
                        AND: [
                            { virtualScore: cursorRow.virtualScore },
                            { updatedAt: cursorRow.updatedAt },
                            { id: { gt: cursorRow.id } }
                        ]
                    }
                ]
            }
            : undefined;

        const rows = await prisma.save.findMany({
            take: perPage + 1,
            orderBy,
            where,
            include: includeUser
        });

        const hasNextPage = rows.length > perPage;
        const pageRows = rows.slice(0, perPage);
        const previousRow = cursorRow ?? null;
        const nextRow = hasNextPage ? rows[perPage] ?? null : null;

        const items = pageRows.map((entry, index) => {
            const previousScore = index > 0
                ? pageRows[index - 1]?.virtualScore ?? null
                : previousRow?.virtualScore ?? null;
            const nextScore = index < pageRows.length - 1
                ? pageRows[index + 1]?.virtualScore ?? null
                : nextRow?.virtualScore ?? null;
            const isExAequo = entry.virtualScore === previousScore || entry.virtualScore === nextScore;
            return {
                userId: entry.user.id,
                displayName: resolveDisplayName(entry.user),
                virtualScore: entry.virtualScore,
                updatedAt: entry.updatedAt.toISOString(),
                appVersion: entry.appVersion,
                isExAequo
            };
        });

        const nextCursor = hasNextPage && pageRows.length > 0
            ? encodeLeaderboardCursor(pageRows[pageRows.length - 1].id)
            : null;

        reply.send({
            items,
            perPage,
            hasNextPage,
            nextCursor
        });
    });
};

module.exports = { registerLeaderboardRoutes };

