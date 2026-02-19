import { DUNGEON_DEFINITIONS, getDungeonDefinition } from "../../data/dungeons";
import { hashStringToSeed } from "../rng";
import {
    DUNGEON_RUN_SAVE_LIMIT,
    STICKY_THRESHOLD_BOSS,
    STICKY_THRESHOLD_NORMAL,
    TAUNT_THREAT_BONUS,
    THREAT_DECAY
} from "./constants";
import { countNonCriticalEvents } from "./replay";
import type {
    DungeonRunEnemyState,
    DungeonRunState,
    DungeonState,
    GameState,
    InventoryState,
    ItemDelta,
    PlayerId
} from "../types";

export type DungeonRiskTier = "Low" | "Medium" | "High" | "Deadly";

export const normalizeInventoryCount = (value: number | undefined) => {
    const numeric = typeof value === "number" ? value : Number.NaN;
    if (!Number.isFinite(numeric)) {
        return 0;
    }
    return Math.max(0, Math.floor(numeric));
};

export const addItemDelta = (target: ItemDelta, itemId: string, amount: number) => {
    if (!amount) {
        return;
    }
    target[itemId] = (target[itemId] ?? 0) + amount;
};

export const normalizeEnemyVitals = (enemy: DungeonRunEnemyState): DungeonRunEnemyState => {
    const rawHpMax = Number(enemy.hpMax);
    const fallbackHpMax = Math.max(1, Math.round(Number(enemy.hp) || 1));
    const hpMax = Number.isFinite(rawHpMax) && rawHpMax > 0 ? Math.round(rawHpMax) : fallbackHpMax;
    const rawHp = Number(enemy.hp);
    const hp = Number.isFinite(rawHp) ? Math.min(Math.max(0, Math.round(rawHp)), hpMax) : hpMax;
    enemy.hpMax = hpMax;
    enemy.hp = hp;
    return enemy;
};

export const cloneInventory = (inventory: InventoryState): InventoryState => ({
    ...inventory,
    items: { ...inventory.items }
});

export const getRunStorageInventorySnapshot = (inventory: InventoryState) => {
    return {
        food: normalizeInventoryCount(inventory.items.food),
        tonic: normalizeInventoryCount(inventory.items.tonic),
        elixir: normalizeInventoryCount(inventory.items.elixir),
        potion: normalizeInventoryCount(inventory.items.potion)
    };
};

export const resolveTargetEnemy = (enemies: DungeonRunEnemyState[], targetEnemyId: string | null): DungeonRunEnemyState | null => {
    const alive = enemies.map(normalizeEnemyVitals).filter((enemy) => enemy.hp > 0);
    if (alive.length === 0) {
        return null;
    }
    const current = targetEnemyId ? alive.find((enemy) => enemy.id === targetEnemyId) : null;
    if (current) {
        return current;
    }
    return alive
        .slice()
        .sort((a, b) => (a.hp - b.hp) || (a.spawnIndex - b.spawnIndex))[0] ?? null;
};

export const buildThreatTieOrder = (seed: number, partyIds: PlayerId[]): PlayerId[] => {
    return partyIds
        .slice()
        .sort((a, b) => {
            const seedA = hashStringToSeed(`${seed}-${a}`);
            const seedB = hashStringToSeed(`${seed}-${b}`);
            return seedA - seedB || a.localeCompare(b);
        });
};

export const buildThreatByHeroId = (
    party: DungeonRunState["party"],
    existing?: Record<PlayerId, number> | null
): Record<PlayerId, number> => {
    const next: Record<PlayerId, number> = {};
    party.forEach((member) => {
        const prior = existing?.[member.playerId];
        next[member.playerId] = Number.isFinite(prior) ? (prior as number) : 0;
    });
    return next;
};

