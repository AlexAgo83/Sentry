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

    it("returns corrupt on invalid JSON", () => {
        const parsed = parseSaveEnvelopeOrLegacy("{bad-json");
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("returns corrupt when the payload is missing", () => {
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify({ schemaVersion: 2, checksum: "abc" }));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("returns corrupt when the migrated save has no valid players", () => {
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify({ version: "0.8.0", players: {} }));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("treats already-latest plain saves as ok (no migration)", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify(save));
        expect(parsed.status).toBe("ok");
        expect(parsed.save).toEqual(save);
    });

    it("normalizes legacy inventory values", () => {
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify({
            version: "0.8.0",
            players: { "1": { id: "1", name: "Player_1" } },
            inventory: { items: { gold: "10", meat: -5, bad: "nope" } }
        }));
        expect(parsed.status).toBe("migrated");
        expect(parsed.save?.inventory?.items.gold).toBe(10);
        expect(parsed.save?.inventory?.items.meat).toBe(0);
        expect(parsed.save?.inventory?.items.bad).toBeUndefined();
    });
});
