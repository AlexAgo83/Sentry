import {
    ActionId,
    ActionProgressState,
    CombatSkillId,
    GameSave,
    GameState,
    InventoryState,
    LastNonDungeonAction,
    LastNonDungeonActionByPlayer,
    PlayerId,
    PlayerSaveState,
    PlayerState,
    ProgressionState,
    QuestProgressState,
    RecipeState,
    SkillId,
    SkillState
} from "./types";
import {
    DEFAULT_GOLD,
    DEFAULT_HP_MAX,
    DEFAULT_RECIPE_XP_NEXT,
    DEFAULT_ROSTER_LIMIT,
    DEFAULT_SKILL_XP_NEXT,
    DEFAULT_STAMINA_MAX,
    LOOP_INTERVAL,
    OFFLINE_INTERVAL,
    OFFLINE_THRESHOLD,
    RECIPE_MAX_LEVEL,
    SKILL_MAX_LEVEL,
    XP_NEXT_MULTIPLIER
} from "./constants";
import { SKILL_DEFINITIONS, getActionDefinition, getRecipeDefinition, getRecipesForSkill } from "../data/definitions";
import { createPlayerStatsState, normalizePlayerStats } from "./stats";
import { createPlayerEquipmentState, normalizePlayerEquipment } from "./equipment";
import { createProgressionState, normalizeProgressionState } from "./progression";
import { createDungeonState, normalizeDungeonState } from "./dungeon";

export const createActionProgress = (): ActionProgressState => ({
    currentInterval: 0,
    progressPercent: 0,
    lastExecutionTime: null
});

const createInventoryState = (gold: number): InventoryState => ({
    items: {
        gold
    }
});

const createQuestProgressState = (): QuestProgressState => ({
    craftCounts: {},
    itemCounts: {},
    itemCountsBySkill: {},
    completed: {}
});

const normalizeQuestProgressState = (quests?: QuestProgressState | null): QuestProgressState => ({
    craftCounts: quests?.craftCounts ?? {},
    itemCounts: quests?.itemCounts ?? {},
    itemCountsBySkill: quests?.itemCountsBySkill ?? {},
    completed: quests?.completed ?? {}
});

const createRecipeState = (id: string): RecipeState => ({
    id,
    xp: 0,
    level: 1,
    xpNext: DEFAULT_RECIPE_XP_NEXT,
    maxLevel: RECIPE_MAX_LEVEL
});

const createSkillState = (id: SkillId): SkillState => {
    const recipes = getRecipesForSkill(id).reduce<Record<string, RecipeState>>((acc, recipe) => {
        acc[recipe.id] = createRecipeState(recipe.id);
        return acc;
    }, {});

    return {
        id,
        xp: 0,
        level: 1,
        xpNext: DEFAULT_SKILL_XP_NEXT,
        maxLevel: SKILL_MAX_LEVEL,
        baseInterval: SKILL_DEFINITIONS.find((skill) => skill.id === id)?.baseInterval ?? 1000,
        selectedRecipeId: null,
        recipes
    };
};

const COMBAT_SKILL_IDS: CombatSkillId[] = ["CombatMelee", "CombatRanged", "CombatMagic"];

const splitXpEvenly = (total: number, parts: number): number[] => {
    const safeTotal = Math.max(0, Math.floor(total));
    const safeParts = Math.max(1, Math.floor(parts));
    const base = Math.floor(safeTotal / safeParts);
    const remainder = safeTotal - base * safeParts;
    return Array.from({ length: safeParts }, (_, index) => base + (index < remainder ? 1 : 0));
};

const computeTotalSkillXp = (level: number, xp: number): number => {
    const safeLevel = Math.max(1, Math.floor(level));
    let total = Math.max(0, Math.floor(xp));
    let xpNext = DEFAULT_SKILL_XP_NEXT;
    let currentLevel = 1;
    while (currentLevel < safeLevel) {
        total += xpNext;
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
        currentLevel += 1;
    }
    return total;
};

const buildSkillProgressFromXp = (xp: number): Pick<SkillState, "xp" | "level" | "xpNext"> => {
    let remaining = Math.max(0, Math.floor(xp));
    let level = 1;
    let xpNext = DEFAULT_SKILL_XP_NEXT;
    while (remaining >= xpNext && level < SKILL_MAX_LEVEL) {
        remaining -= xpNext;
        level += 1;
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
    }
    return { xp: remaining, level, xpNext };
};