export const decayThreat = (threatByHeroId: Record<PlayerId, number>) => {
    Object.keys(threatByHeroId).forEach((playerId) => {
        const current = threatByHeroId[playerId as PlayerId] ?? 0;
        threatByHeroId[playerId as PlayerId] = Math.max(0, current * THREAT_DECAY);
    });
};

export const addThreat = (threatByHeroId: Record<PlayerId, number>, playerId: PlayerId, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
        return;
    }
    threatByHeroId[playerId] = (threatByHeroId[playerId] ?? 0) + amount;
};

export const resolveAliveHeroIds = (run: DungeonRunState) => run.party.filter((member) => member.hp > 0).map((member) => member.playerId);

export const recoverRunParty = (party: DungeonRunState["party"]): DungeonRunState["party"] => {
    return party.map((member) => ({
        ...member,
        hp: member.hpMax,
        potionCooldownMs: 0,
        attackCooldownMs: 0,
        magicHealCooldownMs: 0,
        stunnedUntilMs: null
    }));
};

export const isRunActive = (run: DungeonRunState): boolean => {
    return run.status === "running" || run.restartAt !== null;
};

export const resolveTargetHeroId = (run: DungeonRunState, nowMs: number, isBoss: boolean): PlayerId | null => {
    const aliveMembers = run.party.filter((member) => member.hp > 0);
    if (aliveMembers.length === 0) {
        return null;
    }

    const tieOrder = run.threatTieOrder?.length
        ? run.threatTieOrder
        : buildThreatTieOrder(run.seed, aliveMembers.map((member) => member.playerId));
    const tieIndex = new Map(tieOrder.map((playerId, index) => [playerId, index]));
    const threatByHeroId = run.threatByHeroId ?? {};

    const tauntTargets = aliveMembers
        .filter((member) => Number(member.tauntUntilMs) > nowMs)
        .sort((a, b) => {
            const bonusA = a.tauntBonus ?? TAUNT_THREAT_BONUS;
            const bonusB = b.tauntBonus ?? TAUNT_THREAT_BONUS;
            if (bonusB !== bonusA) {
                return bonusB - bonusA;
            }
            return (tieIndex.get(a.playerId) ?? 0) - (tieIndex.get(b.playerId) ?? 0);
        });
    if (tauntTargets.length > 0) {
        return tauntTargets[0]?.playerId ?? null;
    }

    const sortedByThreat = aliveMembers.slice().sort((a, b) => {
        const threatA = threatByHeroId[a.playerId] ?? 0;
        const threatB = threatByHeroId[b.playerId] ?? 0;
        if (threatB !== threatA) {
            return threatB - threatA;
        }
        return (tieIndex.get(a.playerId) ?? 0) - (tieIndex.get(b.playerId) ?? 0);
    });
    const topTargetId = sortedByThreat[0]?.playerId ?? null;
    if (!topTargetId) {
        return null;
    }

    const currentTargetId = run.targetHeroId;
    if (currentTargetId && aliveMembers.some((member) => member.playerId === currentTargetId)) {
        const topThreat = threatByHeroId[topTargetId] ?? 0;
        const currentThreat = threatByHeroId[currentTargetId] ?? 0;
        const threshold = isBoss ? STICKY_THRESHOLD_BOSS : STICKY_THRESHOLD_NORMAL;
        if (topThreat <= 0 || currentThreat >= topThreat * (1 - threshold)) {
            return currentTargetId;
        }
    }

    return topTargetId;
};

