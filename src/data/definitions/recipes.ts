import type { ItemDelta, RecipeDefinition, RecipeId, SkillId } from "../../core/types";
import { resolveRecipeId } from "./legacy";

const unlockTier = (level: number) => level;

const withRewards = (deltas: ItemDelta): ItemDelta => deltas;

const RECIPES_BY_SKILL: Record<SkillId, RecipeDefinition[]> = {
    Combat: [
        {
            id: "combat_skirmish",
            skillId: "Combat",
            name: "Border Skirmish",
            unlockLevel: unlockTier(1),
            itemCosts: { food: 1 },
            itemRewards: withRewards({ bones: 1 })
        },
        {
            id: "combat_frontline",
            skillId: "Combat",
            name: "Frontline Clash",
            unlockLevel: unlockTier(1),
            itemCosts: { food: 1 },
            itemRewards: withRewards({ bones: 1 })
        },
        {
            id: "combat_raider_assault",
            skillId: "Combat",
            name: "Raider Assault",
            unlockLevel: unlockTier(10),
            itemCosts: { food: 1 },
            itemRewards: withRewards({ bones: 2 })
        },
        {
            id: "combat_warband_clash",
            skillId: "Combat",
            name: "Warband Clash",
            unlockLevel: unlockTier(20),
            itemCosts: { food: 1 },
            itemRewards: withRewards({ bones: 3 })
        },
        {
            id: "combat_heroic_siege",
            skillId: "Combat",
            name: "Heroic Siege",
            unlockLevel: unlockTier(30),
            itemCosts: { food: 1 },
            itemRewards: withRewards({ bones: 4 })
        }
    ],
    Hunting: [
        {
            id: "hunt_small_game",
            skillId: "Hunting",
            name: "Small Game",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ meat: 1, bones: 1 })
        },
        {
            id: "hunt_large_game",
            skillId: "Hunting",
            name: "Large Game",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ meat: 2, bones: 1 })
        },
        {
            id: "hunt_feral_pack",
            skillId: "Hunting",
            name: "Feral Pack",
            unlockLevel: unlockTier(10),
            itemRewards: withRewards({ meat: 3, bones: 2 })
        },
        {
            id: "hunt_mountain_stag",
            skillId: "Hunting",
            name: "Mountain Stag",
            unlockLevel: unlockTier(20),
            itemRewards: withRewards({ meat: 4, bones: 2 })
        },
        {
            id: "hunt_heroic_beast",
            skillId: "Hunting",
            name: "Heroic Beast",
            unlockLevel: unlockTier(30),
            itemRewards: withRewards({ meat: 5, bones: 3 })
        }
    ],
    Cooking: [
        {
            id: "cook_campfire_stew",
            skillId: "Cooking",
            name: "Campfire Stew",
            unlockLevel: unlockTier(1),
            itemCosts: { meat: 1 },
            itemRewards: withRewards({ food: 1 })
        },
        {
            id: "cook_smoked_rations",
            skillId: "Cooking",
            name: "Smoked Rations",
            unlockLevel: unlockTier(1),
            itemCosts: { meat: 2 },
            itemRewards: withRewards({ food: 2 })
        },
        {
            id: "cook_sea_broth",
            skillId: "Cooking",
            name: "Sea Broth",
            unlockLevel: unlockTier(10),
            itemCosts: { meat: 1, fish: 1 },
            itemRewards: withRewards({ food: 3 })
        },
        {
            id: "cook_herb_roast",
            skillId: "Cooking",
            name: "Herb Roast",
            unlockLevel: unlockTier(20),
            itemCosts: { meat: 2, herbs: 1 },
            itemRewards: withRewards({ food: 4 })
        },
        {
            id: "cook_heroic_feast",
            skillId: "Cooking",
            name: "Heroic Feast",
            unlockLevel: unlockTier(30),
            itemCosts: { meat: 3, fish: 2, herbs: 2 },
            itemRewards: withRewards({ food: 7 })
        }
    ],
    Excavation: [
        {
            id: "excavate_shallow_vein",
            skillId: "Excavation",
            name: "Shallow Vein",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ stone: 1 })
        },
        {
            id: "excavate_deep_shaft",
            skillId: "Excavation",
            name: "Deep Shaft",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ ore: 1 })
        },
        {
            id: "excavate_ruins",
            skillId: "Excavation",
            name: "Forgotten Ruins",
            unlockLevel: unlockTier(10),
            itemRewards: withRewards({ stone: 2, ore: 1 })
        },
        {
            id: "excavate_crystal_cavern",
            skillId: "Excavation",
            name: "Crystal Cavern",
            unlockLevel: unlockTier(20),
            itemRewards: withRewards({ crystal: 1, ore: 1 })
        },
        {
            id: "excavate_heroic_descent",
            skillId: "Excavation",
            name: "Heroic Descent",
            unlockLevel: unlockTier(30),
            itemRewards: withRewards({ crystal: 2, ore: 2 })
        }
    ],
    MetalWork: [
        {
            id: "metalwork_ingot",
            skillId: "MetalWork",
            name: "Ingot Run",
            unlockLevel: unlockTier(1),
            itemCosts: { ore: 2 },
            itemRewards: withRewards({ ingot: 1 })
        },
        {
            id: "metalwork_crystal_smelting",
            skillId: "MetalWork",
            name: "Crystal Smelting",
            unlockLevel: unlockTier(10),
            itemCosts: { ore: 2, crystal: 1 },
            itemRewards: withRewards({ ingot: 2 })
        },
        {
            id: "metalwork_rusty_blade",
            skillId: "MetalWork",
            name: "Rusty Blade",
            unlockLevel: unlockTier(1),
            itemCosts: { ingot: 2, wood: 1 },
            itemRewards: withRewards({ rusty_blade: 1 })
        },
        {
            id: "metalwork_signet_ring",
            skillId: "MetalWork",
            name: "Signet Ring",
            unlockLevel: unlockTier(10),
            itemCosts: { ingot: 1, crystal: 1 },
            itemRewards: withRewards({ signet_ring: 1 })
        },
        {
            id: "metalwork_warding_amulet",
            skillId: "MetalWork",
            name: "Warding Amulet",
            unlockLevel: unlockTier(20),
            itemCosts: { ingot: 2, crystal: 2 },
            itemRewards: withRewards({ warding_amulet: 1 })
        },
        {
            id: "metalwork_blade",
            skillId: "MetalWork",
            name: "Blade Casting",
            unlockLevel: unlockTier(1),
            itemCosts: { ore: 3 },
            itemRewards: withRewards({ ingot: 2 })
        },
        {
            id: "metalwork_armor",
            skillId: "MetalWork",
            name: "Armor Forge",
            unlockLevel: unlockTier(10),
            itemCosts: { ore: 4 },
            itemRewards: withRewards({ tools: 1 })
        },
        {
            id: "metalwork_crystal_tools",
            skillId: "MetalWork",
            name: "Crystal Tools",
            unlockLevel: unlockTier(20),
            itemCosts: { ore: 4, crystal: 2 },
            itemRewards: withRewards({ tools: 2 })
        },
        {
            id: "metalwork_forged_tools",
            skillId: "MetalWork",
            name: "Forged Tools",
            unlockLevel: unlockTier(20),
            itemCosts: { ore: 5 },
            itemRewards: withRewards({ tools: 2 })
        },
        {
            id: "metalwork_heroic_artifact",
            skillId: "MetalWork",
            name: "Heroic Artifact",
            unlockLevel: unlockTier(30),
            itemCosts: { ore: 6, crystal: 1 },
            itemRewards: withRewards({ artifact: 1 })
        }
    ],
    Alchemy: [
        {
            id: "alchemy_collect_reagents",
            skillId: "Alchemy",
            name: "Collect Reagents",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ herbs: 1 })
        },
        {
            id: "alchemy_minor_tonic",
            skillId: "Alchemy",
            name: "Minor Tonic",
            unlockLevel: unlockTier(1),
            itemCosts: { herbs: 2 },
            itemRewards: withRewards({ tonic: 1 })
        },
        {
            id: "alchemy_distill_essence",
            skillId: "Alchemy",
            name: "Distill Essence",
            unlockLevel: unlockTier(10),
            itemCosts: { herbs: 3 },
            itemRewards: withRewards({ elixir: 1 })
        },
        {
            id: "alchemy_muted_vial",
            skillId: "Alchemy",
            name: "Muted Vial",
            unlockLevel: unlockTier(20),
            itemCosts: { herbs: 2, fish: 1 },
            itemRewards: withRewards({ elixir: 2 })
        },
        {
            id: "alchemy_heroic_phial",
            skillId: "Alchemy",
            name: "Heroic Phial",
            unlockLevel: unlockTier(30),
            itemCosts: { herbs: 4, food: 1 },
            itemRewards: withRewards({ potion: 1 })
        }
    ],
    Herbalism: [
        {
            id: "herbalism_gather_sprigs",
            skillId: "Herbalism",
            name: "Gather Sprigs",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ herbs: 1 })
        },
        {
            id: "herbalism_foraged_bundles",
            skillId: "Herbalism",
            name: "Foraged Bundles",
            unlockLevel: unlockTier(10),
            itemRewards: withRewards({ herbs: 2 })
        },
        {
            id: "herbalism_wild_harvest",
            skillId: "Herbalism",
            name: "Wild Harvest",
            unlockLevel: unlockTier(20),
            itemRewards: withRewards({ herbs: 3 })
        },
        {
            id: "herbalism_heroic_bloom",
            skillId: "Herbalism",
            name: "Heroic Bloom",
            unlockLevel: unlockTier(30),
            itemRewards: withRewards({ herbs: 4 })
        },
        {
            id: "herbalism_brew_tea",
            skillId: "Herbalism",
            name: "Brew Tea",
            unlockLevel: unlockTier(1),
            itemCosts: { herbs: 2 },
            itemRewards: withRewards({ food: 1 })
        },
        {
            id: "herbalism_soothing_salve",
            skillId: "Herbalism",
            name: "Soothing Salve",
            unlockLevel: unlockTier(10),
            itemCosts: { herbs: 3 },
            itemRewards: withRewards({ food: 2 })
        },
        {
            id: "herbalism_infused_stew",
            skillId: "Herbalism",
            name: "Infused Stew",
            unlockLevel: unlockTier(20),
            itemCosts: { herbs: 2, meat: 1 },
            itemRewards: withRewards({ food: 3 })
        },
        {
            id: "herbalism_heroic_elixir",
            skillId: "Herbalism",
            name: "Heroic Elixir",
            unlockLevel: unlockTier(30),
            itemCosts: { herbs: 3, fish: 2 },
            itemRewards: withRewards({ food: 5 })
        }
    ],
    Tailoring: [
        {
            id: "tailoring_spin_thread",
            skillId: "Tailoring",
            name: "Spin Thread",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ cloth: 1 })
        },
        {
            id: "tailoring_weave_bolts",
            skillId: "Tailoring",
            name: "Weave Bolts",
            unlockLevel: unlockTier(10),
            itemRewards: withRewards({ cloth: 2 })
        },
        {
            id: "tailoring_fine_weave",
            skillId: "Tailoring",
            name: "Fine Weave",
            unlockLevel: unlockTier(20),
            itemRewards: withRewards({ cloth: 3 })
        },
        {
            id: "tailoring_heroic_bolts",
            skillId: "Tailoring",
            name: "Heroic Bolts",
            unlockLevel: unlockTier(30),
            itemRewards: withRewards({ cloth: 4 })
        },
        {
            id: "tailoring_cloth_cap",
            skillId: "Tailoring",
            name: "Cloth Cap",
            unlockLevel: unlockTier(1),
            itemCosts: { cloth: 2, leather: 1 },
            itemRewards: withRewards({ cloth_cap: 1 })
        },
        {
            id: "tailoring_linen_tunic",
            skillId: "Tailoring",
            name: "Linen Tunic",
            unlockLevel: unlockTier(1),
            itemCosts: { cloth: 4, leather: 1 },
            itemRewards: withRewards({ linen_tunic: 1 })
        },
        {
            id: "tailoring_worn_trousers",
            skillId: "Tailoring",
            name: "Worn Trousers",
            unlockLevel: unlockTier(1),
            itemCosts: { cloth: 3 },
            itemRewards: withRewards({ worn_trousers: 1 })
        },
        {
            id: "tailoring_traveler_cape",
            skillId: "Tailoring",
            name: "Traveler Cape",
            unlockLevel: unlockTier(10),
            itemCosts: { cloth: 5, leather: 2 },
            itemRewards: withRewards({ traveler_cape: 1 })
        },
        {
            id: "tailoring_basic_garment",
            skillId: "Tailoring",
            name: "Basic Garment",
            unlockLevel: unlockTier(1),
            itemCosts: { cloth: 2 },
            itemRewards: withRewards({ garment: 1 })
        },
        {
            id: "tailoring_sturdy_weave",
            skillId: "Tailoring",
            name: "Sturdy Weave",
            unlockLevel: unlockTier(10),
            itemCosts: { cloth: 3 },
            itemRewards: withRewards({ garment: 2 })
        },
        {
            id: "tailoring_leather_trim",
            skillId: "Tailoring",
            name: "Leather Trim",
            unlockLevel: unlockTier(20),
            itemCosts: { cloth: 2, leather: 1 },
            itemRewards: withRewards({ garment: 3 })
        },
        {
            id: "tailoring_heroic_raiment",
            skillId: "Tailoring",
            name: "Heroic Raiment",
            unlockLevel: unlockTier(30),
            itemCosts: { cloth: 4, leather: 2 },
            itemRewards: withRewards({ garment: 4 })
        }
    ],
    Fishing: [
        {
            id: "fishing_cast_net",
            skillId: "Fishing",
            name: "Cast Net",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ fish: 1 }),
            rareRewards: withRewards({ crystal: 1 })
        },
        {
            id: "fishing_river_shoal",
            skillId: "Fishing",
            name: "River Shoal",
            unlockLevel: unlockTier(10),
            itemRewards: withRewards({ fish: 2 }),
            rareRewards: withRewards({ crystal: 1 })
        },
        {
            id: "fishing_deep_trawl",
            skillId: "Fishing",
            name: "Deep Trawl",
            unlockLevel: unlockTier(20),
            itemRewards: withRewards({ fish: 3 }),
            rareRewards: withRewards({ crystal: 1 })
        },
        {
            id: "fishing_heroic_shoal",
            skillId: "Fishing",
            name: "Heroic Shoal",
            unlockLevel: unlockTier(30),
            itemRewards: withRewards({ fish: 4 }),
            rareRewards: withRewards({ crystal: 2 })
        },
        {
            id: "fishing_smoke_catch",
            skillId: "Fishing",
            name: "Smoke Catch",
            unlockLevel: unlockTier(1),
            itemCosts: { fish: 2 },
            itemRewards: withRewards({ food: 1 })
        },
        {
            id: "fishing_deep_catch",
            skillId: "Fishing",
            name: "Deep Catch",
            unlockLevel: unlockTier(10),
            itemCosts: { fish: 3 },
            itemRewards: withRewards({ food: 2 })
        },
        {
            id: "fishing_feast_platter",
            skillId: "Fishing",
            name: "Feast Platter",
            unlockLevel: unlockTier(20),
            itemCosts: { fish: 2, herbs: 1 },
            itemRewards: withRewards({ food: 3 })
        },
        {
            id: "fishing_heroic_haul",
            skillId: "Fishing",
            name: "Heroic Haul",
            unlockLevel: unlockTier(30),
            itemCosts: { fish: 4, herbs: 2 },
            itemRewards: withRewards({ food: 5 })
        }
    ],
    Carpentry: [
        {
            id: "carpentry_chop_wood",
            skillId: "Carpentry",
            name: "Chop Wood",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ wood: 1 })
        },
        {
            id: "carpentry_simple_bow",
            skillId: "Carpentry",
            name: "Simple Bow",
            unlockLevel: unlockTier(1),
            itemCosts: { wood: 3, leather: 1 },
            itemRewards: withRewards({ simple_bow: 1 })
        },
        {
            id: "carpentry_apprentice_staff",
            skillId: "Carpentry",
            name: "Apprentice Staff",
            unlockLevel: unlockTier(1),
            itemCosts: { wood: 2, crystal: 1 },
            itemRewards: withRewards({ apprentice_staff: 1 })
        },
        {
            id: "carpentry_simple_furniture",
            skillId: "Carpentry",
            name: "Simple Furniture",
            unlockLevel: unlockTier(1),
            itemCosts: { wood: 2 },
            itemRewards: withRewards({ furniture: 1 })
        },
        {
            id: "carpentry_fitted_planks",
            skillId: "Carpentry",
            name: "Fitted Planks",
            unlockLevel: unlockTier(10),
            itemCosts: { wood: 3 },
            itemRewards: withRewards({ furniture: 2 })
        },
        {
            id: "carpentry_reinforced_frames",
            skillId: "Carpentry",
            name: "Reinforced Frames",
            unlockLevel: unlockTier(20),
            itemCosts: { wood: 3, leather: 1 },
            itemRewards: withRewards({ furniture: 3 })
        },
        {
            id: "carpentry_heroic_siegeworks",
            skillId: "Carpentry",
            name: "Heroic Siegeworks",
            unlockLevel: unlockTier(30),
            itemCosts: { wood: 5, cloth: 2 },
            itemRewards: withRewards({ furniture: 4 })
        }
    ],
    Leatherworking: [
        {
            id: "leatherworking_tan_hides",
            skillId: "Leatherworking",
            name: "Tan Hides",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ leather: 1 })
        },
        {
            id: "leatherworking_stretched_hides",
            skillId: "Leatherworking",
            name: "Stretched Hides",
            unlockLevel: unlockTier(10),
            itemRewards: withRewards({ leather: 2 })
        },
        {
            id: "leatherworking_oiled_leather",
            skillId: "Leatherworking",
            name: "Oiled Leather",
            unlockLevel: unlockTier(20),
            itemRewards: withRewards({ leather: 3 })
        },
        {
            id: "leatherworking_heroic_tan",
            skillId: "Leatherworking",
            name: "Heroic Tan",
            unlockLevel: unlockTier(30),
            itemRewards: withRewards({ leather: 4 })
        },
        {
            id: "leatherworking_master_tannery",
            skillId: "Leatherworking",
            name: "Master Tannery",
            unlockLevel: unlockTier(40),
            itemRewards: withRewards({ leather: 6 })
        },
        {
            id: "leatherworking_legendary_tannery",
            skillId: "Leatherworking",
            name: "Legendary Tannery",
            unlockLevel: unlockTier(60),
            itemRewards: withRewards({ leather: 8 })
        },
        {
            id: "leatherworking_mythic_tannery",
            skillId: "Leatherworking",
            name: "Mythic Tannery",
            unlockLevel: unlockTier(80),
            itemRewards: withRewards({ leather: 10 })
        },
        {
            id: "leatherworking_leather_gloves",
            skillId: "Leatherworking",
            name: "Leather Gloves",
            unlockLevel: unlockTier(1),
            itemCosts: { leather: 3 },
            itemRewards: withRewards({ leather_gloves: 1 })
        },
        {
            id: "leatherworking_simple_boots",
            skillId: "Leatherworking",
            name: "Simple Boots",
            unlockLevel: unlockTier(1),
            itemCosts: { leather: 3, cloth: 1 },
            itemRewards: withRewards({ simple_boots: 1 })
        },
        {
            id: "leatherworking_basic_armor",
            skillId: "Leatherworking",
            name: "Basic Armor",
            unlockLevel: unlockTier(1),
            itemCosts: { leather: 2 },
            itemRewards: withRewards({ armor: 1 })
        },
        {
            id: "leatherworking_sturdy_buckle",
            skillId: "Leatherworking",
            name: "Sturdy Buckle",
            unlockLevel: unlockTier(10),
            itemCosts: { leather: 3 },
            itemRewards: withRewards({ armor: 2 })
        },
        {
            id: "leatherworking_travel_gear",
            skillId: "Leatherworking",
            name: "Travel Gear",
            unlockLevel: unlockTier(20),
            itemCosts: { leather: 3, cloth: 1 },
            itemRewards: withRewards({ armor: 3 })
        },
        {
            id: "leatherworking_heroic_plate",
            skillId: "Leatherworking",
            name: "Heroic Plate",
            unlockLevel: unlockTier(30),
            itemCosts: { leather: 5, cloth: 2 },
            itemRewards: withRewards({ armor: 4 })
        },
        {
            id: "leatherworking_studded_harness",
            skillId: "Leatherworking",
            name: "Studded Harness",
            unlockLevel: unlockTier(40),
            itemCosts: { leather: 6, cloth: 2 },
            itemRewards: withRewards({ armor: 5 })
        },
        {
            id: "leatherworking_reinforced_brigandine",
            skillId: "Leatherworking",
            name: "Reinforced Brigandine",
            unlockLevel: unlockTier(60),
            itemCosts: { leather: 8, cloth: 3 },
            itemRewards: withRewards({ armor: 7 })
        },
        {
            id: "leatherworking_mythic_warhide",
            skillId: "Leatherworking",
            name: "Mythic Warhide",
            unlockLevel: unlockTier(80),
            itemCosts: { leather: 10, cloth: 4 },
            itemRewards: withRewards({ armor: 9 })
        }
    ]
};

