// @vitest-environment node
import { describe, expect, it } from "vitest";
import { migrateAndValidateSave } from "../../../src/adapters/persistence/saveMigrations";

describe("saveMigrations", () => {
    it("selects a valid activePlayerId when input is invalid", () => {
        const result = migrateAndValidateSave({
            version: "0.8.0",
            activePlayerId: "missing",
            players: {
                "1": { id: "1", name: "Mara" },
                "2": { id: "2", name: "Rin" },
            }
        });
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(Object.keys(result.save.players)).toHaveLength(2);
        expect(Object.keys(result.save.players)).toContain(result.save.activePlayerId);
    });

    it("drops negative lastHiddenAt/lastTick values", () => {
        const result = migrateAndValidateSave({
            version: "0.8.0",
            lastTick: -10,
            lastHiddenAt: "-5",
            players: {
                "1": { id: "1", name: "Mara" },
            }
        });
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.save.lastTick).toBeNull();
        expect(result.save.lastHiddenAt).toBeNull();
    });

    it("defaults inventory and keeps gold non-negative when inventory is missing", () => {
        const result = migrateAndValidateSave({
            version: "0.8.0",
            players: {
                "1": { id: "1", name: "Mara" },
            }
        });
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.save.inventory).toBeTruthy();
        expect(result.save.inventory?.items.gold ?? 0).toBeGreaterThanOrEqual(0);
    });

    it("normalizes partial inventory and clamps invalid amounts", () => {
        const result = migrateAndValidateSave({
            version: "0.8.0",
            players: {
                "1": { id: "1", name: "Mara" },
            },
            inventory: {
                items: { meat: -3, gold: "12", bad: "nope" }
            }
        });
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.save.inventory?.items.gold).toBe(12);
        expect(result.save.inventory?.items.meat).toBe(0);
        expect(result.save.inventory?.items.bad).toBeUndefined();
    });
});

