import type { RecipeDefinition, RecipeId, SkillId } from "../../../core/types";

const [
    { alchemyRecipes },
    { carpentryRecipes },
    { cookingRecipes },
    { excavationRecipes },
    { fishingRecipes },
    { herbalismRecipes },
    { huntingRecipes },
    { invocationRecipes },
    { leatherworkingRecipes },
    { metalworkRecipes },
    { roamingRecipes },
    { tailoringRecipes }
] = await Promise.all([
    import("./alchemy"),
    import("./carpentry"),
    import("./cooking"),
    import("./excavation"),
    import("./fishing"),
    import("./herbalism"),
    import("./hunting"),
    import("./invocation"),
    import("./leatherworking"),
    import("./metalwork"),
    import("./roaming"),
    import("./tailoring")
]);

const RECIPES_BY_SKILL: Record<SkillId, RecipeDefinition[]> = {
    CombatMelee: [],
    CombatRanged: [],
    CombatMagic: [],
    Roaming: roamingRecipes,
    Hunting: huntingRecipes,
    Cooking: cookingRecipes,
    Excavation: excavationRecipes,
    MetalWork: metalworkRecipes,
    Alchemy: alchemyRecipes,
    Herbalism: herbalismRecipes,
    Tailoring: tailoringRecipes,
    Fishing: fishingRecipes,
    Carpentry: carpentryRecipes,
    Leatherworking: leatherworkingRecipes,
    Invocation: invocationRecipes
};

const RECIPE_DEFINITIONS = Object.values(RECIPES_BY_SKILL).flat();
const RECIPE_BY_ID = RECIPE_DEFINITIONS.reduce<Record<RecipeId, RecipeDefinition>>((acc, recipe) => {
    acc[recipe.id] = recipe;
    return acc;
}, {} as Record<RecipeId, RecipeDefinition>);

export const getRecipeDefinition = (skillId: SkillId, recipeId: RecipeId): RecipeDefinition | undefined => {
    return RECIPES_BY_SKILL[skillId]?.find((recipe) => recipe.id === recipeId);
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
