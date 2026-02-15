import type {
    DungeonDefinition,
    DungeonId,
    DungeonReplayState,
    DungeonRunState,
    PlayerId,
    PlayerState
} from "../../../core/types";

export type DungeonScreenProps = {
    definitions: DungeonDefinition[];
    players: Record<PlayerId, PlayerState>;
    playersSorted: PlayerState[];
    selectedDungeonId: string;
    selectedPartyPlayerIds: PlayerId[];
    canEnterDungeon: boolean;
    foodCount: number;
    inventoryItems: Record<string, number>;
    discoveredItemIds?: Record<string, true>;
    itemNameById: Record<string, string>;
    currentPower: number;
    usesPartyPower: boolean;
    autoConsumables: boolean;
    canUseConsumables: boolean;
    consumablesCount: number;
    activeRun: DungeonRunState | null;
    latestReplay: DungeonReplayState | null;
    completionCounts: Record<DungeonId, number>;
    showReplay: boolean;
    onToggleReplay: () => void;
    onSelectDungeon: (dungeonId: string) => void;
    onTogglePartyPlayer: (playerId: PlayerId) => void;
    onToggleAutoRestart: (value: boolean) => void;
    onToggleAutoConsumables: (value: boolean) => void;
    onStartRun: () => void;
    onStopRun: () => void;
};

export type DamageTotals = {
    heroTotals: Map<string, number>;
    enemyTotals: Map<string, number>;
    groupTotal: number;
};
