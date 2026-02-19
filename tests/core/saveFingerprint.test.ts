import { describe, expect, it } from "vitest";
import { buildSaveFingerprint, toCanonicalSaveJson } from "../../src/core/saveFingerprint";

describe("saveFingerprint", () => {
    it("produces the same fingerprint for equivalent objects with different key order", () => {
        const first = {
            players: {
                "1": { id: "1", name: "A" }
            },
            version: "0.9.36",
            ui: {
                cloud: { autoSyncEnabled: true, loginPromptDisabled: false }
            }
        };
        const second = {
            ui: {
                cloud: { loginPromptDisabled: false, autoSyncEnabled: true }
            },
            version: "0.9.36",
            players: {
                "1": { name: "A", id: "1" }
            }
        };

        expect(toCanonicalSaveJson(first)).toBe(toCanonicalSaveJson(second));
        expect(buildSaveFingerprint(first)).toBe(buildSaveFingerprint(second));
    });

    it("changes fingerprint when payload changes", () => {
        const base = {
            version: "0.9.36",
            players: {
                "1": { id: "1", name: "A" }
            }
        };
        const renamed = {
            version: "0.9.36",
            players: {
                "1": { id: "1", name: "B" }
            }
        };

        expect(buildSaveFingerprint(base)).not.toBe(buildSaveFingerprint(renamed));
    });
});