export const pruneDungeonRuns = (
    runs: Record<string, DungeonRunState>,
    activeRunId: string | null,
    limit = DUNGEON_RUN_SAVE_LIMIT
): Record<string, DungeonRunState> => {
    if (limit <= 0) {
        return {};
    }
    const entries = Object.entries(runs);
    if (entries.length <= limit) {
        return runs;
    }
    const keepIds = new Set<string>();
    entries.forEach(([id, run]) => {
        if (isRunActive(run)) {
            keepIds.add(id);
        }
    });
    if (activeRunId && runs[activeRunId]) {
        keepIds.add(activeRunId);
    }
    const resolvedLimit = Math.max(limit, keepIds.size);
    if (entries.length <= resolvedLimit) {
        return runs;
    }
    const sorted = entries
        .filter(([id]) => !keepIds.has(id))
        .sort(([, a], [, b]) => (Number(b.startedAt) || 0) - (Number(a.startedAt) || 0));
    for (const [id] of sorted) {
        if (keepIds.size >= resolvedLimit) {
            break;
        }
        keepIds.add(id);
    }
    return entries.reduce<Record<string, DungeonRunState>>((acc, [id, run]) => {
        if (keepIds.has(id)) {
            acc[id] = run;
        }
        return acc;
    }, {});
};

export const createDungeonState = (): DungeonState => ({
    onboardingRequired: false,
    setup: {
        selectedDungeonId: DUNGEON_DEFINITIONS[0]?.id ?? "dungeon_ruines_humides",
        selectedPartyPlayerIds: [],
        autoRestart: true,
        autoConsumables: true
    },
    runs: {},
    activeRunId: null,
    latestReplay: null,
    completionCounts: {},
    policy: {
        maxConcurrentSupported: 3,
        maxConcurrentEnabled: 1
    }
});

export const normalizeDungeonState = (input?: DungeonState | null): DungeonState => {
    const fallback = createDungeonState();
    if (!input) {
        return fallback;
    }
    const selectedDungeonId = getDungeonDefinition(input.setup?.selectedDungeonId ?? "")
        ? (input.setup?.selectedDungeonId ?? fallback.setup.selectedDungeonId)
        : fallback.setup.selectedDungeonId;

    const maxConcurrentSupported = Math.max(
        1,
        Math.floor(input.policy?.maxConcurrentSupported ?? fallback.policy.maxConcurrentSupported)
    );
    const maxConcurrentEnabled = Math.max(
        1,
        Math.min(maxConcurrentSupported, Math.floor(input.policy?.maxConcurrentEnabled ?? fallback.policy.maxConcurrentEnabled))
    );
    const rawRuns = input.runs ?? {};
    const runs = Object.keys(rawRuns).reduce<Record<string, DungeonRunState>>((acc, runId) => {
        const run = rawRuns[runId];
        if (!run) {
            return acc;
        }
        const party = Array.isArray(run.party)
            ? run.party.map((member) => ({
                ...member,
                potionCooldownMs: Number.isFinite(member.potionCooldownMs) ? member.potionCooldownMs : 0,
                attackCooldownMs: Number.isFinite(member.attackCooldownMs) ? member.attackCooldownMs : 0,
                magicHealCooldownMs: Number.isFinite(member.magicHealCooldownMs) ? member.magicHealCooldownMs : 0,
                tauntUntilMs: Number.isFinite(member.tauntUntilMs) ? member.tauntUntilMs : null,
                tauntBonus: Number.isFinite(member.tauntBonus) ? member.tauntBonus : null,
                tauntStartedAtMs: Number.isFinite(member.tauntStartedAtMs) ? member.tauntStartedAtMs : null,
                stunnedUntilMs: Number.isFinite(member.stunnedUntilMs) ? member.stunnedUntilMs : null
            }))
            : [];
        const floorPauseMs = Number.isFinite(run.floorPauseMs)
            ? Math.max(0, Math.floor(run.floorPauseMs ?? 0))
            : null;
        acc[runId] = {
            ...run,
            party,
            floorPauseMs,
            cadenceSnapshot: Array.isArray(run.cadenceSnapshot) ? run.cadenceSnapshot : [],
            truncatedEvents: Number.isFinite(run.truncatedEvents) ? run.truncatedEvents : 0,
            nonCriticalEventCount: Number.isFinite(run.nonCriticalEventCount)
                ? Math.max(0, Math.floor(run.nonCriticalEventCount))
                : countNonCriticalEvents(run.events ?? []),
            threatByHeroId: buildThreatByHeroId(party, run.threatByHeroId ?? null),
            threatTieOrder: Array.isArray(run.threatTieOrder)
                ? run.threatTieOrder.map(String)
                : buildThreatTieOrder(run.seed ?? 0, party.map((member) => member.playerId)),
            targetHeroId: typeof run.targetHeroId === "string" ? run.targetHeroId : null
        };
        return acc;
    }, {});
    const activeRunId = input.activeRunId && runs[input.activeRunId] ? input.activeRunId : null;
    const latestReplay = input.latestReplay
        ? {
            ...input.latestReplay,
            cadenceSnapshot: Array.isArray(input.latestReplay.cadenceSnapshot) ? input.latestReplay.cadenceSnapshot : [],
            threatByHeroId: input.latestReplay.threatByHeroId ?? {}
        }
        : null;
    const completionCounts = Object.entries(input.completionCounts ?? {}).reduce<Record<string, number>>((acc, [key, value]) => {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            acc[key] = Math.floor(parsed);
        }
        return acc;
    }, {});

    const prunedRuns = pruneDungeonRuns(runs, activeRunId, DUNGEON_RUN_SAVE_LIMIT);
    const prunedActiveRunId = activeRunId && prunedRuns[activeRunId] ? activeRunId : null;
    return {
        onboardingRequired: Boolean(input.onboardingRequired),
        setup: {
            selectedDungeonId,
            selectedPartyPlayerIds: Array.from(new Set((input.setup?.selectedPartyPlayerIds ?? []).map(String))),
            autoRestart: input.setup?.autoRestart ?? true,
            autoConsumables: input.setup?.autoConsumables ?? true
        },
        runs: prunedRuns,
        activeRunId: prunedActiveRunId,
        latestReplay,
        completionCounts,
        policy: {
            maxConcurrentSupported,
            maxConcurrentEnabled
        }
    };
};

