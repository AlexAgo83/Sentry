import { describe, expect, it } from "vitest";
import type { DungeonReplayState } from "../../src/core/types";
import { computeDamageTotalsUntil } from "../../src/app/components/dungeonScreen/hooks/useDungeonReplayDerived";

describe("dungeon replay derived helpers", () => {
    it("computes hero and enemy damage totals up to cursor", () => {
        const replay: DungeonReplayState = {
            runId: "run-1",
            dungeonId: "dungeon_ruines_humides",
            status: "failed",
            endReason: "wipe",
            runIndex: 1,
            startedAt: 1_000,
            elapsedMs: 3_000,
            seed: 12,
            partyPlayerIds: ["1", "2", "3", "4"],
            teamSnapshot: [],
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
            events: [
                { atMs: 100, type: "damage", sourceId: "1", targetId: "entity_mob_1", amount: 50 },
                { atMs: 120, type: "damage", sourceId: "entity_mob_1", targetId: "1", amount: 20 },
                { atMs: 900, type: "damage", sourceId: "2", targetId: "entity_mob_1", amount: 30 },
                { atMs: 1_500, type: "damage", sourceId: "entity_mob_1", targetId: "2", amount: 40 }
            ],
            truncated: false,
            fallbackCriticalOnly: false,
            cadenceSnapshot: [],
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 }
        };

        const totalsAt1s = computeDamageTotalsUntil(replay, 1_000);
        expect(totalsAt1s.heroTotals.get("1")).toBe(50);
        expect(totalsAt1s.heroTotals.get("2")).toBe(30);
        expect(totalsAt1s.enemyTotals.get("entity_mob_1")).toBe(20);
        expect(totalsAt1s.groupTotal).toBe(80);

        const totalsAt2s = computeDamageTotalsUntil(replay, 2_000);
        expect(totalsAt2s.enemyTotals.get("entity_mob_1")).toBe(60);
    });
});
