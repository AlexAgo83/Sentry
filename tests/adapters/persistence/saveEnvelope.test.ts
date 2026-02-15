// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../../src/core/state";
import { toGameSave } from "../../../src/core/serialization";
import {
    createSaveEnvelopeV2,
    createSaveEnvelopeV3,
    parseSaveEnvelopeOrLegacy,
    parseSaveEnvelopeV3
} from "../../../src/adapters/persistence/saveEnvelope";

describe("saveEnvelope", () => {
    it("creates and parses v3 compressed envelopes", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV3(save, 123);
        const raw = JSON.stringify(envelope);

        const parsed = parseSaveEnvelopeV3(raw);
        expect(parsed.status).toBe("ok");
        expect(parsed.save).toEqual(save);
    });

    it("detects v3 compressed payload corruption", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV3(save, 123);
        const pivotIndex = Math.floor(envelope.payloadCompressed.length / 2);
        const pivotChar = envelope.payloadCompressed[pivotIndex] ?? "A";
        const replacementChar = pivotChar === "A" ? "B" : "A";
        const tampered = {
            ...envelope,
            payloadCompressed: `${envelope.payloadCompressed.slice(0, pivotIndex)}${replacementChar}${envelope.payloadCompressed.slice(pivotIndex + 1)}`
        };

        const parsed = parseSaveEnvelopeV3(JSON.stringify(tampered));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("detects v3 checksum mismatches", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV3(save, 123);
        const tampered = { ...envelope, checksum: "deadbeef" };

        const parsed = parseSaveEnvelopeV3(JSON.stringify(tampered));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("rejects unsupported v3 payload encoding", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV3(save, 123);
        const tampered = { ...envelope, payloadEncoding: "gzip-base64" };

        const parsed = parseSaveEnvelopeV3(JSON.stringify(tampered));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

    it("rejects non-v3 payloads in v3 parser", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const envelope = createSaveEnvelopeV2(save, 123);

        const parsed = parseSaveEnvelopeV3(JSON.stringify(envelope));
        expect(parsed.status).toBe("corrupt");
        expect(parsed.save).toBeNull();
    });

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

    it("accepts old-school plain saves with schemaVersion 2 on root payload", () => {
        const save = toGameSave(createInitialGameState("0.8.0"));
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify({ ...save, schemaVersion: 2 }));
        expect(parsed.status === "ok" || parsed.status === "migrated").toBe(true);
        expect(parsed.save?.version).toBe(save.version);
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

    it("drops negative timestamps during migration", () => {
        const parsed = parseSaveEnvelopeOrLegacy(JSON.stringify({
            version: "0.8.0",
            lastTick: -1,
            lastHiddenAt: -2,
            players: { "1": { id: "1", name: "Player_1" } },
        }));
        expect(parsed.status).toBe("migrated");
        expect(parsed.save?.lastTick).toBeNull();
        expect(parsed.save?.lastHiddenAt).toBeNull();
    });
});
