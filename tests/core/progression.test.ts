import { describe, expect, it } from "vitest";
import { applyTick } from "../../src/core/loop";
import { createInitialGameState } from "../../src/core/state";
import { gameReducer } from "../../src/core/reducer";
import { getDayKey, buildRollingDayKeys, applyProgressionDelta, createProgressionState } from "../../src/core/progression";
import { DEFAULT_STAT_BASE, MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../../src/core/constants";

describe("progression tracking", () => {
    it("builds rolling day keys including today", () => {
        const now = new Date(2025, 0, 15, 12, 0, 0).getTime();
        const keys = buildRollingDayKeys(now);
        expect(keys).toHaveLength(7);
        expect(keys[keys.length - 1]).toBe(getDayKey(now));
    });

    it("applies progression deltas to the current bucket", () => {
        const now = new Date(2025, 0, 15, 12, 0, 0).getTime();
        const state = createProgressionState(now);
        const next = applyProgressionDelta(
            state,
            {
                xp: 100,
                gold: 25,
                activeMs: 5000,
                idleMs: 0,
                skillActiveMs: { Hunting: 5000 }
            },
            now
        );
        const bucket = next.buckets.find((entry) => entry.dayKey === getDayKey(now));
        expect(bucket?.xp).toBe(100);
        expect(bucket?.gold).toBe(25);
        expect(bucket?.activeMs).toBe(5000);
        expect(bucket?.skillActiveMs.Hunting).toBe(5000);
    });

    it("tracks xp, gold, and active time during ticks", () => {
        const initial = createInitialGameState("0.3.1");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Roaming"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Roaming.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Roaming",
            recipeId
        });
        state = {
            ...state,
            inventory: {
                ...state.inventory,
                items: {
                    ...state.inventory.items,
                    food: 1
                }
            }
        };

        const baseInterval = Math.ceil(
            state.players[playerId].skills.Roaming.baseInterval * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT)
        );
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const now = Date.now();
        const next = applyTick(state, actionInterval, now);
        const bucket = next.progression.buckets.find((entry) => entry.dayKey === getDayKey(now));
        expect(bucket?.xp ?? 0).toBeGreaterThan(0);
        expect(bucket?.gold ?? 0).toBeGreaterThan(0);
        expect(bucket?.activeMs ?? 0).toBeGreaterThan(0);
        expect(bucket?.skillActiveMs.Roaming ?? 0).toBeGreaterThan(0);
    });
});
