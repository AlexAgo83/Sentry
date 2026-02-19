export const CLOUD_SYNC_WATERMARK_STORAGE_KEY = "sentry.cloud.syncWatermark.v1";

export type CloudSyncWatermark = {
    schemaVersion: 1;
    cloudRevision: number | null;
    localFingerprint: string | null;
    updatedAtMs: number;
};

type CloudSyncWatermarkInput = {
    cloudRevision: number | null;
    localFingerprint: string | null;
};

const normalizeRevision = (value: unknown): number | null => {
    if (!Number.isFinite(value)) {
        return null;
    }
    const numeric = Math.floor(Number(value));
    return numeric >= 0 ? numeric : null;
};

const normalizeFingerprint = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const normalizeWatermark = (value: unknown): CloudSyncWatermark | null => {
    if (!value || typeof value !== "object") {
        return null;
    }
    const record = value as Record<string, unknown>;
    const schemaVersion = Number(record.schemaVersion);
    if (schemaVersion !== 1) {
        return null;
    }
    const cloudRevision = normalizeRevision(record.cloudRevision);
    const localFingerprint = normalizeFingerprint(record.localFingerprint);
    const updatedAtMs = Number.isFinite(record.updatedAtMs)
        ? Math.max(0, Math.floor(Number(record.updatedAtMs)))
        : Date.now();
    return {
        schemaVersion: 1,
        cloudRevision,
        localFingerprint,
        updatedAtMs
    };
};

export const readCloudSyncWatermark = (): CloudSyncWatermark | null => {
    if (typeof localStorage === "undefined") {
        return null;
    }
    try {
        const raw = localStorage.getItem(CLOUD_SYNC_WATERMARK_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return normalizeWatermark(JSON.parse(raw));
    } catch {
        return null;
    }
};

export const writeCloudSyncWatermark = (input: CloudSyncWatermarkInput): CloudSyncWatermark | null => {
    if (typeof localStorage === "undefined") {
        return null;
    }
    const watermark: CloudSyncWatermark = {
        schemaVersion: 1,
        cloudRevision: normalizeRevision(input.cloudRevision),
        localFingerprint: normalizeFingerprint(input.localFingerprint),
        updatedAtMs: Date.now()
    };
    try {
        localStorage.setItem(CLOUD_SYNC_WATERMARK_STORAGE_KEY, JSON.stringify(watermark));
        return watermark;
    } catch {
        return null;
    }
};

export const clearCloudSyncWatermark = (): void => {
    if (typeof localStorage === "undefined") {
        return;
    }
    try {
        localStorage.removeItem(CLOUD_SYNC_WATERMARK_STORAGE_KEY);
    } catch {
        // Ignore localStorage failures.
    }
};
