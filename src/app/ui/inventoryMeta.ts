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
    traveler_cape: {
        description: "A light cape that offers warmth and keeps you nimble.",
        iconId: "traveler_cape"
    },
    cloth_cap: {
        description: "A simple cloth cap to ward off the chill.",
        iconId: "cloth_cap"
    },
    linen_tunic: {
        description: "A light tunic stitched from linen.",
        iconId: "linen_tunic"
    },
    worn_trousers: {
        description: "Well-worn trousers made for travel.",
        iconId: "worn_trousers"
    },
    leather_gloves: {
        description: "Sturdy gloves that improve grip.",
        iconId: "leather_gloves"
    },
    simple_boots: {
        description: "Basic boots for steady footing.",
        iconId: "simple_boots"
    },
    signet_ring: {
        description: "A small ring etched with a lucky mark.",
        iconId: "signet_ring"
    },
    warding_amulet: {
        description: "A charm that steadies the mind against harm.",
        iconId: "warding_amulet"
    },
    invocation_tablet: {
        description: "Stone tablet etched with invocation sigils.",
        iconId: "invocation_tablet"
    },
    rusty_blade: {
        description: "A basic blade with a weathered edge.",
        iconId: "rusty_blade"
    },
    simple_bow: {
        description: "A light bow for ranged strikes.",
        iconId: "simple_bow"
    },
    apprentice_staff: {
        description: "A staff tuned for beginner magic.",
        iconId: "apprentice_staff"
    },
    furniture: {
        description: "Crafted furnishings for camp upgrades.",
        iconId: "furniture"
    },
    tonic: {
        description: "Light tonic for quick recovery.",
        iconId: "tonic"
    },
    elixir: {
        description: "Potent elixir distilled from rare herbs.",
        iconId: "elixir"
    },
    potion: {
        description: "Concentrated potion brewed for longer journeys.",
        iconId: "potion"
    }
};
