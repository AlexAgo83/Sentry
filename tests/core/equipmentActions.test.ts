import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";

describe("equipment actions", () => {
    it("equips items and swaps within the same slot", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        const stateWithItems = {
            ...initial,
            inventory: {
                ...initial.inventory,
                items: {
                    ...initial.inventory.items,
                    rusty_blade: 1,
                    simple_bow: 1
                }
            }
        };

        const equippedBlade = gameReducer(stateWithItems, {
            type: "equipItem",
            playerId,
            itemId: "rusty_blade"
        });
        expect(equippedBlade.players[playerId].equipment.slots.Weapon).toBe("rusty_blade");
        expect(equippedBlade.inventory.items.rusty_blade).toBe(0);

        const swapped = gameReducer(equippedBlade, {
            type: "equipItem",
            playerId,
            itemId: "simple_bow"
        });
        expect(swapped.players[playerId].equipment.slots.Weapon).toBe("simple_bow");
        expect(swapped.inventory.items.simple_bow).toBe(0);
        expect(swapped.inventory.items.rusty_blade).toBe(1);
    });

    it("unequips items and restores inventory", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";
        const stateWithItems = {
            ...initial,
            inventory: {
                ...initial.inventory,
                items: {
                    ...initial.inventory.items,
                    rusty_blade: 1
                }
            }
        };

        const equipped = gameReducer(stateWithItems, {
            type: "equipItem",
            playerId,
            itemId: "rusty_blade"
        });
        const unequipped = gameReducer(equipped, {
            type: "unequipItem",
            playerId,
            slot: "Weapon"
        });

        expect(unequipped.players[playerId].equipment.slots.Weapon).toBe(null);
        expect(unequipped.inventory.items.rusty_blade).toBe(1);
    });

    it("ignores equip when item is not available", () => {
        const initial = createInitialGameState("0.8.0");
        const playerId = initial.activePlayerId ?? "1";

        const next = gameReducer(initial, {
            type: "equipItem",
            playerId,
            itemId: "cloth_cap"
        });

        expect(next.players[playerId].equipment.slots.Head).toBe(null);
        expect(next.inventory.items.cloth_cap ?? 0).toBe(0);
    });
});
