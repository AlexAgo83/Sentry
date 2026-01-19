import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";

describe("sell items", () => {
    it("converts items into gold", () => {
        const initial = createInitialGameState("0.8.0");
        const stateWithItems = {
            ...initial,
            inventory: {
                ...initial.inventory,
                items: {
                    ...initial.inventory.items,
                    meat: 5,
                    gold: 10
                }
            }
        };

        const next = gameReducer(stateWithItems, { type: "sellItem", itemId: "meat", count: 3 });
        expect(next.inventory.items.meat).toBe(2);
        expect(next.inventory.items.gold).toBe(13);
    });

    it("clamps sell count and ignores selling gold", () => {
        const initial = createInitialGameState("0.8.0");
        const stateWithItems = {
            ...initial,
            inventory: {
                ...initial.inventory,
                items: {
                    ...initial.inventory.items,
                    meat: 2,
                    gold: 5
                }
            }
        };

        const clamped = gameReducer(stateWithItems, { type: "sellItem", itemId: "meat", count: 99 });
        expect(clamped.inventory.items.meat).toBe(0);
        expect(clamped.inventory.items.gold).toBe(7);

        const ignored = gameReducer(clamped, { type: "sellItem", itemId: "gold", count: 2 });
        expect(ignored).toEqual(clamped);
    });
});

