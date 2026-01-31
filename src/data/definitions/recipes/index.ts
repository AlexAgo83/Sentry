import type { RecipeDefinition, RecipeId, SkillId } from "../../../core/types";
import { alchemyRecipes } from "./alchemy";
import { carpentryRecipes } from "./carpentry";
import { combatRecipes } from "./combat";
import { cookingRecipes } from "./cooking";
import { excavationRecipes } from "./excavation";
import { fishingRecipes } from "./fishing";
import { herbalismRecipes } from "./herbalism";
import { huntingRecipes } from "./hunting";
import { invocationRecipes } from "./invocation";
import { leatherworkingRecipes } from "./leatherworking";
import { metalworkRecipes } from "./metalwork";
import { tailoringRecipes } from "./tailoring";

const RECIPES_BY_SKILL: Record<SkillId, RecipeDefinition[]> = {
    Combat: combatRecipes,
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