const splitLegacyCombatProgress = (legacySkill?: SkillState) => {
    if (!legacySkill) {
        return null;
    }
    const totalXp = computeTotalSkillXp(legacySkill.level, legacySkill.xp);
    const splits = splitXpEvenly(totalXp, COMBAT_SKILL_IDS.length);
    return COMBAT_SKILL_IDS.reduce<Record<CombatSkillId, Pick<SkillState, "xp" | "level" | "xpNext">>>((acc, id, index) => {
        acc[id] = buildSkillProgressFromXp(splits[index] ?? 0);
        return acc;
    }, {} as Record<CombatSkillId, Pick<SkillState, "xp" | "level" | "xpNext">>);
};

const mergeRecipes = (skillId: SkillId, savedRecipes: Record<string, RecipeState> | undefined) => {
    const normalizedSaved = Object.values(savedRecipes ?? {}).reduce<Record<string, RecipeState>>((acc, recipe) => {
        acc[recipe.id] = { ...recipe };
        return acc;
    }, {});
    return getRecipesForSkill(skillId).reduce<Record<string, RecipeState>>((acc, recipe) => {
        acc[recipe.id] = normalizedSaved[recipe.id] ?? createRecipeState(recipe.id);
        return acc;
    }, {});
};

const normalizeSkillState = (skillId: SkillId, savedSkill?: SkillState): SkillState => {
    const fallback = createSkillState(skillId);
    const baseSkill = savedSkill ?? fallback;
    const mergedRecipes = mergeRecipes(skillId, savedSkill?.recipes);
    const selectedRecipeId = savedSkill?.selectedRecipeId ?? null;
    const resolvedSelected = selectedRecipeId && mergedRecipes[selectedRecipeId] ? selectedRecipeId : null;

    return {
        ...baseSkill,
        id: skillId,
        baseInterval: SKILL_DEFINITIONS.find((skill) => skill.id === skillId)?.baseInterval ?? 1000,
        selectedRecipeId: resolvedSelected,
        recipes: mergedRecipes
    };
};

const normalizeSelectedActionId = (selectedActionId: unknown): ActionId | null => {
    if (selectedActionId === "Combat"
        || selectedActionId === "CombatMelee"
        || selectedActionId === "CombatRanged"
        || selectedActionId === "CombatMagic") {
        return "Roaming";
    }
    if (typeof selectedActionId !== "string") {
        return null;
    }
    return getActionDefinition(selectedActionId as ActionId)
        ? (selectedActionId as ActionId)
        : null;
};

export const sanitizePlayerName = (name?: string): string | null => {
    const trimmed = name?.trim() ?? "";
    if (trimmed.length === 0) {
        return null;
    }
    return trimmed.slice(0, 20);
};

export const createPlayerState = (id: PlayerId, name?: string): PlayerState => {
    const skills = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillState>>((acc, skill) => {
        acc[skill.id] = createSkillState(skill.id);
        return acc;
    }, {} as Record<SkillId, SkillState>);

    const resolvedName = sanitizePlayerName(name);

    return {
        id,
        name: resolvedName ?? `Player_${id}`,
        hp: DEFAULT_HP_MAX,
        hpMax: DEFAULT_HP_MAX,
        stamina: DEFAULT_STAMINA_MAX,
        staminaMax: DEFAULT_STAMINA_MAX,
        stats: createPlayerStatsState(),
        equipment: createPlayerEquipmentState(),
        skills,
        progression: createProgressionState(Date.now()),
        selectedActionId: null,
        actionProgress: createActionProgress(),
        createdAt: Date.now(),
        appearance: {
            showHelmet: true
        }
    };
};

export const getNextPlayerId = (players: Record<PlayerId, PlayerState>): PlayerId => {
    const numericIds = Object.keys(players)
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isFinite(id));
    const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    return String(nextId);
};

type InitialGameStateOptions = {
    seedHero?: boolean;
};

