import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useInventoryNewBadges } from "../../../src/app/hooks/useInventoryNewBadges";
import { gameStore } from "../../../src/app/game";
import { createInitialGameState, stripRuntimeFields } from "../../../src/core/state";
import type { GameSave } from "../../../src/core/types";

const buildTestSave = (version: string, inventoryItems: Record<string, number>): GameSave => {
    const base = createInitialGameState(version);
    const playerId = base.activePlayerId ?? "1";
    return {
        schemaVersion: 3,
        version,
        lastTick: null,
        players: stripRuntimeFields(base.players),
        activePlayerId: playerId,
        inventory: {
            items: inventoryItems,
            discoveredItemIds: {}
        }
    };
};

describe("useInventoryNewBadges", () => {
    beforeEach(() => {
        window.localStorage.clear();
        gameStore.dispatch({
            type: "hydrate",
            version: "0.9.31",
            save: buildTestSave("0.9.31", { gold: 10, wood: 2 })
        });
    });

    it("imports legacy storage once into persisted UI state (save is source of truth)", async () => {
        window.localStorage.setItem(
            "sentry:seen-items:0.9.3",
            JSON.stringify({ itemIds: ["gold"], menuIds: ["gold"] })
        );

        const { result } = renderHook(() => useInventoryNewBadges({ gold: 10, wood: 2 }, "0.9.3"));

        expect(result.current.newItemIds).toEqual(["wood"]);

        await waitFor(() => {
            expect(gameStore.getState().ui.inventoryBadges.legacyImported).toBe(true);
        });
    });

    it("marks items/menu seen via reducer actions (no localStorage writes)", () => {
        const { result } = renderHook(() => useInventoryNewBadges({ gold: 10, wood: 2 }, "0.9.31"));

        result.current.markItemSeen("wood");
        expect(gameStore.getState().ui.inventoryBadges.seenItemIds.wood).toBe(true);

        // Menu-seen uses current owned inventory items.
        result.current.markMenuSeen();
        expect(gameStore.getState().ui.inventoryBadges.seenMenuIds.wood).toBe(true);
    });
});
