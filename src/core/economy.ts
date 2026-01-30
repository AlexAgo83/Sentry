import type { ItemId } from "./types";
import { getEquipmentDefinition } from "../data/equipment";
import { ROSTER_SLOT_COST_BASE, ROSTER_SLOT_COST_GROWTH } from "./constants";

const BASE_SELL_VALUES: Partial<Record<ItemId, number>> = {
    meat: 1,
    bones: 1,
    food: 2,
    herbs: 1,
    fish: 1,
    cloth: 2,
    leather: 2,
    wood: 1,
    stone: 1,
    ore: 2,
    crystal: 4,
    ingot: 5,
    tools: 6,
    artifact: 15,
    furniture: 8,
    tonic: 4,
    elixir: 6,
    potion: 5,
    garment: 7,
    armor: 10
};

export const getSellValuePerItem = (itemId: ItemId): number => {
    if (itemId === "gold") {
        return 0;
    }

    const equipmentDef = getEquipmentDefinition(itemId);
    if (equipmentDef) {
        const flatSum = equipmentDef.modifiers.reduce((acc, mod) => acc + Math.abs(mod.value), 0);
        const weaponBonus = equipmentDef.weaponType ? 5 : 0;
        const value = 10 + weaponBonus + flatSum * 5;
        return Math.max(1, Math.round(value));
    }

    const baseValue = BASE_SELL_VALUES[itemId];
    if (typeof baseValue === "number" && Number.isFinite(baseValue) && baseValue > 0) {
        return Math.floor(baseValue);
    }

    return 1;
};

export const getSellGoldGain = (itemId: ItemId, count: number): number => {
    const safeCount = Math.max(0, Math.floor(count));
    return getSellValuePerItem(itemId) * safeCount;
};

export const getRosterSlotCost = (rosterLimit: number): number => {
    const safeLimit = Number.isFinite(rosterLimit) ? Math.max(1, Math.floor(rosterLimit)) : 1;
    const base = Math.max(1, Math.floor(ROSTER_SLOT_COST_BASE));
    const growth = Number.isFinite(ROSTER_SLOT_COST_GROWTH)
        ? Math.max(1, ROSTER_SLOT_COST_GROWTH)
        : 1;
    const rawCost = base * (growth ** (safeLimit - 1));
    if (!Number.isFinite(rawCost) || rawCost <= 0) {
        return base;
    }
    return Math.max(1, Math.round(rawCost));
};
