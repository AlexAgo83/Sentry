// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";

const buildMockPrisma = () => {
    const db = {
        users: [] as Array<{
            id: string;
            email: string;
            passwordHash: string;
            username: string | null;
            usernameCanonical: string | null;
            createdAt: Date;
        }>,
        saves: [] as Array<{
            id: string;
            userId: string;
            payload: unknown;
            virtualScore: number;
            appVersion: string;
            createdAt: Date;
            updatedAt: Date;
        }>,
        refreshTokens: [] as Array<{
            id: string;
            userId: string;
            tokenHash: string;
            expiresAt: Date;
            revokedAt: Date | null;
            createdAt: Date;
        }>,
        rateLimits: [] as Array<{
            id: string;
            key: string;
            route: string;
            count: number;
            resetAt: Date;
            createdAt: Date;
            updatedAt: Date;
        }>
    };

    let userCounter = 1;
    let saveCounter = 1;
    let refreshCounter = 1;
    let rateLimitCounter = 1;

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
            findFirst: async ({ where }: { where: { usernameCanonical?: string; id?: { not?: string } } }) => {
                const candidate = db.users.find((user) => {
                    if (typeof where.usernameCanonical === "string" && user.usernameCanonical !== where.usernameCanonical) {
                        return false;
                    }
                    if (where.id?.not && user.id === where.id.not) {
                        return false;
                    }
                    return true;
                });
                return candidate ?? null;
            },
            create: async ({ data }: { data: { email: string; passwordHash: string } }) => {
                const user = {
                    id: `user_${userCounter++}`,
                    email: data.email,
                    passwordHash: data.passwordHash,
                    username: null,
                    usernameCanonical: null,
                    createdAt: new Date()
                };
                db.users.push(user);
                return user;
            },
            update: async ({
                where,
                data
            }: {
                where: { id: string };
                data: { username?: string | null; usernameCanonical?: string | null };
            }) => {
                const user = db.users.find((entry) => entry.id === where.id);
                if (!user) {
                    throw new Error("User not found");
                }
                if ("username" in data) {
                    user.username = data.username ?? null;
                }
                if ("usernameCanonical" in data) {
                    user.usernameCanonical = data.usernameCanonical ?? null;
                }
                return user;
            }
        },
        save: {
            findUnique: async ({ where }: { where: { userId: string } }) => {
                return db.saves.find((s) => s.userId === where.userId) ?? null;
            },
            findMany: async ({
                skip = 0,
                take = db.saves.length,
                include
            }: {
                skip?: number;
                take?: number;
                orderBy?: Array<{ virtualScore?: "desc" | "asc"; updatedAt?: "desc" | "asc"; id?: "desc" | "asc" }>;
                include?: { user?: { select?: { id?: boolean; email?: boolean; username?: boolean } } };
            }) => {
                const ordered = [...db.saves].sort((a, b) => {
                    if (a.virtualScore !== b.virtualScore) {
                        return b.virtualScore - a.virtualScore;
                    }
                    if (a.updatedAt.getTime() !== b.updatedAt.getTime()) {
                        return b.updatedAt.getTime() - a.updatedAt.getTime();
                    }
                    return a.id.localeCompare(b.id);
                });
                const sliced = ordered.slice(skip, skip + take);
                if (!include?.user) {
                    return sliced;
                }
                return sliced.map((save) => ({
                    ...save,
                    user: db.users.find((entry) => entry.id === save.userId) ?? {
                        id: save.userId,
                        email: "unknown@example.com",
                        passwordHash: "",
                        username: null,
                        usernameCanonical: null,
                        createdAt: new Date(0)
                    }
                }));
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
        refreshToken: {
            findUnique: async ({ where }: { where: { tokenHash?: string; id?: string } }) => {
                if (where.tokenHash) {
                    return db.refreshTokens.find((entry) => entry.tokenHash === where.tokenHash) ?? null;
                }
                if (where.id) {
                    return db.refreshTokens.find((entry) => entry.id === where.id) ?? null;
                }
                return null;
            },
            create: async ({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => {
                const record = {
                    id: `refresh_${refreshCounter++}`,
                    userId: data.userId,
                    tokenHash: data.tokenHash,
                    expiresAt: data.expiresAt,
                    revokedAt: null,
                    createdAt: new Date()
                };
                db.refreshTokens.push(record);
                return record;
            },
            update: async ({ where, data }: { where: { tokenHash?: string; id?: string }; data: { revokedAt?: Date | null } }) => {
                const record = where.tokenHash
                    ? db.refreshTokens.find((entry) => entry.tokenHash === where.tokenHash)
                    : db.refreshTokens.find((entry) => entry.id === where.id);
                if (!record) {
                    throw new Error("Refresh token not found");
                }
                if ("revokedAt" in data) {
                    record.revokedAt = data.revokedAt ?? null;
                }
                return record;
            }
        },
        rateLimit: {
            findUnique: async ({ where }: { where: { key_route: { key: string; route: string } } }) => {
                const { key, route } = where.key_route;
                return db.rateLimits.find((entry) => entry.key === key && entry.route === route) ?? null;
            },
            upsert: async ({ where, create, update }: {
                where: { key_route: { key: string; route: string } };
                create: { key: string; route: string; count: number; resetAt: Date };
                update: { count: number; resetAt: Date };
            }) => {
                const existing = db.rateLimits.find(
                    (entry) => entry.key === where.key_route.key && entry.route === where.key_route.route
                );
                if (existing) {
                    existing.count = update.count;
                    existing.resetAt = update.resetAt;
                    existing.updatedAt = new Date();
                    return existing;
                }
                const record = {
                    id: `limit_${rateLimitCounter++}`,
                    key: create.key,
                    route: create.route,
                    count: create.count,
                    resetAt: create.resetAt,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                db.rateLimits.push(record);
                return record;
            },
            update: async ({ where, data }: { where: { key_route: { key: string; route: string } }; data: { count: { increment: number } } }) => {
                const record = db.rateLimits.find(
                    (entry) => entry.key === where.key_route.key && entry.route === where.key_route.route
                );
                if (!record) {
                    throw new Error("Rate limit not found");
                }
                record.count += data.count.increment;
                record.updatedAt = new Date();
                return record;
            }
        },
        $transaction: async (fn: (client: any) => Promise<any>) => fn(prisma),
        $disconnect: async () => {}
    };

    return prisma;
};

const getCookiesFromResponse = (response: { headers: Record<string, string | string[] | undefined> }) => {
    const setCookie = response.headers["set-cookie"];
    if (!setCookie) {
        return {} as Record<string, string>;
    }
    const entries = Array.isArray(setCookie) ? setCookie : [setCookie];
    return entries.reduce<Record<string, string>>((acc, entry) => {
        const [pair] = entry.split(";");
        const [name, value] = pair.split("=");
        if (name && value !== undefined) {
            acc[name] = value;
        }
        return acc;
    }, {});
};

const getCookieHeader = (response: { headers: Record<string, string | string[] | undefined> }) => {
    const cookies = getCookiesFromResponse(response);
    return Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ");
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

        const cookies = getCookiesFromResponse(register);
        const cookieHeader = getCookieHeader(register);
        const refreshed = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: { cookie: cookieHeader, "x-csrf-token": cookies.refreshCsrf }
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

    it("rotates refresh tokens and rejects reuse", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const register = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "rotate@example.com", password: "password123" }
        });
        expect(register.statusCode).toBe(200);

        const initialCookies = getCookiesFromResponse(register);
        const initialCookieHeader = getCookieHeader(register);

        const refreshed = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: { cookie: initialCookieHeader, "x-csrf-token": initialCookies.refreshCsrf }
        });
        expect(refreshed.statusCode).toBe(200);

        const reused = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: { cookie: initialCookieHeader, "x-csrf-token": initialCookies.refreshCsrf }
        });
        expect(reused.statusCode).toBe(401);

        const rotatedCookies = getCookiesFromResponse(refreshed);
        const rotatedHeader = getCookieHeader(refreshed);
        const rotated = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: { cookie: rotatedHeader, "x-csrf-token": rotatedCookies.refreshCsrf }
        });
        expect(rotated.statusCode).toBe(200);

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

    it("rejects unauthorized save access", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const latest = await app.inject({
            method: "GET",
            url: "/api/v1/saves/latest"
        });
        expect(latest.statusCode).toBe(401);

        const saveResponse = await app.inject({
            method: "PUT",
            url: "/api/v1/saves/latest",
            payload: {
                payload: { version: "0.8.11" },
                virtualScore: 1,
                appVersion: "0.8.11"
            }
        });
        expect(saveResponse.statusCode).toBe(401);

        await app.close();
    });

    it("accepts csrf header on CORS preflight for refresh", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const preflight = await app.inject({
            method: "OPTIONS",
            url: "/api/v1/auth/refresh",
            headers: {
                origin: "http://localhost:5173",
                "access-control-request-method": "POST",
                "access-control-request-headers": "x-csrf-token,content-type"
            }
        });

        expect(preflight.statusCode).toBe(204);
        expect(String(preflight.headers["access-control-allow-origin"] ?? "")).toBe("http://localhost:5173");
        expect(String(preflight.headers["access-control-allow-headers"] ?? "").toLowerCase()).toContain("x-csrf-token");

        await app.close();
    });

    it("rejects invalid save payloads", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const register = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "badpayload@example.com", password: "password123" }
        });
        const { accessToken } = register.json();

        const saveResponse = await app.inject({
            method: "PUT",
            url: "/api/v1/saves/latest",
            headers: { Authorization: `Bearer ${accessToken}` },
            payload: {
                payload: { version: "0.8.11" },
                virtualScore: 1,
                appVersion: "0.8.11"
            }
        });
        expect(saveResponse.statusCode).toBe(400);
        expect(saveResponse.body).toContain("players");

        await app.close();
    });

    it("enforces payload size limits", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const register = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "oversize@example.com", password: "password123" }
        });
        const { accessToken } = register.json();

        const oversized = "a".repeat(2 * 1024 * 1024 + 1024);
        const saveResponse = await app.inject({
            method: "PUT",
            url: "/api/v1/saves/latest",
            headers: { Authorization: `Bearer ${accessToken}` },
            payload: {
                payload: { blob: oversized },
                virtualScore: 1,
                appVersion: "0.8.11"
            }
        });
        expect(saveResponse.statusCode).toBe(413);

        await app.close();
    });

    it("updates cloud username with validation and uniqueness checks", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const firstUser = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "first@example.com", password: "password123" }
        });
        const secondUser = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: { email: "second@example.com", password: "password123" }
        });
        const firstToken = firstUser.json().accessToken;
        const secondToken = secondUser.json().accessToken;

        const setUsername = await app.inject({
            method: "PATCH",
            url: "/api/v1/users/me/profile",
            headers: { Authorization: `Bearer ${firstToken}` },
            payload: { username: "Aegis01" }
        });
        expect(setUsername.statusCode).toBe(200);
        expect(setUsername.json().profile.username).toBe("Aegis01");
        expect(setUsername.json().profile.displayName).toBe("Aegis01");

        const profile = await app.inject({
            method: "GET",
            url: "/api/v1/users/me/profile",
            headers: { Authorization: `Bearer ${firstToken}` }
        });
        expect(profile.statusCode).toBe(200);
        expect(profile.json().profile.displayName).toBe("Aegis01");

        const duplicateUsername = await app.inject({
            method: "PATCH",
            url: "/api/v1/users/me/profile",
            headers: { Authorization: `Bearer ${secondToken}` },
            payload: { username: "aegis01" }
        });
        expect(duplicateUsername.statusCode).toBe(409);

        const invalidChars = await app.inject({
            method: "PATCH",
            url: "/api/v1/users/me/profile",
            headers: { Authorization: `Bearer ${secondToken}` },
            payload: { username: "bad name!" }
        });
        expect(invalidChars.statusCode).toBe(400);

        const tooLong = await app.inject({
            method: "PATCH",
            url: "/api/v1/users/me/profile",
            headers: { Authorization: `Bearer ${secondToken}` },
            payload: { username: "ABCDEFGHIJKLMNOPQ" }
        });
        expect(tooLong.statusCode).toBe(400);

        const clearUsername = await app.inject({
            method: "PATCH",
            url: "/api/v1/users/me/profile",
            headers: { Authorization: `Bearer ${firstToken}` },
            payload: { username: "   " }
        });
        expect(clearUsername.statusCode).toBe(200);
        expect(clearUsername.json().profile.username).toBeNull();
        expect(clearUsername.json().profile.displayName).toBe("f***t@example.com");

        await app.close();
    });

    it("returns leaderboard sorted by score with masked fallback, app version, and tie marker", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        const registerAndSave = async (email: string, score: number, appVersion: string, username?: string) => {
            const register = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: { email, password: "password123" }
            });
            const token = register.json().accessToken as string;
            if (username) {
                await app.inject({
                    method: "PATCH",
                    url: "/api/v1/users/me/profile",
                    headers: { Authorization: `Bearer ${token}` },
                    payload: { username }
                });
            }
            await app.inject({
                method: "PUT",
                url: "/api/v1/saves/latest",
                headers: { Authorization: `Bearer ${token}` },
                payload: {
                    payload: { version: appVersion, players: { "1": { id: "1" } } },
                    virtualScore: score,
                    appVersion
                }
            });
        };

        await registerAndSave("top@example.com", 2000, "0.9.27", "TopDog");
        await registerAndSave("tie@example.com", 1500, "0.9.26");
        await registerAndSave("tie2@example.com", 1500, "0.9.25");
        await registerAndSave("low@example.com", 250, "0.9.24");

        const firstPage = await app.inject({
            method: "GET",
            url: "/api/v1/leaderboard?page=1&perPage=2"
        });

        expect(firstPage.statusCode).toBe(200);
        const firstPayload = firstPage.json();
        expect(firstPayload.page).toBe(1);
        expect(firstPayload.perPage).toBe(2);
        expect(firstPayload.hasNextPage).toBe(true);
        expect(firstPayload.items).toHaveLength(2);
        expect(firstPayload.items[0].displayName).toBe("TopDog");
        expect(firstPayload.items[0].virtualScore).toBe(2000);
        expect(firstPayload.items[0].appVersion).toBe("0.9.27");
        expect(firstPayload.items[1].displayName).toBe("t**2@example.com");
        expect(firstPayload.items[1].isExAequo).toBe(true);

        const secondPage = await app.inject({
            method: "GET",
            url: "/api/v1/leaderboard?page=2&perPage=2"
        });
        expect(secondPage.statusCode).toBe(200);
        const secondPayload = secondPage.json();
        expect(secondPayload.items).toHaveLength(2);
        expect(secondPayload.items[0].isExAequo).toBe(true);
        expect(secondPayload.items[1].virtualScore).toBe(250);
        expect(secondPayload.hasNextPage).toBe(false);

        await app.close();
    });

    it("rate limits auth endpoints", async () => {
        const prisma = buildMockPrisma();
        const { buildServer } = await loadServer();
        const app = buildServer({ prismaClient: prisma, logger: false });

        let status = 0;
        for (let i = 0; i < 21; i += 1) {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                remoteAddress: "127.0.0.1",
                payload: { email: `limit_${i}@example.com`, password: "password123" }
            });
            status = response.statusCode;
            if (i < 20) {
                expect(response.statusCode).toBe(200);
            }
        }
        expect(status).toBe(429);

        await app.close();
    });
});
