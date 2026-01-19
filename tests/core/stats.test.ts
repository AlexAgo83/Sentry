import { describe, expect, it } from "vitest";
import { computeEffectiveStats, createPlayerStatsState, pruneExpiredModifiers, resolveEffectiveStats } from "../../src/core/stats";
import { STAT_MAX_VALUE } from "../../src/core/constants";
import type { PlayerStatsState, StatModifier } from "../../src/core/types";

describe("stats helpers", () => {
    it("computes effective stats from flat and mult modifiers", () => {
        const stats = createPlayerStatsState();
        const permanentMods: StatModifier[] = [
            { id: "mod_strength_flat", stat: "Strength", kind: "flat", value: 2, source: "test" }
        ];
        const temporaryMods: StatModifier[] = [
            { id: "mod_strength_mult", stat: "Strength", kind: "mult", value: 0.1, source: "test", expiresAt: 999 }
        ];
        const result = computeEffectiveStats({
            ...stats,
            permanentMods,
            temporaryMods
        });
        expect(result.Strength).toBeCloseTo(7.7, 3);
        expect(result.Agility).toBe(5);
    });

    it("includes extra modifiers in effective stats", () => {
        const stats = createPlayerStatsState();
        const extraModifiers: StatModifier[] = [
            { id: "gear_strength", stat: "Strength", kind: "flat", value: 3, source: "gear" }
        ];
        const result = computeEffectiveStats(stats, extraModifiers);
        expect(result.Strength).toBe(8);
    });

    it("prunes expired temporary modifiers", () => {
        const now = 1000;
        const stats: PlayerStatsState = {
            ...createPlayerStatsState(),
            temporaryMods: [
                { id: "expired", stat: "Luck", kind: "flat", value: 2, source: "test", expiresAt: 500 },
                { id: "active", stat: "Luck", kind: "flat", value: 1, source: "test", expiresAt: 1500 }
            ]
        };
        const pruned = pruneExpiredModifiers(stats, now);
        expect(pruned.temporaryMods).toHaveLength(1);
        expect(pruned.temporaryMods[0].id).toBe("active");
    });

    it("normalizes missing stats and resolves effective values", () => {
        const now = 0;
        const stats = resolveEffectiveStats(null as unknown as PlayerStatsState, now);
        expect(stats.effective.Endurance).toBe(5);
    });

    it("ignores non-finite modifier values instead of poisoning the stat", () => {
        const stats = createPlayerStatsState();
        const result = computeEffectiveStats({
            ...stats,
            permanentMods: [
                { id: "bad", stat: "Strength", kind: "flat", value: Number.NaN, source: "test" },
                { id: "good", stat: "Strength", kind: "flat", value: 2, source: "test" }
            ]
        });
        expect(result.Strength).toBe(7);
    });

    it("falls back to default base stat when base value is non-finite", () => {
        const stats = createPlayerStatsState();
        stats.base.Strength = Number.NaN;
        const result = computeEffectiveStats(stats);
        expect(result.Strength).toBe(5);
    });

    it("clamps effective stats to the configured maximum", () => {
        const stats = createPlayerStatsState();
        const huge: StatModifier = { id: "huge", stat: "Strength", kind: "flat", value: 1e9, source: "test" };
        const result = computeEffectiveStats({ ...stats, permanentMods: [huge] });
        expect(result.Strength).toBeGreaterThan(0);
        expect(result.Strength).toBeLessThanOrEqual(STAT_MAX_VALUE);
    });
});
