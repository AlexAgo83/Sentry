import type {
    EquipmentItemDefinition,
    PlayerEquipmentState,
    StatModifier,
    WeaponType
} from "../core/types";

export const EQUIPMENT_DEFINITIONS: EquipmentItemDefinition[] = [
    {
        id: "traveler_cape",
        name: "Traveler Cape",
        slot: "Cape",
        modifiers: [
            { stat: "Agility", kind: "flat", value: 1 },
            { stat: "Endurance", kind: "flat", value: 1 }
        ]
    },
    {
        id: "cloth_cap",
        name: "Cloth Cap",
        slot: "Head",
        modifiers: [{ stat: "Intellect", kind: "flat", value: 1 }]
    },
    {
        id: "linen_tunic",
        name: "Linen Tunic",
        slot: "Torso",
        modifiers: [{ stat: "Endurance", kind: "flat", value: 2 }]
    },
    {
        id: "worn_trousers",
        name: "Worn Trousers",
        slot: "Legs",
        modifiers: [{ stat: "Agility", kind: "flat", value: 1 }]
    },
    {
        id: "leather_gloves",
        name: "Leather Gloves",
        slot: "Hands",
        modifiers: [{ stat: "Strength", kind: "flat", value: 1 }]
    },
    {
        id: "simple_boots",
        name: "Simple Boots",
        slot: "Feet",
        modifiers: [{ stat: "Agility", kind: "flat", value: 1 }]
    },
    {
        id: "signet_ring",
        name: "Signet Ring",
        slot: "Ring",
        modifiers: [{ stat: "Luck", kind: "flat", value: 1 }]
    },
    {
        id: "warding_amulet",
        name: "Warding Amulet",
        slot: "Amulet",
        modifiers: [{ stat: "Intellect", kind: "flat", value: 1 }]
    },
    {
        id: "invocation_tablet",
        name: "Invocation Tablet",
        slot: "Tablet",
        modifiers: []
    },
    {
        id: "rusty_blade",
        name: "Rusty Blade",
        slot: "Weapon",
        weaponType: "Melee",
        modifiers: [{ stat: "Strength", kind: "flat", value: 2 }]
    },
    {
        id: "simple_bow",
        name: "Simple Bow",
        slot: "Weapon",
        weaponType: "Ranged",
        modifiers: [{ stat: "Agility", kind: "flat", value: 2 }]
    },
    {
        id: "apprentice_staff",
        name: "Apprentice Staff",
        slot: "Weapon",
        weaponType: "Magic",
        modifiers: [{ stat: "Intellect", kind: "flat", value: 2 }]
    }
];

const EQUIPMENT_BY_ID = EQUIPMENT_DEFINITIONS.reduce<Record<string, EquipmentItemDefinition>>((acc, item) => {
    acc[item.id] = item;
    return acc;
}, {});

export const getEquipmentDefinition = (itemId: string): EquipmentItemDefinition | undefined => {
    return EQUIPMENT_BY_ID[itemId];
};

export const getEquippedItems = (equipment: PlayerEquipmentState): EquipmentItemDefinition[] => {
    return Object.values(equipment.slots)
        .map((itemId) => (itemId ? getEquipmentDefinition(itemId) : undefined))
        .filter((item): item is EquipmentItemDefinition => Boolean(item));
};

const buildModifierId = (itemId: string, statId: string, index: number): string => {
    return `${itemId}:${statId}:${index}`;
};

export const getEquipmentModifiers = (equipment: PlayerEquipmentState): StatModifier[] => {
    const equipped = getEquippedItems(equipment);
    const modifiers: StatModifier[] = [];

    equipped.forEach((item) => {
        item.modifiers.forEach((mod, index) => {
            modifiers.push({
                id: buildModifierId(item.id, mod.stat, index),
                stat: mod.stat,
                kind: mod.kind,
                value: mod.value,
                source: item.name
            });
        });
    });

    return modifiers;
};

export const resolveWeaponSlotLabel = (weaponType?: WeaponType): string => {
    if (!weaponType) {
        return "Weapon";
    }
    return `${weaponType} Weapon`;
};