const RECIPE_DEFINITIONS = Object.values(RECIPES_BY_SKILL).flat();
const RECIPE_BY_ID = RECIPE_DEFINITIONS.reduce<Record<RecipeId, RecipeDefinition>>((acc, recipe) => {
    acc[recipe.id] = recipe;
    return acc;
}, {} as Record<RecipeId, RecipeDefinition>);

export const getRecipeDefinition = (skillId: SkillId, recipeId: RecipeId): RecipeDefinition | undefined => {
    const resolvedId = resolveRecipeId(skillId, recipeId);
    return RECIPES_BY_SKILL[skillId]?.find((recipe) => recipe.id === resolvedId);
};

export const getRecipeDefinitionById = (recipeId: RecipeId): RecipeDefinition | undefined => {
    return RECIPE_BY_ID[recipeId];
};

export const getRecipesForSkill = (skillId: SkillId): RecipeDefinition[] => {
    return RECIPES_BY_SKILL[skillId] ?? [];
};

export const getRecipeUnlockLevel = (recipe: RecipeDefinition): number => {
    return recipe.unlockLevel ?? 1;
};

export const isRecipeUnlocked = (recipe: RecipeDefinition, skillLevel: number): boolean => {
    return skillLevel >= getRecipeUnlockLevel(recipe);
};
