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
    silk_cloak: {
        description: "A silk cloak woven for finesse and focus.",
        iconId: "silk_cloak"
    },
    tanned_mantle: {
        description: "A rugged mantle stitched from treated hides.",
        iconId: "tanned_mantle"
    },
    cloth_cap: {
        description: "A simple cloth cap to ward off the chill.",
        iconId: "cloth_cap"
    },
    iron_helm: {
        description: "A solid iron helm that anchors your stance.",
        iconId: "iron_helm"
    },
    hide_hood: {
        description: "A hood of hide that dampens incoming blows.",
        iconId: "hide_hood"
    },
    linen_tunic: {
        description: "A light tunic stitched from linen.",
        iconId: "linen_tunic"
    },
    iron_cuirass: {
        description: "A reinforced cuirass forged for frontline fights.",
        iconId: "iron_cuirass"
    },
    hardened_jerkin: {
        description: "A hardened jerkin made to take a beating.",
        iconId: "hardened_jerkin"
    },
    worn_trousers: {
        description: "Well-worn trousers made for travel.",
        iconId: "worn_trousers"
    },
    iron_greaves: {
        description: "Iron greaves built for steady footing.",
        iconId: "iron_greaves"
    },
    studded_leggings: {
        description: "Studded leggings that favor agility.",
        iconId: "studded_leggings"
    },
    leather_gloves: {
        description: "Sturdy gloves that improve grip.",
        iconId: "leather_gloves"
    },
    forged_gauntlets: {
        description: "Forged gauntlets that reinforce each strike.",
        iconId: "forged_gauntlets"
    },
    silkweave_gloves: {
        description: "Silkweave gloves that favor quick movements.",
        iconId: "silkweave_gloves"
    },
    simple_boots: {
        description: "Basic boots for steady footing.",
        iconId: "simple_boots"
    },
    iron_boots: {
        description: "Iron boots that keep you grounded.",
        iconId: "iron_boots"
    },
    weaver_boots: {
        description: "Weaver boots built for nimble steps.",
        iconId: "weaver_boots"
    },
    signet_ring: {
        description: "A small ring etched with a lucky mark.",
        iconId: "signet_ring"
    },
    warding_amulet: {
        description: "A charm that steadies the mind against harm.",
        iconId: "warding_amulet"
    },
    ruins_luck_loop: {
        description: "A relic ring recovered from ruined halls, humming with fortune.",
        iconId: "ruins_luck_loop"
    },
    cryptbone_charm: {
        description: "A bone charm etched with crypt runes, cold to the touch.",
        iconId: "cryptbone_charm"
    },
    forgeheart_band: {
        description: "A heavy band tempered in a forge's heartfire.",
        iconId: "forgeheart_band"
    },
    nightveil_pendant: {
        description: "A pendant that draws a thin veil of shadow around its wearer.",
        iconId: "nightveil_pendant"
    },
    citadel_bloodseal: {
        description: "A ring sealed in old blood, sworn to withstand the siege.",
        iconId: "citadel_bloodseal"
    },
    ember_oath_talisman: {
        description: "A talisman bound by an ember oath, warm even in the dark.",
        iconId: "ember_oath_talisman"
    },
    abyssal_orbit: {
        description: "A ring that spins with abyssal pull, always returning to its center.",
        iconId: "abyssal_orbit"
    },
    thronebrand_amulet: {
        description: "An amulet marked with a thronebrand, heavy with authority.",
        iconId: "thronebrand_amulet"
    },
    nightless_sigil: {
        description: "A sigil ring that refuses the night, sharp and watchful.",
        iconId: "nightless_sigil"
    },
    frostspire_relic: {
        description: "A relic from a frozen spire, clear and unyielding as ice.",
        iconId: "frostspire_relic"
    },
    invocation_tablet: {
        description: "Stone tablet etched with invocation sigils.",
        iconId: "invocation_tablet"
    },
    forgebound_tablet: {
        description: "Invocation tablet. +5 Strength.",
        iconId: "forgebound_tablet"
    },
    nightveil_tablet: {
        description: "Invocation tablet. +5 Agility.",
        iconId: "nightveil_tablet"
    },
    starlit_sigil_tablet: {
        description: "Invocation tablet. +5 Intellect.",
        iconId: "starlit_sigil_tablet"
    },
    stoneward_tablet: {
        description: "Invocation tablet. +5 Endurance.",
        iconId: "stoneward_tablet"
    },
    rusty_blade: {
        description: "Melee weapon. +25% threat from damage. -10% damage taken.",
        iconId: "rusty_blade"
    },
    rusty_blade_refined: {
        description: "Melee weapon. +25% threat from damage. -10% damage taken. New component: Stone.",
        iconId: "rusty_blade_refined"
    },
    rusty_blade_masterwork: {
        description: "Melee weapon. +25% threat from damage. -10% damage taken. New component: Tools.",
        iconId: "rusty_blade_masterwork"
    },
    simple_bow: {
        description: "Ranged weapon. 50% faster dungeon attacks. +25% damage taken.",
        iconId: "simple_bow"
    },
    simple_bow_refined: {
        description: "Ranged weapon. 50% faster dungeon attacks. +25% damage taken. New component: Cloth.",
        iconId: "simple_bow_refined"
    },
    simple_bow_masterwork: {
        description: "Ranged weapon. 50% faster dungeon attacks. +25% damage taken. New component: Tools.",
        iconId: "simple_bow_masterwork"
    },
    apprentice_staff: {
        description: "Magic weapon. Heals allies below 70% HP every 4s. +10% damage taken.",
        iconId: "apprentice_staff"
    },
    apprentice_staff_refined: {
        description: "Magic weapon. Heals allies below 70% HP every 4s. +10% damage taken. New component: Herbs.",
        iconId: "apprentice_staff_refined"
    },
    apprentice_staff_masterwork: {
        description: "Magic weapon. Heals allies below 70% HP every 4s. +10% damage taken. New component: Artifact.",
        iconId: "apprentice_staff_masterwork"
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
