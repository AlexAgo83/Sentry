import { describe, expect, it, vi } from "vitest";
import { applyTick } from "../../src/core/loop";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";
import { DEFAULT_STAMINA_MAX, DEFAULT_STAMINA_REGEN, MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../../src/core/constants";
import { getRecipesForSkill } from "../../src/data/definitions";
import type { PlayerState } from "../../src/core/types";

const withBaseStats = (player: PlayerState, stats: Partial<PlayerState["stats"]["base"]>): PlayerState => ({
    ...player,
    stats: {
        ...player.stats,
        base: {
            ...player.stats.base,
            ...stats
        }
    }
});

describe("stat effects", () => {
    it("Strength reduces stamina cost for combat skills", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Combat"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Combat.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Combat",
            recipeId
        });
        state = {
            ...state,
            players: {
                ...state.players,
                [playerId]: withBaseStats(state.players[playerId], {
                    Strength: 20,
                    Endurance: 0,
                    Agility: 0,
                    Intellect: 0,
                    Luck: 0
                })
            },
            inventory: {
                ...state.inventory,
                items: {
                    ...state.inventory.items,
                    food: 1
                }
            }
        };

        const before = state.players[playerId];
        const next = applyTick(state, 1000, Date.now());
        const after = next.players[playerId];
        const regenRate = DEFAULT_STAMINA_REGEN;
        const regenAmount = Math.floor((1000 / 1000) * regenRate);
        const staminaCost = Math.ceil(10 * (1 - 20 * STAT_PERCENT_PER_POINT));
        const expectedStamina = Math.min(DEFAULT_STAMINA_MAX, before.stamina + regenAmount) - staminaCost;
        expect(after.stamina).toBe(expectedStamina);
    });

    it("Agility reduces action interval", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Hunting"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Hunting.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Hunting",
            recipeId
        });
        state = {
            ...state,
            players: {
                ...state.players,
                [playerId]: withBaseStats(state.players[playerId], {
                    Agility: 20,
                    Strength: 0,
                    Endurance: 0,
                    Intellect: 0,
                    Luck: 0
                })
            }
        };

        const next = applyTick(state, 200, Date.now());
        const baseInterval = Math.ceil(1000 * (1 - 20 * STAT_PERCENT_PER_POINT));
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const expectedProgress = (200 / actionInterval) * 100;
        expect(next.players[playerId].actionProgress.progressPercent).toBeCloseTo(expectedProgress, 2);
    });

    it("Endurance increases stamina max", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        const state = {
            ...initial,
            players: {
                ...initial.players,
                [playerId]: withBaseStats(initial.players[playerId], {
                    Endurance: 20,
                    Strength: 0,
                    Agility: 0,
                    Intellect: 0,
                    Luck: 0
                })
            }
        };

        const next = applyTick(state, 1000, Date.now());
        const expectedMax = Math.ceil(DEFAULT_STAMINA_MAX * (1 + 20 * STAT_PERCENT_PER_POINT));
        expect(next.players[playerId].staminaMax).toBe(expectedMax);
    });

    it("Intellect boosts crafting skill and recipe XP", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Cooking"
        });
        const recipeId = getRecipesForSkill("Cooking")[0]?.id ?? "";
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Cooking",
            recipeId
        });
        state = {
            ...state,
            players: {
                ...state.players,
                [playerId]: withBaseStats(state.players[playerId], {
                    Intellect: 20,
                    Strength: 0,
                    Agility: 0,
                    Endurance: 0,
                    Luck: 0
                })
            },
            inventory: {
                ...state.inventory,
                items: {
                    ...state.inventory.items,
                    meat: 1
                }
            }
        };

        const before = state.players[playerId];
        const next = applyTick(state, 1000, Date.now());
        const after = next.players[playerId];
        expect(after.skills.Cooking.xp).toBeCloseTo(before.skills.Cooking.xp + 1.2, 2);
        expect(after.skills.Cooking.recipes[recipeId].xp).toBeCloseTo(
            before.skills.Cooking.recipes[recipeId].xp + 2.4,
            2
        );
    });

    it("Luck grants rare rewards for fishing", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Fishing"
        });
        const recipeId = getRecipesForSkill("Fishing")[0]?.id ?? "";
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Fishing",
            recipeId
        });
        state = {
            ...state,
            players: {
                ...state.players,
                [playerId]: withBaseStats(state.players[playerId], {
                    Luck: 50,
                    Strength: 0,
                    Agility: 0,
                    Endurance: 0,
                    Intellect: 0
                })
            }
        };

        const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
        const next = applyTick(state, 1000, Date.now());
        randomSpy.mockRestore();

        expect(next.inventory.items.crystal).toBe(1);
    });
});
