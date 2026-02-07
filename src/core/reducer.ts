import { applyTick } from "./loop";
import {
    createActionProgress,
    createPlayerState,
    getNextPlayerId,
    hydrateGameState,
    sanitizePlayerName
} from "./state";
import { MAX_ROSTER_LIMIT, RESTED_DURATION_MS, RESTED_ENDURANCE_FLAT } from "./constants";
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
    SkillId,
    ActionJournalEntry
} from "./types";
import { getActionDefinition, getRecipeDefinition, isRecipeUnlocked } from "../data/definitions";
import { getEquipmentDefinition } from "../data/equipment";
import { getSellGoldGain } from "./economy";
import { getDungeonDefinition } from "../data/dungeons";
import {
    getActiveDungeonRun,
    isPlayerAssignedToActiveDungeonRun,
    startDungeonRun,
    stopDungeonRun,
    updateDungeonOnboardingRequired
} from "./dungeon";
import { appendActionJournalEntry } from "./actionJournal";

const buildJournalEntryId = (timestamp: number) => {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${timestamp}-${suffix}`;
};

const createJournalEntry = (label: string, timestamp = Date.now()): ActionJournalEntry => ({
    id: buildJournalEntryId(timestamp),
    at: timestamp,
    label
});

const formatDurationMinutes = (durationMs: number): string => {
    const minutes = Math.max(0, Math.round(durationMs / 60000));
    if (minutes < 60) {
        return `${Math.max(1, minutes)}m`;
    }
    const hours = Math.round(minutes / 60);
    return `${Math.max(1, hours)}h`;
};

const formatDungeonEndReason = (reason: string | null | undefined) => {
    if (!reason) {
        return "ended";
    }
    return reason
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

export type GameAction =
    | { type: "hydrate"; save: GameSave | null; version: string }
    | { type: "tick"; deltaMs: number; timestamp: number }
    | { type: "setHiddenAt"; hiddenAt: number | null }
    | { type: "setPerf"; perf: Partial<PerformanceState> }
    | { type: "setOfflineSummary"; summary: OfflineSummaryState | null }
    | { type: "setPersistenceStatus"; status: Partial<GameState["persistence"]> }
    | { type: "grantRestedBuff"; timestamp: number }
    | { type: "setActivePlayer"; playerId: PlayerId }
    | { type: "addPlayer"; name?: string }
    | { type: "renamePlayer"; playerId: PlayerId; name: string }
    | { type: "selectAction"; playerId: PlayerId; actionId: ActionId | null }
    | { type: "selectRecipe"; playerId: PlayerId; skillId: SkillId; recipeId: RecipeId | null }
    | { type: "updateAppearance"; playerId: PlayerId; appearance: { faceIndex?: number; hairIndex?: number; hairColor?: string; skinColor?: string; showHelmet?: boolean } }
    | { type: "debugAddItem"; itemId: ItemId; count: number }
    | { type: "sellItem"; itemId: ItemId; count: number }
    | { type: "purchaseRosterSlot" }
    | { type: "equipItem"; playerId: PlayerId; itemId: ItemId }
    | { type: "unequipItem"; playerId: PlayerId; slot: EquipmentSlotId }
    | { type: "dungeonSetupSelectDungeon"; dungeonId: string }
    | { type: "dungeonSetupSetParty"; playerIds: PlayerId[] }
    | { type: "dungeonSetupSetAutoRestart"; autoRestart: boolean }
    | { type: "dungeonStartRun"; dungeonId?: string; playerIds?: PlayerId[]; timestamp?: number }
    | { type: "dungeonStopRun" };

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
            if (!action.summary) {
                return {
                    ...state,
                    offlineSummary: null
                };
            }
            return appendActionJournalEntry(
                {
                    ...state,
                    offlineSummary: action.summary
                },
                createJournalEntry(`Offline summary: ${formatDurationMinutes(action.summary.durationMs)}`)
            );
        case "setPersistenceStatus":
            return {
                ...state,
                persistence: {
                    ...state.persistence,
                    ...action.status
                }
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
            const nextState = {
                ...state,
                players: {
                    ...state.players,
                    [nextId]: nextPlayer
                },
                activePlayerId: nextId
            };
            return updateDungeonOnboardingRequired(nextState);
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
            if (action.actionId && !getActionDefinition(action.actionId)) {
                return state;
            }
            if (action.actionId && isPlayerAssignedToActiveDungeonRun(state, action.playerId)) {
                return state;
            }
            const nextState = {
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
            const actionLabel = action.actionId
                ? getActionDefinition(action.actionId)?.name ?? action.actionId
                : "None";
            if (player.selectedActionId === action.actionId) {
                return nextState;
            }
            return appendActionJournalEntry(
                nextState,
                createJournalEntry(`Action: ${player.name} -> ${actionLabel}`)
            );
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
        case "debugAddItem": {
            if (!import.meta.env.DEV && !import.meta.env.VITE_E2E) {
                return state;
            }
            const safeCount = Number.isFinite(action.count) ? Math.max(0, Math.floor(action.count)) : 0;
            if (safeCount <= 0) {
                return state;
            }
            const current = state.inventory.items[action.itemId] ?? 0;
            return {
                ...state,
                inventory: {
                    ...state.inventory,
                    items: {
                        ...state.inventory.items,
                        [action.itemId]: current + safeCount
                    }
                }
            };
        }
        case "updateAppearance": {
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
                        appearance: {
                            ...player.appearance,
                            ...action.appearance
                        }
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
            if (state.rosterLimit >= MAX_ROSTER_LIMIT) {
                return state;
            }
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
        case "dungeonSetupSelectDungeon": {
            if (!getDungeonDefinition(action.dungeonId)) {
                return state;
            }
            return {
                ...state,
                dungeon: {
                    ...state.dungeon,
                    setup: {
                        ...state.dungeon.setup,
                        selectedDungeonId: action.dungeonId
                    }
                }
            };
        }
        case "dungeonSetupSetParty": {
            const uniqueIds = Array.from(new Set(action.playerIds)).filter((id) => Boolean(state.players[id])).slice(0, 4);
            return {
                ...state,
                dungeon: {
                    ...state.dungeon,
                    setup: {
                        ...state.dungeon.setup,
                        selectedPartyPlayerIds: uniqueIds
                    }
                }
            };
        }
        case "dungeonSetupSetAutoRestart": {
            const activeRun = getActiveDungeonRun(state.dungeon);
            return {
                ...state,
                dungeon: {
                    ...state.dungeon,
                    setup: {
                        ...state.dungeon.setup,
                        autoRestart: action.autoRestart
                    },
                    runs: activeRun ? {
                        ...state.dungeon.runs,
                        [activeRun.id]: {
                            ...activeRun,
                            autoRestart: action.autoRestart
                        }
                    } : state.dungeon.runs
                }
            };
        }
        case "dungeonStartRun":
            {
                const timestamp = action.timestamp ?? Date.now();
                const nextState = startDungeonRun(
                    state,
                    action.dungeonId ?? state.dungeon.setup.selectedDungeonId,
                    action.playerIds ?? state.dungeon.setup.selectedPartyPlayerIds,
                    timestamp
                );
                const nextRunId = nextState.dungeon.activeRunId;
                if (!nextRunId || nextRunId === state.dungeon.activeRunId) {
                    return nextState;
                }
                const nextRun = nextState.dungeon.runs[nextRunId];
                const definition = nextRun ? getDungeonDefinition(nextRun.dungeonId) : null;
                const dungeonLabel = definition?.name ?? nextRun?.dungeonId ?? "Dungeon";
                return appendActionJournalEntry(
                    nextState,
                    createJournalEntry(`Dungeon started: ${dungeonLabel}`, timestamp)
                );
            }
        case "dungeonStopRun":
            {
                const activeRun = getActiveDungeonRun(state.dungeon);
                if (!activeRun) {
                    return state;
                }
                const nextState = stopDungeonRun(state, "stopped");
                const definition = getDungeonDefinition(activeRun.dungeonId);
                const dungeonLabel = definition?.name ?? activeRun.dungeonId;
                return appendActionJournalEntry(
                    nextState,
                    createJournalEntry(`Dungeon ended: ${dungeonLabel} (${formatDungeonEndReason("stopped")})`)
                );
            }
        default:
            return state;
    }
};
