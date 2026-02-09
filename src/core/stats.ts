import { DEFAULT_STAT_BASE, STAT_MAX_VALUE } from "./constants";
import type { PlayerStatsState, StatId, StatModifier } from "./types";

export const STAT_IDS: StatId[] = [
    "Strength",
    "Agility",
    "Endurance",
    "Armor",
    "Intellect",
    "Luck"
];

const DEFAULT_ARMOR_BASE = 0;

export const createBaseStats = (): Record<StatId, number> => {
    const base = STAT_IDS.reduce<Record<StatId, number>>((acc, statId) => {
        acc[statId] = DEFAULT_STAT_BASE;
        return acc;
    }, {} as Record<StatId, number>);
    base.Armor = DEFAULT_ARMOR_BASE;
    return base;
};

export const createPlayerStatsState = (): PlayerStatsState => ({
    base: createBaseStats(),
    permanentMods: [],
    temporaryMods: []
});

const normalizeBaseStats = (base?: Record<StatId, number> | null): Record<StatId, number> => {
    const fallback = createBaseStats();
    if (!base) {
        return fallback;
    }
    return STAT_IDS.reduce<Record<StatId, number>>((acc, statId) => {
        const value = base[statId];
        acc[statId] = Number.isFinite(value) ? value : fallback[statId];
        return acc;
    }, {} as Record<StatId, number>);
};

export const normalizePlayerStats = (stats?: PlayerStatsState | null): PlayerStatsState => {
    if (!stats) {
        return createPlayerStatsState();
    }
    return {
        base: normalizeBaseStats(stats.base),
        permanentMods: Array.isArray(stats.permanentMods) ? stats.permanentMods : [],
        temporaryMods: Array.isArray(stats.temporaryMods) ? stats.temporaryMods : []
    };
};

const clampStatValue = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(STAT_MAX_VALUE, value));
};

const sumModifiers = (mods: StatModifier[]) => {
    const flatTotals = STAT_IDS.reduce<Record<StatId, number>>((acc, statId) => {
        acc[statId] = 0;
        return acc;
    }, {} as Record<StatId, number>);
    const multTotals = { ...flatTotals };

    mods.forEach((mod) => {
        if (!STAT_IDS.includes(mod.stat)) {
            return;
        }
        if (!Number.isFinite(mod.value)) {
            return;
        }
        if (mod.kind === "mult") {
            multTotals[mod.stat] += mod.value;
        } else if (mod.kind === "flat") {
            flatTotals[mod.stat] += mod.value;
        }
    });

    return { flatTotals, multTotals };
};

export const pruneExpiredModifiers = (stats: PlayerStatsState, timestamp: number): PlayerStatsState => {
    if (!stats.temporaryMods.length) {
        return stats;
    }
    const activeMods = stats.temporaryMods.filter((mod) => {
        if (mod.expiresAt === null || mod.expiresAt === undefined) {
            return true;
        }
        return mod.expiresAt > timestamp;
    });
    if (activeMods.length === stats.temporaryMods.length) {
        return stats;
    }
    return {
        ...stats,
        temporaryMods: activeMods
    };
};

export const computeEffectiveStats = (
    stats: PlayerStatsState,
    extraModifiers: StatModifier[] = []
): Record<StatId, number> => {
    const { flatTotals, multTotals } = sumModifiers([
        ...stats.permanentMods,
        ...stats.temporaryMods,
        ...extraModifiers
    ]);
    return STAT_IDS.reduce<Record<StatId, number>>((acc, statId) => {
        const rawBaseValue = stats.base[statId];
        const baseValue = Number.isFinite(rawBaseValue) ? rawBaseValue : DEFAULT_STAT_BASE;
        const flatValue = flatTotals[statId] ?? 0;
        const multValue = multTotals[statId] ?? 0;
        acc[statId] = clampStatValue((baseValue + flatValue) * (1 + multValue));
        return acc;
    }, {} as Record<StatId, number>);
};

export const resolveEffectiveStats = (
    stats: PlayerStatsState,
    timestamp: number,
    extraModifiers: StatModifier[] = []
): { stats: PlayerStatsState; effective: Record<StatId, number> } => {
    const normalized = normalizePlayerStats(stats);
    const pruned = pruneExpiredModifiers(normalized, timestamp);
    return {
        stats: pruned,
        effective: computeEffectiveStats(pruned, extraModifiers)
    };
};
