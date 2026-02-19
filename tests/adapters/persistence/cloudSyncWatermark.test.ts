import { beforeEach, describe, expect, it } from "vitest";
import {
    CLOUD_SYNC_WATERMARK_STORAGE_KEY,
    clearCloudSyncWatermark,
    readCloudSyncWatermark,
    writeCloudSyncWatermark
} from "../../../src/adapters/persistence/cloudSyncWatermark";

describe("cloudSyncWatermark", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("writes and reads watermark", () => {
        const written = writeCloudSyncWatermark({
            cloudRevision: 3,
            localFingerprint: "fp1-1-aaaa"
        });

        expect(written?.cloudRevision).toBe(3);
        expect(written?.localFingerprint).toBe("fp1-1-aaaa");

        const read = readCloudSyncWatermark();
        expect(read?.schemaVersion).toBe(1);
        expect(read?.cloudRevision).toBe(3);
        expect(read?.localFingerprint).toBe("fp1-1-aaaa");
    });

    it("returns null when storage is corrupt", () => {
        window.localStorage.setItem(CLOUD_SYNC_WATERMARK_STORAGE_KEY, "{bad json");
        expect(readCloudSyncWatermark()).toBeNull();
    });

    it("clears watermark", () => {
        writeCloudSyncWatermark({ cloudRevision: 1, localFingerprint: "fp1-1-bbbb" });
        clearCloudSyncWatermark();
        expect(readCloudSyncWatermark()).toBeNull();
    });
});