export const createInitialGameState = (version: string, options: InitialGameStateOptions = {}): GameState => {
    const seedHero = options.seedHero ?? true;
    const playerId: PlayerId = "1";
    const player = seedHero ? createPlayerState(playerId) : null;
    const initialRosterLimit = seedHero ? DEFAULT_ROSTER_LIMIT : Math.max(DEFAULT_ROSTER_LIMIT, 4);
    const dungeon = createDungeonState();
    dungeon.onboardingRequired = !seedHero;
    const rosterOrder = player ? [playerId] : [];

    return {
        version,
        appReady: false,
        actionJournal: [],
        lastNonDungeonActionByPlayer: {},
        players: player ? { [playerId]: player } : {},
        activePlayerId: player ? playerId : null,
        rosterOrder,
        rosterLimit: initialRosterLimit,
        inventory: createInventoryState(DEFAULT_GOLD),
        quests: createQuestProgressState(),
        loop: {
            lastTick: null,
            lastHiddenAt: null,
            loopInterval: LOOP_INTERVAL,
            offlineInterval: OFFLINE_INTERVAL,
            offlineThreshold: OFFLINE_THRESHOLD
        },
        progression: createProgressionState(Date.now()),
        perf: {
            lastTickDurationMs: 0,
            lastDeltaMs: 0,
            lastDriftMs: 0,
            driftEmaMs: 0,
            lastOfflineTicks: 0,
            lastOfflineDurationMs: 0
        },
        persistence: {
            disabled: false,
            error: null,
            lastFailureAt: null
        },
        offlineSummary: null,
        lastTickSummary: null,
        dungeon
    };
};

const normalizeLastNonDungeonActionEntry = (value: unknown): LastNonDungeonAction | null => {
    if (!value || typeof value !== "object") {
        return null;
    }
    const skillId = (value as LastNonDungeonAction).skillId;
    const recipeId = (value as LastNonDungeonAction).recipeId;
    if (!skillId || !recipeId) {
        return null;
    }
    if (!getActionDefinition(skillId)) {
        return null;
    }
    const recipeDef = getRecipeDefinition(skillId, recipeId);
    if (!recipeDef) {
        return null;
    }
    return { skillId, recipeId };
};

