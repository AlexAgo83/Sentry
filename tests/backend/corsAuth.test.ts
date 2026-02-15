// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

const loadServer = async () => {
    const mod = await import("../../backend/server.js");
    return (mod.default ?? mod) as { buildServer: (options?: { prismaClient?: unknown; logger?: boolean }) => any };
};

describe("backend CORS + auth middleware", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = "test-secret";
        process.env.COOKIE_SECRET = "test-secret";
        process.env.ACCESS_TOKEN_TTL_MINUTES = "15";
        process.env.REFRESH_TOKEN_TTL_DAYS = "30";
    });

    it("restricts CORS to allowlist in production", async () => {
        process.env.NODE_ENV = "production";
        process.env.CORS_ORIGINS = "https://allowed.example,https://another.example";

        const { buildServer } = await loadServer();
        const app = buildServer({ logger: false });

        const allowed = await app.inject({
            method: "GET",
            url: "/health",
            headers: { origin: "https://allowed.example" }
        });
        expect(allowed.statusCode).toBe(200);
        expect(allowed.headers["access-control-allow-origin"]).toBe("https://allowed.example");
        expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

        const denied = await app.inject({
            method: "GET",
            url: "/health",
            headers: { origin: "https://evil.example" }
        });
        expect(denied.statusCode).toBe(200);
        expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("auth preHandler short-circuits and prevents handler execution", async () => {
        process.env.NODE_ENV = "production";
        process.env.CORS_ORIGINS = "https://allowed.example";

        const { buildServer } = await loadServer();
        const app = buildServer({ logger: false });

        let handlerRan = false;
        app.get("/test/protected", { preHandler: [app.authenticate] }, async () => {
            handlerRan = true;
            return { ok: true };
        });

        const res = await app.inject({
            method: "GET",
            url: "/test/protected",
            headers: { origin: "https://allowed.example" }
        });
        expect(res.statusCode).toBe(401);
        expect(handlerRan).toBe(false);
    });
});

