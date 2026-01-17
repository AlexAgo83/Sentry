export type PlayerId = string;
export type SkillId = "Combat" | "Hunting" | "Cooking" | "Excavation" | "MetalWork";
export type ActionId = SkillId;
export type RecipeId = string;
export type ItemId = string;

export interface StorageState {
    gold: number;
}

export interface RecipeState {
    id: RecipeId;
    xp: number;
    level: number;
    xpNext: number;
    maxLevel: number;
}

export interface SkillState {
    id: SkillId;
    xp: number;
    level: number;
    xpNext: number;
    maxLevel: number;
    baseInterval: number;
    selectedRecipeId: RecipeId | null;
    recipes: Record<RecipeId, RecipeState>;
}

export interface ActionProgressState {
    currentInterval: number;
    progressPercent: number;
    lastExecutionTime: number | null;
}

export interface PlayerState {
    id: PlayerId;
    name: string;
    hp: number;
    hpMax: number;
    stamina: number;
    staminaMax: number;
    storage: StorageState;
    skills: Record<SkillId, SkillState>;
    selectedActionId: ActionId | null;
    actionProgress: ActionProgressState;
    createdAt: number;
}

export interface LoopState {
    lastTick: number | null;
    lastHiddenAt: number | null;
    loopInterval: number;
    offlineInterval: number;
    offlineThreshold: number;
}

export interface GameState {
    version: string;
    players: Record<PlayerId, PlayerState>;
    activePlayerId: PlayerId | null;
    loop: LoopState;
    perf: PerformanceState;
    offlineSummary: OfflineSummaryState | null;
}

export interface SkillDefinition {
    id: SkillId;
    name: string;
    baseInterval: number;
    media?: string;
}

export interface RecipeDefinition {
    id: RecipeId;
    skillId: SkillId;
    name: string;
    media?: string;
}

export interface ActionDefinition {
    id: ActionId;
    skillId: SkillId;
    staminaCost: number;
    goldReward: number;
    xpSkill: number;
    xpRecipe: number;
    stunTime: number;
}

export type PlayerSaveState = Omit<PlayerState, "actionProgress">;

export interface PerformanceState {
    lastTickDurationMs: number;
    lastDeltaMs: number;
    lastOfflineTicks: number;
    lastOfflineDurationMs: number;
}

export interface OfflineSummaryState {
    playerId: PlayerId;
    playerName: string;
    durationMs: number;
    ticks: number;
    actionId: ActionId | null;
    recipeId: RecipeId | null;
    goldGained: number;
    skillXpGained: number;
    recipeXpGained: number;
    skillLevelGained: number;
    recipeLevelGained: number;
}

export interface GameSave {
    version: string;
    lastTick: number | null;
    activePlayerId?: PlayerId | null;
    players: Record<PlayerId, PlayerSaveState>;
}
