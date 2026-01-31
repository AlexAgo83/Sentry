export type PlayerId = string;
export type SkillId =
    | "Combat"
    | "Hunting"
    | "Cooking"
    | "Excavation"
    | "MetalWork"
    | "Alchemy"
    | "Herbalism"
    | "Tailoring"
    | "Fishing"
    | "Carpentry"
    | "Leatherworking"
    | "Invocation";
export type ActionId = SkillId;
export type RecipeId = string;
export type ItemId = string;
export type QuestId = string;
export type StatId = "Strength" | "Agility" | "Endurance" | "Intellect" | "Luck";
export type EquipmentSlotId =
    | "Head"
    | "Cape"
    | "Torso"
    | "Legs"
    | "Hands"
    | "Feet"
    | "Ring"
    | "Amulet"
    | "Weapon"
    | "Tablet";
export type WeaponType = "Melee" | "Ranged" | "Magic";

export interface StatModifier {
    id: string;
    stat: StatId;
    kind: "flat" | "mult";
    value: number;
    source: string;
    expiresAt?: number | null;
    stackKey?: string;
}

export interface EquipmentStatModifier {
    stat: StatId;
    kind: "flat" | "mult";
    value: number;
}

export interface EquipmentItemDefinition {
    id: ItemId;
    name: string;
    slot: EquipmentSlotId;
    weaponType?: WeaponType;
    modifiers: EquipmentStatModifier[];
}

export interface PlayerEquipmentState {
    slots: Record<EquipmentSlotId, ItemId | null>;
    charges: Record<EquipmentSlotId, number | null>;
}

export interface PlayerStatsState {
    base: Record<StatId, number>;
    permanentMods: StatModifier[];
    temporaryMods: StatModifier[];
}

export interface InventoryState {
    items: Record<ItemId, number>;
}

export interface ItemDelta {
    [key: ItemId]: number;
}

export interface QuestProgressState {
    craftCounts: Record<ItemId, number>;
    completed: Record<QuestId, boolean>;
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
    stats: PlayerStatsState;
    equipment: PlayerEquipmentState;
    skills: Record<SkillId, SkillState>;
    selectedActionId: ActionId | null;
    actionProgress: ActionProgressState;
    createdAt: number;
    appearance?: {
        faceIndex?: number;
        hairIndex?: number;
        hairColor?: string;
        skinColor?: string;
        showHelmet?: boolean;
    };
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
    rosterLimit: number;
    inventory: InventoryState;
    quests: QuestProgressState;
    loop: LoopState;
    perf: PerformanceState;
    offlineSummary: OfflineSummaryState | null;
    lastTickSummary: TickSummaryState | null;
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
    description?: string;
    media?: string;
    unlockLevel?: number;
    goldReward?: number;
    itemCosts?: ItemDelta;
    itemRewards?: ItemDelta;
    rareRewards?: ItemDelta;
}

export interface ActionDefinition {
    id: ActionId;
    skillId: SkillId;
    staminaCost: number;
    goldReward: number;
    xpSkill: number;
    xpRecipe: number;
    stunTime: number;
    itemCosts?: ItemDelta;
    itemRewards?: ItemDelta;
    rareRewards?: ItemDelta;
}

export type PlayerSaveState = Omit<PlayerState, "actionProgress">;

export interface PerformanceState {
    lastTickDurationMs: number;
    lastDeltaMs: number;
    lastDriftMs: number;
    driftEmaMs: number;
    lastOfflineTicks: number;
    lastOfflineDurationMs: number;
}

export interface OfflinePlayerSummary {
    playerId: PlayerId;
    playerName: string;
    actionId: ActionId | null;
    recipeId: RecipeId | null;
    skillXpGained: number;
    recipeXpGained: number;
    skillLevelGained: number;
    recipeLevelGained: number;
    itemDeltas: ItemDelta;
}

export interface OfflineSummaryState {
    durationMs: number;
    processedMs: number;
    ticks: number;
    capped: boolean;
    players: OfflinePlayerSummary[];
    totalItemDeltas: ItemDelta;
}

export interface TickSummaryState {
    totalItemDeltas: ItemDelta;
    playerItemDeltas: Record<PlayerId, ItemDelta>;
}

export interface GameSave {
    schemaVersion?: number;
    version: string;
    lastTick: number | null;
    lastHiddenAt?: number | null;
    activePlayerId?: PlayerId | null;
    players: Record<PlayerId, PlayerSaveState>;
    rosterLimit?: number;
    inventory?: InventoryState;
    quests?: QuestProgressState;
}
