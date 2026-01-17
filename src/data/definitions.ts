import { ActionDefinition, ItemDelta, ItemId, RecipeDefinition, RecipeId, SkillDefinition, SkillId } from "../core/types";

const unlockTier = (level: number) => level;

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    { id: "Combat", name: "Combat", baseInterval: 1000 },
    { id: "Hunting", name: "Hunting", baseInterval: 1000 },
    { id: "Cooking", name: "Cooking", baseInterval: 1000 },
    { id: "Excavation", name: "Excavation", baseInterval: 1000 },
    { id: "MetalWork", name: "Metalwork", baseInterval: 1000 },
    { id: "Alchemy", name: "Alchemy", baseInterval: 1000 },
    { id: "Herbalism", name: "Herbalism", baseInterval: 1000 },
    { id: "Tailoring", name: "Tailoring", baseInterval: 1000 },
    { id: "Fishing", name: "Fishing", baseInterval: 1000 },
    { id: "Carpentry", name: "Carpentry", baseInterval: 1000 },
    { id: "Leatherworking", name: "Leatherworking", baseInterval: 1000 }
];

export const ITEM_DEFINITIONS: Array<{ id: ItemId; name: string }> = [
    { id: "gold", name: "Gold" },
    { id: "meat", name: "Meat" },
    { id: "bones", name: "Bones" },
    { id: "food", name: "Food" },
    { id: "herbs", name: "Herbs" },
    { id: "fish", name: "Fish" },
    { id: "cloth", name: "Cloth" },
    { id: "leather", name: "Leather" },
    { id: "wood", name: "Wood" }
];

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
        { id: "excavate_shallow_vein", skillId: "Excavation", name: "Shallow Vein", unlockLevel: unlockTier(1) },
        { id: "excavate_deep_shaft", skillId: "Excavation", name: "Deep Shaft", unlockLevel: unlockTier(1) },
        { id: "excavate_ruins", skillId: "Excavation", name: "Forgotten Ruins", unlockLevel: unlockTier(10) },
        { id: "excavate_crystal_cavern", skillId: "Excavation", name: "Crystal Cavern", unlockLevel: unlockTier(20) },
        { id: "excavate_heroic_descent", skillId: "Excavation", name: "Heroic Descent", unlockLevel: unlockTier(30) }
    ],
    MetalWork: [
        { id: "metalwork_ingot", skillId: "MetalWork", name: "Ingot Run", unlockLevel: unlockTier(1) },
        { id: "metalwork_blade", skillId: "MetalWork", name: "Blade Casting", unlockLevel: unlockTier(1) },
        { id: "metalwork_armor", skillId: "MetalWork", name: "Armor Forge", unlockLevel: unlockTier(10) },
        { id: "metalwork_forged_tools", skillId: "MetalWork", name: "Forged Tools", unlockLevel: unlockTier(20) },
        { id: "metalwork_heroic_artifact", skillId: "MetalWork", name: "Heroic Artifact", unlockLevel: unlockTier(30) }
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
            itemCosts: { herbs: 2 }
        },
        {
            id: "alchemy_distill_essence",
            skillId: "Alchemy",
            name: "Distill Essence",
            unlockLevel: unlockTier(10),
            itemCosts: { herbs: 3 }
        },
        {
            id: "alchemy_muted_vial",
            skillId: "Alchemy",
            name: "Muted Vial",
            unlockLevel: unlockTier(20),
            itemCosts: { herbs: 2, fish: 1 }
        },
        {
            id: "alchemy_heroic_phial",
            skillId: "Alchemy",
            name: "Heroic Phial",
            unlockLevel: unlockTier(30),
            itemCosts: { herbs: 4, food: 1 }
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
            id: "tailoring_basic_garment",
            skillId: "Tailoring",
            name: "Basic Garment",
            unlockLevel: unlockTier(1),
            itemCosts: { cloth: 2 }
        },
        {
            id: "tailoring_sturdy_weave",
            skillId: "Tailoring",
            name: "Sturdy Weave",
            unlockLevel: unlockTier(10),
            itemCosts: { cloth: 3 }
        },
        {
            id: "tailoring_leather_trim",
            skillId: "Tailoring",
            name: "Leather Trim",
            unlockLevel: unlockTier(20),
            itemCosts: { cloth: 2, leather: 1 }
        },
        {
            id: "tailoring_heroic_raiment",
            skillId: "Tailoring",
            name: "Heroic Raiment",
            unlockLevel: unlockTier(30),
            itemCosts: { cloth: 4, leather: 2 }
        }
    ],
    Fishing: [
        {
            id: "fishing_cast_net",
            skillId: "Fishing",
            name: "Cast Net",
            unlockLevel: unlockTier(1),
            itemRewards: withRewards({ fish: 1 })
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
            id: "carpentry_simple_furniture",
            skillId: "Carpentry",
            name: "Simple Furniture",
            unlockLevel: unlockTier(1),
            itemCosts: { wood: 2 }
        },
        {
            id: "carpentry_fitted_planks",
            skillId: "Carpentry",
            name: "Fitted Planks",
            unlockLevel: unlockTier(10),
            itemCosts: { wood: 3 }
        },
        {
            id: "carpentry_reinforced_frames",
            skillId: "Carpentry",
            name: "Reinforced Frames",
            unlockLevel: unlockTier(20),
            itemCosts: { wood: 3, leather: 1 }
        },
        {
            id: "carpentry_heroic_siegeworks",
            skillId: "Carpentry",
            name: "Heroic Siegeworks",
            unlockLevel: unlockTier(30),
            itemCosts: { wood: 5, cloth: 2 }
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
            id: "leatherworking_basic_armor",
            skillId: "Leatherworking",
            name: "Basic Armor",
            unlockLevel: unlockTier(1),
            itemCosts: { leather: 2 }
        },
        {
            id: "leatherworking_sturdy_buckle",
            skillId: "Leatherworking",
            name: "Sturdy Buckle",
            unlockLevel: unlockTier(10),
            itemCosts: { leather: 3 }
        },
        {
            id: "leatherworking_travel_gear",
            skillId: "Leatherworking",
            name: "Travel Gear",
            unlockLevel: unlockTier(20),
            itemCosts: { leather: 3, cloth: 1 }
        },
        {
            id: "leatherworking_heroic_plate",
            skillId: "Leatherworking",
            name: "Heroic Plate",
            unlockLevel: unlockTier(30),
            itemCosts: { leather: 5, cloth: 2 }
        }
    ]
};

