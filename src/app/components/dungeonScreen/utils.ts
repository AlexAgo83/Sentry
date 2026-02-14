export const MAGIC_HEAL_COOLDOWN_MS = 4000;
export const POTION_COOLDOWN_MS = 4000;

export const percent = (value: number, max: number) => {
    if (!max || max <= 0) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
};

export const formatCompactCount = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    if (safeValue < 1000) {
        return `${safeValue}`;
    }
    if (safeValue < 1_000_000) {
        return `${Math.floor(safeValue / 1000)}k`;
    }
    if (safeValue < 1_000_000_000) {
        return `${Math.floor(safeValue / 1_000_000)}m`;
    }
    return `${Math.floor(safeValue / 1_000_000_000)}b`;
};

export const clampValue = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const formatCooldownMs = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    const seconds = safeValue / 1000;
    if (seconds >= 10) {
        return `${Math.round(seconds)}s`;
    }
    return `${seconds.toFixed(1)}s`;
};

export const normalizeHpMax = (value: number | undefined) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 100;
    }
    return Math.max(1, Math.round(parsed));
};
