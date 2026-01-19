// @vitest-environment node
import { describe, expect, it } from "vitest";
import { migrateAndValidateSave } from "../../../src/adapters/persistence/saveMigrations";

const mulberry32 = (seed: number) => {
    let t = seed >>> 0;
    return () => {
        t += 0x6D2B79F5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
};

const pick = <T>(rand: () => number, items: T[]): T => items[Math.floor(rand() * items.length)]!;

const randomString = (rand: () => number) => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const len = Math.floor(rand() * 12);
    let out = "";
    for (let i = 0; i < len; i += 1) {
        out += alphabet[Math.floor(rand() * alphabet.length)]!;
    }
    return out;
};

const randomJson = (rand: () => number, depth = 0): unknown => {
    if (depth > 2) {
        return pick(rand, [null, true, false, Math.floor(rand() * 10), randomString(rand)]);
    }
    const kind = Math.floor(rand() * 6);
    if (kind === 0) return null;
    if (kind === 1) return rand() > 0.5;
    if (kind === 2) return Math.floor((rand() - 0.2) * 1000);
    if (kind === 3) return randomString(rand);
    if (kind === 4) {
        const len = Math.floor(rand() * 4);
        return Array.from({ length: len }, () => randomJson(rand, depth + 1));
    }
    const keys = Math.floor(rand() * 4);
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < keys; i += 1) {
        obj[randomString(rand) || `k${i}`] = randomJson(rand, depth + 1);
    }
    return obj;
};

describe("saveMigrations property tests", () => {
    it("never throws and preserves invariants for many corrupted inputs", () => {
        const rand = mulberry32(0xC0FFEE);
        for (let i = 0; i < 500; i += 1) {
            const input = randomJson(rand);
            expect(() => migrateAndValidateSave(input)).not.toThrow();
            const result = migrateAndValidateSave(input);
            if (!result.ok) {
                continue;
            }
            const save = result.save;
            expect(typeof save.version).toBe("string");
            expect(Object.keys(save.players).length).toBeGreaterThan(0);
            expect(save.activePlayerId === null || save.players[save.activePlayerId] !== undefined).toBe(true);
            expect(save.lastTick === null || (Number.isFinite(save.lastTick) && save.lastTick >= 0)).toBe(true);
            expect(save.lastHiddenAt === null || (Number.isFinite(save.lastHiddenAt) && save.lastHiddenAt >= 0)).toBe(true);
            const items = save.inventory?.items ?? {};
            for (const value of Object.values(items)) {
                expect(Number.isFinite(value)).toBe(true);
                expect(value).toBeGreaterThanOrEqual(0);
            }
        }
    });
});

