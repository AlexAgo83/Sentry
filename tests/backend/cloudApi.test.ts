// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";

const buildMockPrisma = () => {
    const db = {
        users: [] as Array<{ id: string; email: string; passwordHash: string; createdAt: Date }>,
        saves: [] as Array<{
            id: string;
            userId: string;
            payload: unknown;
            virtualScore: number;
            appVersion: string;
            createdAt: Date;
            updatedAt: Date;
        }>
    };

    let userCounter = 1;
    let saveCounter = 1;

    const prisma = {
        user: {
            findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
                if (where.email) {
                    return db.users.find((u) => u.email === where.email) ?? null;
                }
                if (where.id) {
                    return db.users.find((u) => u.id === where.id) ?? null;
                }
                return null;
            },
            create: async ({ data }: { data: { email: string; passwordHash: string } }) => {
                const user = {
                    id: `user_${userCounter++}`,
                    email: data.email,
                    passwordHash: data.passwordHash,
                    createdAt: new Date()
                };
                db.users.push(user);
                return user;
            }
        },
        save: {
            findUnique: async ({ where }: { where: { userId: string } }) => {
                return db.saves.find((s) => s.userId === where.userId) ?? null;
            },
            upsert: async ({ where, create, update }: {
                where: { userId: string };
                create: { userId: string; payload: unknown; virtualScore: number; appVersion: string };
                update: { payload: unknown; virtualScore: number; appVersion: string };
            }) => {
                const existing = db.saves.find((s) => s.userId === where.userId);
                if (existing) {
                    existing.payload = update.payload;
                    existing.virtualScore = update.virtualScore;
                    existing.appVersion = update.appVersion;
                    existing.updatedAt = new Date();
                    return existing;
                }
                const save = {
                    id: `save_${saveCounter++}`,
                    userId: create.userId,
                    payload: create.payload,
                    virtualScore: create.virtualScore,
                    appVersion: create.appVersion,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                db.saves.push(save);
                return save;
            }
        },
        $disconnect: async () => {}
    };

    return prisma;
};

const getCookieHeader = (response: { headers: Record<string, string | string[] | undefined> }) => {
    const setCookie = response.headers["set-cookie"];
    if (!setCookie) {
        return "";
    }
    if (Array.isArray(setCookie)) {
        return setCookie.map((entry) => entry.split(";")[0]).join("; ");
    }
    return setCookie.split(";")[0];
};

const loadServer = async () => {
    const mod = await import("../../backend/server.js");
    return (mod.default ?? mod) as { buildServer: (options?: { prismaClient?: unknown; logger?: boolean }) => any };
};

describe("cloud API", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = "test-secret";
        process.env.COOKIE_SECRET = "test-secret";
        process.env.ACCESS_TOKEN_TTL_MINUTES = "15";
        process.env.REFRESH_TOKEN_TTL_DAYS = "30";
    });

    it("registers, refreshes, and stores latest save", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const register = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "test@example.com", password: "password123" }
        });
        expect(register.statusCode).toBe(200);
        const { accessToken } = register.json();
        expect(accessToken).toBeTruthy();

        const cookieHeader = getCookieHeader(register);
        const refreshed = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: { cookie: cookieHeader }
        });
        expect(refreshed.statusCode).toBe(200);
        expect(refreshed.json().accessToken).toBeTruthy();

        const saveResponse = await app.inject({
            method: "PUT",
            url: "/api/v1/saves/latest",
            headers: { Authorization: `Bearer ${accessToken}` },
            payload: {
                payload: { version: "0.8.11", players: { "1": { id: "1" } } },
                virtualScore: 123,
                appVersion: "0.8.11"
            }
        });
        expect(saveResponse.statusCode).toBe(200);
        expect(saveResponse.json().meta.virtualScore).toBe(123);

        const latest = await app.inject({
            method: "GET",
            url: "/api/v1/saves/latest",
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(latest.statusCode).toBe(200);
        expect(latest.json().meta.appVersion).toBe("0.8.11");

        await app.close();
    });

    it("rejects invalid login", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "test@example.com", password: "password123" }
        });

        const login = await app.inject({
            method: "POST",
            url: "/api/v1/auth/login",
            payload: { email: "test@example.com", password: "wrong" }
        });
        expect(login.statusCode).toBe(401);

        await app.close();
    });
});
