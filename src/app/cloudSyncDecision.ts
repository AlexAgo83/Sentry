import type { CloudSyncWatermark } from "../adapters/persistence/cloudSyncWatermark";

export type CloudSyncBootstrapDecision = "noop" | "load_cloud" | "overwrite_cloud" | "conflict";

type ResolveCloudSyncBootstrapDecisionInput = {
    watermark: CloudSyncWatermark | null;
    hasCloudSave: boolean;
    cloudRevision: number | null;
    localFingerprint: string | null;
};

const hasLocalFingerprint = (fingerprint: string | null): fingerprint is string => (
    typeof fingerprint === "string" && fingerprint.trim().length > 0
);

export const resolveCloudSyncBootstrapDecision = ({
    watermark,
    hasCloudSave,
    cloudRevision,
    localFingerprint
}: ResolveCloudSyncBootstrapDecisionInput): CloudSyncBootstrapDecision => {
    if (!hasLocalFingerprint(localFingerprint)) {
        return hasCloudSave ? "conflict" : "noop";
    }

    if (!hasCloudSave) {
        if (!watermark) {
            return "overwrite_cloud";
        }
        return watermark.localFingerprint === localFingerprint ? "noop" : "overwrite_cloud";
    }

    if (!watermark || watermark.cloudRevision === null || !hasLocalFingerprint(watermark.localFingerprint)) {
        return "conflict";
    }

    if (cloudRevision === null) {
        return "conflict";
    }

    const localChanged = localFingerprint !== watermark.localFingerprint;
    const cloudChanged = cloudRevision !== watermark.cloudRevision;

    if (!localChanged && !cloudChanged) {
        return "noop";
    }
    if (!localChanged && cloudChanged) {
        return "load_cloud";
    }
    if (localChanged && !cloudChanged) {
        return "overwrite_cloud";
    }
    return "conflict";
};
