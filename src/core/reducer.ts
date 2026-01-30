import { applyTick } from "./loop";
import {
    createActionProgress,
    createPlayerState,
    getNextPlayerId,
    hydrateGameState,
    sanitizePlayerName
} from "./state";
import { RESTED_DURATION_MS, RESTED_ENDURANCE_FLAT } from "./constants";
import { getRosterSlotCost } from "./economy";
import {
    ActionId,
    EquipmentSlotId,
    GameSave,
    GameState,
    ItemId,
    OfflineSummaryState,
    PerformanceState,
    StatModifier,
    PlayerState,
    PlayerId,
    RecipeId,
    SkillId
} from "./types";
import { getRecipeDefinition, isRecipeUnlocked } from "../data/definitions";
import { getEquipmentDefinition } from "../data/equipment";
import { getSellGoldGain } from "./economy";

export type GameAction =
    | { type: "hydrate"; save: GameSave | null; version: string }
    | { type: "tick"; deltaMs: number; timestamp: number }
    | { type: "setHiddenAt"; hiddenAt: number | null }
    | { type: "setPerf"; perf: Partial<PerformanceState> }
    | { type: "setOfflineSummary"; summary: OfflineSummaryState | null }
    | { type: "grantRestedBuff"; timestamp: number }
    | { type: "setActivePlayer"; playerId: PlayerId }
    | { type: "addPlayer"; name?: string }
    | { type: "renamePlayer"; playerId: PlayerId; name: string }
    | { type: "selectAction"; playerId: PlayerId; actionId: ActionId | null }
    | { type: "selectRecipe"; playerId: PlayerId; skillId: SkillId; recipeId: RecipeId | null }
    | { type: "sellItem"; itemId: ItemId; count: number }
    | { type: "purchaseRosterSlot" }
    | { type: "equipItem"; playerId: PlayerId; itemId: ItemId }
    | { type: "unequipItem"; playerId: PlayerId; slot: EquipmentSlotId };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "hydrate":
            return hydrateGameState(action.version, action.save);
        case "tick":
            return applyTick(state, action.deltaMs, action.timestamp);
        case "setHiddenAt":
            return {
                ...state,
                loop: {
                    ...state.loop,
                    lastHiddenAt: action.hiddenAt
                }
            };
        case "setPerf":
            return {
                ...state,
                perf: {
                    ...state.perf,
                    ...action.perf
                }
            };
        case "setOfflineSummary":
            return {
                ...state,
                offlineSummary: action.summary
            };
        case "grantRestedBuff": {
            if (!Number.isFinite(action.timestamp)) {
                return state;
            }
            const expiresAt = action.timestamp + RESTED_DURATION_MS;
            const restedMod: StatModifier = {
                id: "rested",
                stat: "Endurance",
                kind: "flat",
                value: RESTED_ENDURANCE_FLAT,
                source: "Rested",
                expiresAt,
                stackKey: "rested"
            };
            const players = Object.keys(state.players).reduce<Record<PlayerId, PlayerState>>((acc, playerId) => {
                const typedPlayerId = playerId as PlayerId;
                const player = state.players[typedPlayerId];
                if (!player) {
                    return acc;
                }
                const nextMods = [
                    ...player.stats.temporaryMods.filter((mod) => mod.stackKey !== "rested"),
                    restedMod
                ];
                acc[typedPlayerId] = {
                    ...player,
                    stats: {
                        ...player.stats,
                        temporaryMods: nextMods
                    }
                };
                return acc;
            }, {} as Record<PlayerId, PlayerState>);
            return {
                ...state,
                players
            };
        }
        case "setActivePlayer":
            if (!state.players[action.playerId]) {
                return state;
            }
            return {
                ...state,
                activePlayerId: action.playerId
            };
        case "addPlayer": {
            const rosterCount = Object.keys(state.players).length;
            if (rosterCount >= state.rosterLimit) {
                return state;
            }
            const nextId = getNextPlayerId(state.players);
            const nextPlayer = createPlayerState(nextId, action.name);
            return {
                ...state,
                players: {
                    ...state.players,
                    [nextId]: nextPlayer
                },
                activePlayerId: nextId
            };
        }
        case "renamePlayer": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            const sanitized = sanitizePlayerName(action.name);
            if (!sanitized) {
                return state;
            }
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        name: sanitized
                    }
                }
            };
        }
        case "selectAction": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        selectedActionId: action.actionId,
                        actionProgress: createActionProgress()
                    }
                }
            };
        }
        case "selectRecipe": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            const skill = player.skills[action.skillId];
            if (!skill) {
                return state;
            }
            if (action.recipeId) {
                const recipeDef = getRecipeDefinition(action.skillId, action.recipeId);
                if (!recipeDef || !isRecipeUnlocked(recipeDef, skill.level)) {
                    return state;
                }
            }
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        skills: {
                            ...player.skills,
                            [action.skillId]: {
                                ...skill,
                                selectedRecipeId: action.recipeId
                            }
                        },
                        actionProgress: createActionProgress()
                    }
                }
            };
        }
        case "sellItem": {
            if (action.itemId === "gold") {
                return state;
            }
            const available = state.inventory.items[action.itemId] ?? 0;
            const sellCount = Math.min(available, Math.max(0, Math.floor(action.count)));
            if (sellCount <= 0) {
                return state;
            }
            const nextItems = { ...state.inventory.items };
            nextItems[action.itemId] = Math.max(0, available - sellCount);
            const goldGain = getSellGoldGain(action.itemId, sellCount);
            nextItems.gold = (nextItems.gold ?? 0) + goldGain;
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    items: nextItems
                }
            };
        }
        case "purchaseRosterSlot": {
            const cost = getRosterSlotCost(state.rosterLimit);
            if (!Number.isFinite(cost) || cost <= 0) {
                return state;
            }
            const gold = state.inventory.items.gold ?? 0;
            if (gold < cost) {
                return state;
            }
            return {
                ...state,
                rosterLimit: Math.max(1, Math.floor(state.rosterLimit) + 1),
                inventory: {
                    ...state.inventory,
                    items: {
                        ...state.inventory.items,
                        gold: gold - cost
                    }
                }
            };
        }
        case "equipItem": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            const definition = getEquipmentDefinition(action.itemId);
            if (!definition) {
                return state;
            }
            const available = state.inventory.items[action.itemId] ?? 0;
            if (available <= 0) {
                return state;
            }
            const slot = definition.slot;
            const currentItemId = player.equipment.slots[slot];
            if (currentItemId === action.itemId) {
                return state;
            }
            const nextCharges = slot === "Tablet"
                ? (() => {
                    const currentCharges = player.equipment.charges[slot];
                    const resolved = typeof currentCharges === "number" && currentCharges > 0
                        ? currentCharges
                        : 100;
                    return {
                        ...player.equipment.charges,
                        [slot]: resolved
                    };
                })()
                : player.equipment.charges;
            const nextItems = { ...state.inventory.items };
            nextItems[action.itemId] = Math.max(0, available - 1);
            if (currentItemId) {
                nextItems[currentItemId] = (nextItems[currentItemId] ?? 0) + 1;
            }
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    items: nextItems
                },
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        equipment: {
                            ...player.equipment,
                            slots: {
                                ...player.equipment.slots,
                                [slot]: action.itemId
                            },
                            charges: nextCharges
                        }
                    }
                }
            };
        }
        case "unequipItem": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            const currentItemId = player.equipment.slots[action.slot];
            if (!currentItemId) {
                return state;
            }
            const nextItems = { ...state.inventory.items };
            nextItems[currentItemId] = (nextItems[currentItemId] ?? 0) + 1;
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    items: nextItems
                },
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        equipment: {
                            ...player.equipment,
                            slots: {
                                ...player.equipment.slots,
                                [action.slot]: null
                            }
                        }
                    }
                }
            };
        }
        default:
            return state;
    }
};
