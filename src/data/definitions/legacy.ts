import type { RecipeId, SkillId } from "../../core/types";

export const LEGACY_RECIPE_ID_MAP: Record<SkillId, Record<string, RecipeId>> = {
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
