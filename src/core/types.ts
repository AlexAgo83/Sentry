export type PlayerId = string;
export type CombatSkillId = "CombatMelee" | "CombatRanged" | "CombatMagic";
export type SkillId =
    | CombatSkillId
    | "Roaming"
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
export type ActionId = Exclude<SkillId, CombatSkillId>;
export type RecipeId = string;
export type ItemId = string;
export type QuestId = string;
export type DungeonId = string;
export type DungeonBossMechanicId = "burst" | "poison" | "shield" | "summon" | "enrage";
export type DungeonRunStatus = "running" | "victory" | "failed";
export type DungeonRunEndReason = "victory" | "wipe" | "out_of_food" | "out_of_meat" | "stopped";
export type StatId = "Strength" | "Agility" | "Endurance" | "Armor" | "Intellect" | "Luck";
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
    itemCounts: Record<ItemId, number>;
    itemCountsBySkill: Partial<Record<SkillId, Record<ItemId, number>>>;
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

export interface LastNonDungeonAction {
    skillId: ActionId;
    recipeId: RecipeId;
}

export type LastNonDungeonActionByPlayer = Record<PlayerId, LastNonDungeonAction | null>;

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
    progression: ProgressionState;
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

export interface ProgressionBucket {
    dayKey: string;
    xp: number;
    gold: number;
    activeMs: number;
    idleMs: number;
    skillActiveMs: Partial<Record<SkillId, number>>;
}

export interface ProgressionState {
    buckets: ProgressionBucket[];
}

export interface DungeonSetupState {
    selectedDungeonId: DungeonId;
    selectedPartyPlayerIds: PlayerId[];
    autoRestart: boolean;
    autoConsumables: boolean;
}

export interface DungeonRunPartyMemberState {
    playerId: PlayerId;
    hp: number;
    hpMax: number;
    potionCooldownMs: number;
    attackCooldownMs: number;
    magicHealCooldownMs: number;
    tauntUntilMs?: number | null;
    tauntBonus?: number | null;
    tauntStartedAtMs?: number | null;
    stunnedUntilMs?: number | null;
}

export interface DungeonRunEnemyState {
    id: string;
    name: string;
    hp: number;
    hpMax: number;
    damage: number;
    isBoss: boolean;
    mechanic: DungeonBossMechanicId | null;
    spawnIndex: number;
}

export interface DungeonReplayEvent {
    atMs: number;
    type: "spawn" | "attack" | "damage" | "heal" | "death" | "floor_start" | "boss_start" | "run_end";
    sourceId?: string;
    targetId?: string;
    amount?: number;
    label?: string;
}

export interface DungeonCadenceSnapshotEntry {
    playerId: PlayerId;
    baseAttackMs: number;
    agilityAtRunStart: number;
    resolvedAttackIntervalMs: number;
    minAttackMs: number;
    maxAttackMs: number;
}

export interface DungeonRunState {
    id: string;
    dungeonId: DungeonId;
    status: DungeonRunStatus;
    endReason: DungeonRunEndReason | null;
    startedAt: number;
    elapsedMs: number;
    stepCarryMs: number;
    encounterStep: number;
    floor: number;
    floorCount: number;
    floorPauseMs?: number | null;
    party: DungeonRunPartyMemberState[];
    enemies: DungeonRunEnemyState[];
    targetEnemyId: string | null;
    targetHeroId: PlayerId | null;
    autoRestart: boolean;
    restartAt: number | null;
    runIndex: number;
    startInventory: {
        food: number;
        tonic: number;
        elixir: number;
        potion: number;
    };
    seed: number;
    events: DungeonReplayEvent[];
    cadenceSnapshot: DungeonCadenceSnapshotEntry[];
    truncatedEvents: number;
    nonCriticalEventCount: number;
    threatByHeroId: Record<PlayerId, number>;
    threatTieOrder: PlayerId[];
}

export interface DungeonReplayState {
    runId: string;
    dungeonId: DungeonId;
    status: "victory" | "failed";
    endReason: DungeonRunEndReason;
    runIndex: number;
    startedAt: number;
    elapsedMs: number;
    seed: number;
    partyPlayerIds: PlayerId[];
    teamSnapshot: Array<{
        playerId: PlayerId;
        name: string;
        equipment: PlayerEquipmentState;
    }>;
    startInventory: {
        food: number;
        tonic: number;
        elixir: number;
        potion: number;
    };
    events: DungeonReplayEvent[];
    truncated: boolean;
    fallbackCriticalOnly: boolean;
    cadenceSnapshot: DungeonCadenceSnapshotEntry[];
    threatByHeroId: Record<PlayerId, number>;
}

export interface DungeonState {
    onboardingRequired: boolean;
    setup: DungeonSetupState;
    runs: Record<string, DungeonRunState>;
    activeRunId: string | null;
    latestReplay: DungeonReplayState | null;
    completionCounts: Record<DungeonId, number>;
    policy: {
        maxConcurrentSupported: number;
        maxConcurrentEnabled: number;
    };
}

export interface ActionJournalEntry {
    id: string;
    at: number;
    label: string;
}

export interface GameState {
    version: string;
    appReady: boolean;
    actionJournal: ActionJournalEntry[];
    lastNonDungeonActionByPlayer: LastNonDungeonActionByPlayer;
    players: Record<PlayerId, PlayerState>;
    activePlayerId: PlayerId | null;
    rosterLimit: number;
    inventory: InventoryState;
    quests: QuestProgressState;
    loop: LoopState;
    progression: ProgressionState;
    perf: PerformanceState;
    persistence: PersistenceState;
    offlineSummary: OfflineSummaryState | null;
    lastTickSummary: TickSummaryState | null;
    dungeon: DungeonState;
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

export interface DungeonDefinition {
    id: DungeonId;
    name: string;
    tier: number;
    floorCount: number;
    recommendedPower: number;
    bossName: string;
    bossMechanic: DungeonBossMechanicId;
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

export interface PersistenceState {
    disabled: boolean;
    error: string | null;
    lastFailureAt: number | null;
}

export interface OfflinePlayerSummary {
    playerId: PlayerId;
    playerName: string;
    actionId: ActionId | null;
    recipeId: RecipeId | null;
    isInDungeon?: boolean;
    skillXpGained: number;
    recipeXpGained: number;
    skillLevelGained: number;
    recipeLevelGained: number;
    itemDeltas: ItemDelta;
    dungeonGains: {
        combatXp: Partial<Record<CombatSkillId, number>>;
        itemDeltas: ItemDelta;
    };
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
    dungeonItemDeltas: ItemDelta;
    dungeonItemDeltasByPlayer: Record<PlayerId, ItemDelta>;
    dungeonCombatXpByPlayer: Record<PlayerId, Partial<Record<CombatSkillId, number>>>;
}

export interface GameSave {
    schemaVersion?: number;
    version: string;
    lastTick: number | null;
    lastHiddenAt?: number | null;
    activePlayerId?: PlayerId | null;
    lastNonDungeonAction?: LastNonDungeonAction | null;
    lastNonDungeonActionByPlayer?: LastNonDungeonActionByPlayer | null;
    players: Record<PlayerId, PlayerSaveState>;
    rosterLimit?: number;
    inventory?: InventoryState;
    quests?: QuestProgressState;
    progression?: ProgressionState;
    dungeon?: DungeonState;
}
