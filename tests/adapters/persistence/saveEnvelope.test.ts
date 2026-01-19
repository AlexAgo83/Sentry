// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../../src/core/state";
import { toGameSave } from "../../../src/core/serialization";
import { createSaveEnvelopeV2, parseSaveEnvelopeOrLegacy } from "../../../src/adapters/persistence/saveEnvelope";

describe("saveEnvelope", () => {
    it("wraps and validates envelopes", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV2(save, 123);
        const raw = JSON.stringify(envelope);

        const parsed = parseSaveEnvelopeOrLegacy(raw);
        expect(parsed.status).toBe("ok");
        expect(parsed.save).toEqual(save);
    });

    it("detects checksum mismatches", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV2(save, 123);
        const tampered = { ...envelope, payload: { ...save, version: "0.0.0" } };

        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify(tampered));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("migrates legacy saves", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const legacy = { ...save };
        delete (legacy as { schemaVersion?: number }).schemaVersion;
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify(legacy));
        expect(parsed.status).toBe("migrated");
        expect(parsed.save).toEqual(save);
    });

    it("sanitizes invalid player entries", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const legacy = {
            ...save,
            schemaVersion: 0,
            players: {
                ...save.players,
                "bad": "not-an-object"
            }
        };
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify(legacy));
        expect(parsed.status).toBe("migrated");
        expect(parsed.save?.players.bad).toBeUndefined();
    });
});