const normalizeLastNonDungeonActionByPlayer = (
    value: GameSave["lastNonDungeonActionByPlayer"] | GameSave["lastNonDungeonAction"] | null | undefined,
    players: Record<PlayerId, PlayerState>,
    activePlayerId: PlayerId | null
): LastNonDungeonActionByPlayer => {
    if (!value || typeof value !== "object") {
        return {};
    }

    if ("skillId" in value || "recipeId" in value) {
        const legacy = normalizeLastNonDungeonActionEntry(value);
        if (legacy && activePlayerId && players[activePlayerId]) {
            return { [activePlayerId]: legacy };
        }
        return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce<LastNonDungeonActionByPlayer>(
        (acc, [playerId, entry]) => {
            if (!players[playerId as PlayerId]) {
                return acc;
            }
            const normalized = normalizeLastNonDungeonActionEntry(entry);
            if (normalized) {
                acc[playerId as PlayerId] = normalized;
            }
            return acc;
        },
        {}
    );
};

const hydratePlayerState = (player: PlayerSaveState): PlayerState => {
    const { storage, skills, ...rest } = player as PlayerSaveState & {
        storage?: { gold?: number };
        skills?: Record<string, SkillState>;
    };
    const savedSkills = skills ?? {};
    const hasRoamingSkillInSave = Boolean(savedSkills && "Roaming" in savedSkills);
    const hasCombatSplitSkills = Boolean(
        savedSkills
        && ("CombatMelee" in savedSkills || "CombatRanged" in savedSkills || "CombatMagic" in savedSkills)
    );
    const legacyCombatProgress = !hasCombatSplitSkills
        ? splitLegacyCombatProgress(savedSkills.Combat)
        : null;
    const progression = normalizeProgressionState(
        (player as PlayerSaveState & { progression?: ProgressionState }).progression,
        Date.now()
    );
    const normalizedSkills = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillState>>((acc, skill) => {
        const combatProgress = legacyCombatProgress?.[skill.id as CombatSkillId];
        if (combatProgress) {
            const baseSkill = createSkillState(skill.id);
            acc[skill.id] = {
                ...baseSkill,
                ...combatProgress
            };
            return acc;
        }
        const shouldResetRoaming = skill.id === "Roaming" && !hasRoamingSkillInSave;
        acc[skill.id] = shouldResetRoaming
            ? createSkillState(skill.id)
            : normalizeSkillState(skill.id, savedSkills[skill.id]);
        return acc;
    }, {} as Record<SkillId, SkillState>);
    return {
        ...rest,
        appearance: {
            showHelmet: true,
            ...player.appearance
        },
        stats: normalizePlayerStats(player.stats),
        equipment: normalizePlayerEquipment(player.equipment),
        skills: normalizedSkills,
        progression,
        selectedActionId: normalizeSelectedActionId(rest.selectedActionId),
        actionProgress: createActionProgress()
    };
};

const resolveInventory = (
    inventory: InventoryState | undefined,
    players: Record<PlayerId, PlayerSaveState>
): InventoryState => {
    const legacyGold = Object.values(players).reduce((acc, player) => {
        const candidate = (player as PlayerSaveState & { storage?: { gold?: number } }).storage?.gold ?? 0;
        return acc + (Number.isFinite(candidate) ? candidate : 0);
    }, 0);
    const nextItems: Record<string, number> = {};
    if (inventory?.items) {
        Object.entries(inventory.items).forEach(([key, value]) => {
            const numeric = Number(value);
            if (Number.isFinite(numeric)) {
                nextItems[key] = Math.max(0, Math.floor(numeric));
            }
        });
    }
    if (nextItems.gold === undefined) {
        nextItems.gold = legacyGold;
    }
    return { items: nextItems };
};

export const normalizeRosterOrder = (
    players: Record<PlayerId, PlayerState>,
    rosterOrder?: PlayerId[] | null
): PlayerId[] => {
    const playerIds = Object.keys(players) as PlayerId[];
    const sortedIds = playerIds.slice().sort((a, b) => Number(a) - Number(b));
    const seen = new Set<PlayerId>();
    const normalized: PlayerId[] = [];
    if (Array.isArray(rosterOrder)) {
        rosterOrder.forEach((id) => {
            const normalizedId = String(id) as PlayerId;
            if (!players[normalizedId]) {
                return;
            }
            if (seen.has(normalizedId)) {
                return;
            }
            seen.add(normalizedId);
            normalized.push(normalizedId);
        });
    }
    sortedIds.forEach((id) => {
        if (seen.has(id)) {
            return;
        }
        seen.add(id);
        normalized.push(id);
    });
    return normalized;
};

export const hydrateGameState = (version: string, save?: GameSave | null): GameState => {
    const baseState = createInitialGameState(version, { seedHero: false });
    if (!save) {
        return {
            ...baseState,
            appReady: true,
            actionJournal: []
        };
    }

    const players = Object.keys(save.players ?? {}).reduce<Record<PlayerId, PlayerState>>((acc, id) => {
        const player = save.players[id];
        if (player) {
            acc[id] = hydratePlayerState(player);
        }
        return acc;
    }, {});

    const playerIds = Object.keys(players);
    const activePlayerId = save.activePlayerId && players[save.activePlayerId]
        ? save.activePlayerId
        : playerIds.length > 0
            ? playerIds[0]
            : baseState.activePlayerId;

    const rawPlayers = save.players ?? {};
    const inventory = save.inventory || Object.keys(rawPlayers).length > 0
        ? resolveInventory(save.inventory, rawPlayers)
        : baseState.inventory;
    const resolvedRosterLimit = Number.isFinite(save.rosterLimit)
        ? Math.max(1, Math.floor(save.rosterLimit ?? baseState.rosterLimit))
        : baseState.rosterLimit;
    const rosterLimit = Math.max(resolvedRosterLimit, playerIds.length);
    const dungeon = normalizeDungeonState(save.dungeon);
    if (!save.dungeon) {
        dungeon.onboardingRequired = false;
    }
    if (playerIds.length >= 4) {
        dungeon.onboardingRequired = false;
    }

    const resolvedPlayers = Object.keys(players).length > 0 ? players : baseState.players;
    const rosterOrder = normalizeRosterOrder(resolvedPlayers, save.rosterOrder);

    return {
        ...baseState,
        version,
        players: resolvedPlayers,
        activePlayerId,
        rosterOrder,
        lastNonDungeonActionByPlayer: normalizeLastNonDungeonActionByPlayer(
            save.lastNonDungeonActionByPlayer ?? save.lastNonDungeonAction,
            players,
            activePlayerId
        ),
        rosterLimit,
        inventory,
        quests: normalizeQuestProgressState(save.quests),
        loop: {
            ...baseState.loop,
            lastTick: save.lastTick ?? baseState.loop.lastTick,
            lastHiddenAt: save.lastHiddenAt ?? baseState.loop.lastHiddenAt
        },
        progression: normalizeProgressionState(save.progression, Date.now()),
        persistence: baseState.persistence,
        offlineSummary: null,
        lastTickSummary: null,
        dungeon,
        appReady: true,
        actionJournal: []
    };
};

export const stripRuntimeFields = (players: Record<PlayerId, PlayerState>): Record<PlayerId, PlayerSaveState> => {
    return Object.keys(players).reduce<Record<PlayerId, PlayerSaveState>>((acc, id) => {
        const { actionProgress, ...rest } = players[id];
        acc[id] = rest;
        return acc;
    }, {});
};