const SKILL_BY_ID = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillDefinition>>((acc, skill) => {
    acc[skill.id] = skill;
    return acc;
}, {} as Record<SkillId, SkillDefinition>);

const RECIPE_DEFINITIONS = Object.values(RECIPES_BY_SKILL).flat();
const RECIPE_BY_ID = RECIPE_DEFINITIONS.reduce<Record<RecipeId, RecipeDefinition>>((acc, recipe) => {
    acc[recipe.id] = recipe;
    return acc;
}, {} as Record<RecipeId, RecipeDefinition>);

const LEGACY_RECIPE_ID_MAP: Record<SkillId, Record<string, RecipeId>> = {
    Combat: {
        monster001: "combat_skirmish",
        monster002: "combat_frontline",
        monster003: "combat_raider_assault",
        monster004: "combat_warband_clash"
    },
    Hunting: {
        hunt001: "hunt_small_game",
        hunt002: "hunt_large_game"
    },
    Cooking: {
        meal001: "cook_campfire_stew",
        meal002: "cook_smoked_rations"
    },
    Excavation: {
        exca001: "excavate_shallow_vein",
        exca002: "excavate_deep_shaft",
        exca003: "excavate_ruins"
    },
    MetalWork: {
        mw001: "metalwork_ingot",
        mw002: "metalwork_blade",
        mw003: "metalwork_armor"
    },
    Alchemy: {},
    Herbalism: {},
    Tailoring: {},
    Fishing: {},
    Carpentry: {},
    Leatherworking: {}
};

export const resolveRecipeId = (skillId: SkillId, recipeId: RecipeId): RecipeId => {
    return LEGACY_RECIPE_ID_MAP[skillId]?.[recipeId] ?? recipeId;
};

export const getSkillDefinition = (skillId: SkillId): SkillDefinition | undefined => {
    return SKILL_BY_ID[skillId];
};

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

export const ACTION_DEFINITIONS: ActionDefinition[] = SKILL_DEFINITIONS.map((skill) => ({
    id: skill.id,
    skillId: skill.id,
    staminaCost: 10,
    goldReward: skill.id === "Combat" ? 1 : 0,
    xpSkill: 1,
    xpRecipe: 2,
    stunTime: 5000
}));

export const getActionDefinition = (actionId: SkillId): ActionDefinition | undefined => {
    return ACTION_DEFINITIONS.find((action) => action.id === actionId);
};
