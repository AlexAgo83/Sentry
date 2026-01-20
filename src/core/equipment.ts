import type { EquipmentSlotId, PlayerEquipmentState } from "./types";

export const EQUIPMENT_SLOTS: EquipmentSlotId[] = [
    "Head",
    "Cape",
    "Torso",
    "Legs",
    "Hands",
    "Feet",
    "Ring",
    "Amulet",
    "Weapon"
];

export const createPlayerEquipmentState = (): PlayerEquipmentState => ({
    slots: EQUIPMENT_SLOTS.reduce<Record<EquipmentSlotId, null>>((acc, slot) => {
        acc[slot] = null;
        return acc;
    }, {} as Record<EquipmentSlotId, null>)
});

export const normalizePlayerEquipment = (equipment?: PlayerEquipmentState | null): PlayerEquipmentState => {
    const base = createPlayerEquipmentState();
    if (!equipment?.slots) {
        return base;
    }
    const slots = EQUIPMENT_SLOTS.reduce<Record<EquipmentSlotId, string | null>>((acc, slot) => {
        acc[slot] = equipment.slots[slot] ?? null;
        return acc;
    }, {} as Record<EquipmentSlotId, string | null>);
    return { slots };
};
