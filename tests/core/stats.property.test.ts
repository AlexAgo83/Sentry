import { describe, expect, it } from "vitest";
import { STAT_MAX_VALUE } from "../../src/core/constants";
import { computeEffectiveStats, createPlayerStatsState, STAT_IDS } from "../../src/core/stats";
import type { StatId, StatModifier } from "../../src/core/types";

const mulberry32 = (seed: number) => {
    let t = seed >>> 0;
    return () => {
        t += 0x6D2B79F5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
};

const pick = <T>(rand: () => number, items: readonly T[]): T => items[Math.floor(rand() * items.length)]!;

describe("stats property tests", () => {
    it("computeEffectiveStats never returns NaN/Infinity and always clamps", () => {
        const rand = mulberry32(0xA11CE);
        const nonFinite = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        const kinds = ["flat", "mult", "bad"] as const;
        const maybeStat = () => (rand() > 0.1 ? pick(rand, STAT_IDS) : ("BadStat" as unknown as StatId));

        for (let i = 0; i < 500; i += 1) {
            const stats = createPlayerStatsState();
            STAT_IDS.forEach((id) => {
                const roll = rand();
                if (roll < 0.1) {
                    stats.base[id] = pick(rand, nonFinite);
                } else if (roll < 0.2) {
                    stats.base[id] = -Math.floor(rand() * 50);
                } else {
                    stats.base[id] = Math.floor(rand() * 100);
                }
            });

            const mods: StatModifier[] = Array.from({ length: Math.floor(rand() * 15) }, (_, idx) => {
                const kind = pick(rand, kinds);
                const valueRoll = rand();
                const value = valueRoll < 0.1
                    ? pick(rand, nonFinite)
                    : Math.floor((rand() - 0.5) * 200) / 10;
                return {
                    id: `m${i}_${idx}`,
                    stat: maybeStat(),
                    kind: kind === "bad" ? ("oops" as unknown as "flat") : kind,
                    value,
                    source: "prop"
                } as unknown as StatModifier;
            });

            const effective = computeEffectiveStats({ ...stats, permanentMods: mods });
            STAT_IDS.forEach((id) => {
                expect(Number.isFinite(effective[id])).toBe(true);
                expect(effective[id]).toBeGreaterThanOrEqual(0);
                expect(effective[id]).toBeLessThanOrEqual(STAT_MAX_VALUE);
            });
        }
    });
});
