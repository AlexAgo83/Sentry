// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

const loadServer = async () => {
    const mod = await import("../../backend/server.js");
    return (mod.default ?? mod) as { buildServer: (options?: { prismaClient?: unknown; logger?: boolean }) => any };
};

describe("health endpoint", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = "test-secret";
        process.env.COOKIE_SECRET = "test-secret";
        process.env.ACCESS_TOKEN_TTL_MINUTES = "15";
        process.env.REFRESH_TOKEN_TTL_DAYS = "30";
    });

    it("returns ok payload", async () => {
        const { buildServer } = await loadServer();
        const app = buildServer({ logger: false });

        const response = await app.inject({ method: "GET", url: "/health" });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ ok: true });
    });
});
