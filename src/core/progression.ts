import type { ProgressionBucket, ProgressionState, SkillId } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const ROLLING_DAYS = 7;

const pad2 = (value: number) => String(value).padStart(2, "0");

export const getDayKey = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const getLocalMidnight = (timestamp: number): number => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

export const buildRollingDayKeys = (timestamp: number, days = ROLLING_DAYS): string[] => {
    const start = getLocalMidnight(timestamp) - (days - 1) * DAY_MS;
    return Array.from({ length: days }, (_, index) => getDayKey(start + index * DAY_MS));
};

export const createEmptyBucket = (dayKey: string): ProgressionBucket => ({
    dayKey,
    xp: 0,
    gold: 0,
    activeMs: 0,
    idleMs: 0,
    skillActiveMs: {}
});

const sanitizeNumber = (value: unknown): number => {
    return Number.isFinite(value) ? Number(value) : 0;
};

const sanitizeSkillMap = (value: unknown): Partial<Record<SkillId, number>> => {
    if (!value || typeof value !== "object") {
        return {};
    }
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.reduce<Partial<Record<SkillId, number>>>((acc, [key, raw]) => {
        const numeric = sanitizeNumber(raw);
        if (numeric !== 0) {
            acc[key as SkillId] = numeric;
        }
        return acc;
    }, {});
};

const sanitizeBucket = (bucket: ProgressionBucket): ProgressionBucket => ({
    dayKey: bucket.dayKey,
    xp: sanitizeNumber(bucket.xp),
    gold: sanitizeNumber(bucket.gold),
    activeMs: sanitizeNumber(bucket.activeMs),
    idleMs: sanitizeNumber(bucket.idleMs),
    skillActiveMs: sanitizeSkillMap(bucket.skillActiveMs)
});

export const normalizeProgressionState = (
    progression: ProgressionState | null | undefined,
    timestamp: number
): ProgressionState => {
    const dayKeys = buildRollingDayKeys(timestamp);
    const bucketsByKey = new Map<string, ProgressionBucket>();

    (progression?.buckets ?? []).forEach((bucket) => {
        if (bucket && dayKeys.includes(bucket.dayKey)) {
            bucketsByKey.set(bucket.dayKey, sanitizeBucket(bucket));
        }
    });

    const buckets = dayKeys.map((dayKey) => bucketsByKey.get(dayKey) ?? createEmptyBucket(dayKey));
    return { buckets };
};

export type ProgressionTickDelta = {
    xp: number;
    gold: number;
    activeMs: number;
    idleMs: number;
    skillActiveMs: Partial<Record<SkillId, number>>;
};

export const applyProgressionDelta = (
    progression: ProgressionState,
    delta: ProgressionTickDelta,
    timestamp: number
): ProgressionState => {
    const normalized = normalizeProgressionState(progression, timestamp);
    const dayKey = getDayKey(timestamp);
    const buckets = normalized.buckets.map((bucket) => ({ ...bucket, skillActiveMs: { ...bucket.skillActiveMs } }));
    const targetIndex = buckets.findIndex((bucket) => bucket.dayKey === dayKey);
    if (targetIndex >= 0) {
        const target = buckets[targetIndex];
        target.xp += sanitizeNumber(delta.xp);
        target.gold += sanitizeNumber(delta.gold);
        target.activeMs += sanitizeNumber(delta.activeMs);
        target.idleMs += sanitizeNumber(delta.idleMs);
        Object.entries(delta.skillActiveMs ?? {}).forEach(([skillId, value]) => {
            const numeric = sanitizeNumber(value);
            if (!numeric) {
                return;
            }
            const current = target.skillActiveMs[skillId as SkillId] ?? 0;
            target.skillActiveMs[skillId as SkillId] = current + numeric;
        });
    }
    return { buckets };
};

export const createProgressionState = (timestamp: number): ProgressionState => {
    const dayKeys = buildRollingDayKeys(timestamp);
    return { buckets: dayKeys.map(createEmptyBucket) };
};
