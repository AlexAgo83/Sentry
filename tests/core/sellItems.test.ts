import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";
import { getSellValuePerItem } from "../../src/core/economy";

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

    it("uses item sell values (equipment included)", () => {
        const initial = createInitialGameState("0.8.0");
        const perItem = getSellValuePerItem("cloth_cap");
        const stateWithItems = {
            ...initial,
            inventory: {
                ...initial.inventory,
                items: {
                    ...initial.inventory.items,
                    cloth_cap: 1,
                    gold: 0
                }
            }
        };

        const next = gameReducer(stateWithItems, { type: "sellItem", itemId: "cloth_cap", count: 1 });
        expect(next.inventory.items.cloth_cap).toBe(0);
        expect(next.inventory.items.gold).toBe(perItem);
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

    it("ignores non-positive sell counts", () => {
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

        expect(gameReducer(stateWithItems, { type: "sellItem", itemId: "meat", count: 0 })).toEqual(stateWithItems);
        expect(gameReducer(stateWithItems, { type: "sellItem", itemId: "meat", count: -3 })).toEqual(stateWithItems);
    });
});
