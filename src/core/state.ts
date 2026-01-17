import {
    ActionProgressState,
    GameSave,
    GameState,
    PlayerId,
    PlayerSaveState,
    PlayerState,
    RecipeState,
    SkillId,
    SkillState
} from "./types";
import {
    DEFAULT_GOLD,
    DEFAULT_HP_MAX,
    DEFAULT_RECIPE_XP_NEXT,
    DEFAULT_SKILL_XP_NEXT,
    DEFAULT_STAMINA_MAX,
    LOOP_INTERVAL,
    OFFLINE_INTERVAL,
    OFFLINE_THRESHOLD,
    RECIPE_MAX_LEVEL,
    SKILL_MAX_LEVEL
} from "./constants";
import { SKILL_DEFINITIONS, getRecipesForSkill } from "../data/definitions";

export const createActionProgress = (): ActionProgressState => ({
    currentInterval: 0,
    progressPercent: 0,
    lastExecutionTime: null
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

export const createPlayerState = (id: PlayerId): PlayerState => {
    const skills = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillState>>((acc, skill) => {
        acc[skill.id] = createSkillState(skill.id);
        return acc;
    }, {} as Record<SkillId, SkillState>);

    return {
        id,
        name: `Player_${id}`,
        hp: DEFAULT_HP_MAX,
        hpMax: DEFAULT_HP_MAX,
        stamina: DEFAULT_STAMINA_MAX,
        staminaMax: DEFAULT_STAMINA_MAX,
        storage: { gold: DEFAULT_GOLD },
        skills,
        selectedActionId: null,
        actionProgress: createActionProgress(),
        createdAt: Date.now()
    };
};

export const getNextPlayerId = (players: Record<PlayerId, PlayerState>): PlayerId => {
    const numericIds = Object.keys(players)
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isFinite(id));
    const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    return String(nextId);
};

export const createInitialGameState = (version: string): GameState => {
    const playerId: PlayerId = "1";
    const player = createPlayerState(playerId);
    return {
        version,
        players: { [playerId]: player },
        activePlayerId: playerId,
        loop: {
            lastTick: null,
            lastHiddenAt: null,
            loopInterval: LOOP_INTERVAL,
            offlineInterval: OFFLINE_INTERVAL,
            offlineThreshold: OFFLINE_THRESHOLD
        }
    };
};

const hydratePlayerState = (player: PlayerSaveState): PlayerState => ({
    ...player,
    actionProgress: createActionProgress()
});

export const hydrateGameState = (version: string, save?: GameSave | null): GameState => {
    const baseState = createInitialGameState(version);
    if (!save) {
        return baseState;
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

    return {
        ...baseState,
        version,
        players: Object.keys(players).length > 0 ? players : baseState.players,
        activePlayerId,
        loop: {
            ...baseState.loop,
            lastTick: save.lastTick ?? baseState.loop.lastTick
        }
    };
};

export const stripRuntimeFields = (players: Record<PlayerId, PlayerState>): Record<PlayerId, PlayerSaveState> => {
    return Object.keys(players).reduce<Record<PlayerId, PlayerSaveState>>((acc, id) => {
        const { actionProgress, ...rest } = players[id];
        acc[id] = rest;
        return acc;
    }, {});
};
