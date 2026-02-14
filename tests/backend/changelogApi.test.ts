// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadServer = async () => {
    const mod = await import("../../backend/server.js");
    return (mod.default ?? mod) as { buildServer: (options?: { prismaClient?: unknown; logger?: boolean }) => any };
};

const buildCommit = (id: number) => ({
    sha: `abcdef${id}1234567890`,
    html_url: `https://github.com/AlexAgo83/Sentry/commit/abcdef${id}`,
    commit: {
        message: `Commit ${id}\n\nBody`,
        author: {
            name: `Author ${id}`,
            date: "2026-02-14T12:00:00.000Z"
        }
    },
    author: {
        login: `author-${id}`
    }
});

describe("changelog API", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = "test-secret";
        process.env.COOKIE_SECRET = "test-secret";
        process.env.ACCESS_TOKEN_TTL_MINUTES = "15";
        process.env.REFRESH_TOKEN_TTL_DAYS = "30";
        process.env.GITHUB_OWNER = "AlexAgo83";
        process.env.GITHUB_REPO = "Sentry";
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        delete process.env.GITHUB_TOKEN;
    });

    it("maps GitHub commits payload and detects next page", async () => {
        process.env.GITHUB_TOKEN = "ghs_test_token";
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify([buildCommit(1), buildCommit(2)]),
            {
                status: 200,
                headers: {
                    "content-type": "application/json",
                    link: "<https://api.github.com/repositories/1/commits?page=3>; rel=\"next\""
                }
            }
        ));
        vi.stubGlobal("fetch", fetchMock);

        const { buildServer } = await loadServer();
        const app = buildServer({ logger: false });

        const response = await app.inject({
            method: "GET",
            url: "/api/changelog/commits?page=2&perPage=10"
        });

        expect(response.statusCode).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0] as [string, { method: string; headers: Record<string, string> }];
        expect(url).toContain("/repos/AlexAgo83/Sentry/commits");
        expect(url).toContain("page=2");
        expect(url).toContain("per_page=10");
        expect(options.method).toBe("GET");
        expect(options.headers.Authorization).toBe("Bearer ghs_test_token");

        const payload = response.json();
        expect(payload.page).toBe(2);
        expect(payload.perPage).toBe(10);
        expect(payload.hasNextPage).toBe(true);
        expect(payload.source).toBe("github");
        expect(payload.items).toHaveLength(2);
        expect(payload.items[0]).toMatchObject({
            sha: "abcdef11234567890",
            shortSha: "abcdef1",
            message: "Commit 1",
            author: "Author 1"
        });

        await app.close();
    });

    it("works without token and returns rate-limit mapping", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ message: "API rate limit exceeded for 1.2.3.4." }),
            {
                status: 403,
                headers: {
                    "content-type": "application/json",
                    "x-ratelimit-remaining": "0",
                    "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 60)
                }
            }
        ));
        vi.stubGlobal("fetch", fetchMock);

        const { buildServer } = await loadServer();
        const app = buildServer({ logger: false });

        const response = await app.inject({
            method: "GET",
            url: "/api/changelog/commits?page=1&perPage=50"
        });

        expect(response.statusCode).toBe(429);
        const payload = response.json();
        expect(payload.code).toBe("rate_limited");
        const [url, options] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
        expect(url).toContain("per_page=10");
        expect(options.headers.Authorization).toBeUndefined();
        expect(response.headers["retry-after"]).toBeTruthy();

        await app.close();
    });

    it("returns stable errors for missing config and upstream failures", async () => {
        delete process.env.GITHUB_OWNER;
        delete process.env.GITHUB_REPO;

        const { buildServer } = await loadServer();
        const app = buildServer({ logger: false });

        const missingConfig = await app.inject({
            method: "GET",
            url: "/api/changelog/commits"
        });
        expect(missingConfig.statusCode).toBe(503);
        expect(missingConfig.json().code).toBe("not_configured");
        await app.close();

        process.env.GITHUB_OWNER = "AlexAgo83";
        process.env.GITHUB_REPO = "Sentry";
        const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
        vi.stubGlobal("fetch", fetchMock);

        const appWithUpstreamError = buildServer({ logger: false });
        const upstreamFailure = await appWithUpstreamError.inject({
            method: "GET",
            url: "/api/changelog/commits"
        });
        expect(upstreamFailure.statusCode).toBe(503);
        expect(upstreamFailure.json().code).toBe("upstream_unreachable");

        await appWithUpstreamError.close();
    });
});
