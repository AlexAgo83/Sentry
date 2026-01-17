import type { ItemId } from "../../core/types";
import type { InventoryIconId } from "./inventoryIcons";

export type InventoryMeta = {
    description: string;
    iconId: InventoryIconId;
};

const DEFAULT_META: InventoryMeta = {
    description: "No description available.",
    iconId: "generic"
};

export const getInventoryMeta = (itemId: ItemId): InventoryMeta => {
    return INVENTORY_META[itemId] ?? DEFAULT_META;
};

const INVENTORY_META: Record<ItemId, InventoryMeta> = {
    gold: {
        description: "Polished coins used for trade and rewards.",
        iconId: "gold"
    },
    meat: {
        description: "Fresh cuts from the hunt, used in cooking.",
        iconId: "meat"
    },
    bones: {
        description: "Rough bone shards salvaged from battles.",
        iconId: "bones"
    },
    food: {
        description: "Prepared rations that fuel action.",
        iconId: "food"
    },
    herbs: {
        description: "Wild herbs for tinctures and cooking.",
        iconId: "herbs"
    },
    fish: {
        description: "River fish ready for smoking or stew.",
        iconId: "fish"
    },
    cloth: {
        description: "Woven cloth for tailoring work.",
        iconId: "cloth"
    },
    leather: {
        description: "Tanned hide used for armor and gear.",
        iconId: "leather"
    },
    wood: {
        description: "Sturdy timber for carpentry and fires.",
        iconId: "wood"
    },
    stone: {
        description: "Raw stone for building and forging.",
        iconId: "stone"
    },
    ore: {
        description: "Mineral ore awaiting smelting.",
        iconId: "ore"
    },
    crystal: {
        description: "Glowing crystal with arcane charge.",
        iconId: "crystal"
    },
    ingot: {
        description: "Refined metal bars for crafting.",
        iconId: "ingot"
    },
    tools: {
        description: "Working tools to speed production.",
        iconId: "tools"
    },
    artifact: {
        description: "Ancient relic with unknown power.",
        iconId: "artifact"
    },
    garment: {
        description: "Finished clothing from skilled hands.",
        iconId: "garment"
    },
    armor: {
        description: "Protective gear for hardened fighters.",
        iconId: "armor"
    },
    furniture: {
        description: "Crafted furnishings for camp upgrades.",
        iconId: "furniture"
    },
    tonic: {
        description: "Light tonic for quick recovery.",
        iconId: "tonic"
    }
};