export const resolveDungeonRiskTier = (power: number, recommendedPower: number): DungeonRiskTier => {
    const safeRecommended = Number.isFinite(recommendedPower) ? Math.max(0, recommendedPower) : 0;
    if (!safeRecommended) {
        return "Medium";
    }
    const safePower = Number.isFinite(power) ? Math.max(0, power) : 0;
    const ratio = safePower / safeRecommended;
    if (ratio >= 1.2) {
        return "Low";
    }
    if (ratio >= 0.9) {
        return "Medium";
    }
    if (ratio >= 0.7) {
        return "High";
    }
    return "Deadly";
};

export const getDungeonRuns = (dungeon: DungeonState): DungeonRunState[] => {
    return Object.values(dungeon.runs)
        .slice()
        .sort((a, b) => (a.startedAt - b.startedAt) || a.id.localeCompare(b.id));
};

export const getActiveDungeonRunIds = (dungeon: DungeonState): string[] => {
    return getDungeonRuns(dungeon).filter((run) => isRunActive(run)).map((run) => run.id);
};

export const getActiveDungeonRuns = (dungeon: DungeonState): DungeonRunState[] => {
    return getActiveDungeonRunIds(dungeon)
        .map((runId) => dungeon.runs[runId])
        .filter((run): run is DungeonRunState => Boolean(run));
};

export const getActiveDungeonRun = (dungeon: DungeonState): DungeonRunState | null => {
    if (dungeon.activeRunId && dungeon.runs[dungeon.activeRunId] && isRunActive(dungeon.runs[dungeon.activeRunId])) {
        return dungeon.runs[dungeon.activeRunId];
    }
    return getActiveDungeonRuns(dungeon)[0] ?? null;
};

export const isPlayerAssignedToActiveDungeonRun = (state: GameState, playerId: PlayerId): boolean => {
    return getActiveDungeonRuns(state.dungeon).some((run) => (
        run.party.some((member) => member.playerId === playerId)
    ));
};
