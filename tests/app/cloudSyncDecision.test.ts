import { describe, expect, it } from "vitest";
import { resolveCloudSyncBootstrapDecision } from "../../src/app/cloudSyncDecision";
import type { CloudSyncWatermark } from "../../src/adapters/persistence/cloudSyncWatermark";

const watermark = (overrides: Partial<CloudSyncWatermark> = {}): CloudSyncWatermark => ({
    schemaVersion: 1,
    cloudRevision: 2,
    localFingerprint: "fp-local-a",
    updatedAtMs: 1000,
    ...overrides
});

describe("resolveCloudSyncBootstrapDecision", () => {
    it("pushes local when no cloud save exists and no watermark is present", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: null,
            hasCloudSave: false,
            cloudRevision: null,
            localFingerprint: "fp-local-a"
        })).toBe("overwrite_cloud");
    });

    it("returns conflict when cloud exists but watermark is missing", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: null,
            hasCloudSave: true,
            cloudRevision: 4,
            localFingerprint: "fp-local-a"
        })).toBe("conflict");
    });

    it("returns noop when local and cloud are unchanged", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: watermark(),
            hasCloudSave: true,
            cloudRevision: 2,
            localFingerprint: "fp-local-a"
        })).toBe("noop");
    });

    it("loads cloud when only cloud changed", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: watermark(),
            hasCloudSave: true,
            cloudRevision: 5,
            localFingerprint: "fp-local-a"
        })).toBe("load_cloud");
    });

    it("overwrites cloud when only local changed", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: watermark(),
            hasCloudSave: true,
            cloudRevision: 2,
            localFingerprint: "fp-local-b"
        })).toBe("overwrite_cloud");
    });

    it("returns conflict when both local and cloud changed", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: watermark(),
            hasCloudSave: true,
            cloudRevision: 5,
            localFingerprint: "fp-local-b"
        })).toBe("conflict");
    });

    it("returns conflict when cloud revision is unavailable", () => {
        expect(resolveCloudSyncBootstrapDecision({
            watermark: watermark(),
            hasCloudSave: true,
            cloudRevision: null,
            localFingerprint: "fp-local-a"
        })).toBe("conflict");
    });
});
