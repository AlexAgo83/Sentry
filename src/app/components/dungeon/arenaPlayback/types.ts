import type {
    DungeonCadenceSnapshotEntry,
    DungeonReplayEvent,
    DungeonReplayState,
    DungeonRunState,
    PlayerEquipmentState,
    PlayerId,
    PlayerState,
    WeaponType
} from "../../../../core/types";

export type {
    DungeonCadenceSnapshotEntry,
    DungeonReplayEvent,
    DungeonReplayState,
    DungeonRunState,
    PlayerEquipmentState,
    PlayerId,
    PlayerState,
    WeaponType
};

export type HeroSeed = {
    id: string;
    name: string;
    hpMax: number;
    skinColor: string;
    hairColor: string;
    helmetVisible: boolean;
    weaponType: WeaponType;
};

export type ArenaEntityState = {
    id: string;
    name: string;
    hp: number;
    hpMax: number;
    alive: boolean;
    isEnemy: boolean;
    isBoss: boolean;
    spawnOrder: number;
    skinColor?: string;
    hairColor?: string;
    helmetVisible?: boolean;
    weaponType?: WeaponType;
};

export type DungeonArenaFloatingText = {
    id: string;
    targetId: string;
    amount: number;
    kind: "damage" | "heal";
    progress: number;
};

export type DungeonArenaAttackCue = {
    sourceId: string;
    targetId: string;
    atMs: number;
};

export type DungeonArenaMagicCue = {
    sourceId: string;
    atMs: number;
};

export type DungeonArenaUnit = {
    id: string;
    name: string;
    hp: number;
    hpMax: number;
    alive: boolean;
    isEnemy: boolean;
    isBoss: boolean;
    x: number;
    y: number;
    attackCharge?: number;
    skinColor?: string;
    hairColor?: string;
    helmetVisible?: boolean;
    weaponType?: WeaponType;
};

export type DungeonArenaFrame = {
    atMs: number;
    totalMs: number;
    targetEnemyId: string | null;
    bossId: string | null;
    bossPhaseLabel: string | null;
    floorLabel: string | null;
    statusLabel: string | null;
    units: DungeonArenaUnit[];
    floatingTexts: DungeonArenaFloatingText[];
    attackCues: DungeonArenaAttackCue[];
    magicCues: DungeonArenaMagicCue[];
};

export type DungeonReplayJumpMarks = {
    firstDeathAtMs: number | null;
    runEndAtMs: number | null;
};
