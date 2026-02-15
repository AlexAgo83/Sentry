const registerChangelogRoutes = (app, deps) => {
    const {
        parsePositiveInt,
        hasLinkRelation,
        normalizeGithubCommit,
        parseGithubErrorMessage,
        isGithubRateLimited,
        resolveRetryAfterSeconds,
        githubApiBase,
        defaultPerPage,
        maxPerPage
    } = deps;

    app.get("/api/changelog/commits", async (request, reply) => {
        const owner = (process.env.GITHUB_OWNER || "").trim();
        const repo = (process.env.GITHUB_REPO || "").trim();
        if (!owner || !repo) {
            reply.code(503).send({
                error: "Changelog feed is not configured on the server.",
                code: "not_configured"
            });
            return;
        }

        const page = parsePositiveInt(request.query?.page, 1);
        const requestedPerPage = parsePositiveInt(request.query?.perPage, defaultPerPage);
        const perPage = Math.min(maxPerPage, requestedPerPage);
        const apiUrl = new URL(`/repos/${owner}/${repo}/commits`, githubApiBase);
        apiUrl.searchParams.set("page", String(page));
        apiUrl.searchParams.set("per_page", String(perPage));

        const headers = {
            Accept: "application/vnd.github+json",
            "User-Agent": "sentry-idle"
        };
        const githubToken = (process.env.GITHUB_TOKEN || "").trim();
        if (githubToken) {
            headers.Authorization = `Bearer ${githubToken}`;
        }

        let upstreamResponse;
        try {
            upstreamResponse = await fetch(apiUrl.toString(), {
                method: "GET",
                headers
            });
        } catch (error) {
            request.log?.warn({ error }, "Changelog upstream request failed.");
            reply.code(503).send({
                error: "Changelog upstream is unreachable.",
                code: "upstream_unreachable"
            });
            return;
        }

        if (!upstreamResponse.ok) {
            const message = await parseGithubErrorMessage(upstreamResponse);
            if (isGithubRateLimited(upstreamResponse, message)) {
                const retryAfterSeconds = resolveRetryAfterSeconds(upstreamResponse);
                if (retryAfterSeconds !== null) {
                    reply.header("Retry-After", String(retryAfterSeconds));
                }
                reply.code(429).send({
                    error: "GitHub rate limit reached. Please retry shortly.",
                    code: "rate_limited"
                });
                return;
            }
            if (upstreamResponse.status === 404) {
                reply.code(404).send({
                    error: "Configured GitHub repository was not found.",
                    code: "repo_not_found"
                });
                return;
            }
            request.log?.warn(
                { status: upstreamResponse.status, message },
                "Unexpected GitHub changelog response."
            );
            reply.code(502).send({
                error: "Unable to fetch changelog commits from GitHub.",
                code: "upstream_error"
            });
            return;
        }

        let commitsPayload;
        try {
            commitsPayload = await upstreamResponse.json();
        } catch {
            reply.code(502).send({
                error: "Changelog response was invalid.",
                code: "invalid_upstream_payload"
            });
            return;
        }
        if (!Array.isArray(commitsPayload)) {
            reply.code(502).send({
                error: "Changelog response was invalid.",
                code: "invalid_upstream_payload"
            });
            return;
        }

        const items = commitsPayload
            .map((entry) => normalizeGithubCommit(entry))
            .filter((entry) => entry !== null);
        const linkHeader = upstreamResponse.headers.get("link");
        const hasNextPage = hasLinkRelation(linkHeader, "next");

        reply.send({
            items,
            page,
            perPage,
            hasNextPage,
            source: "github"
        });
    });
};

module.exports = { registerChangelogRoutes };

