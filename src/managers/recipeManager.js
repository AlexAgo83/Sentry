// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// recipeManager.js

import { CoreManager }  from    "./coreManager.js";
import { RecipeEntity } from "../dataObjects/recipes/recipeEntity.js";
import { CombatRecipe } from "../dataObjects/recipes/combatRecipe.js";
import { CookingRecipe } from "../dataObjects/recipes/cookingRecipe.js";
import { ExcavationRecipe } from "../dataObjects/recipes/excavationRecipe.js";
import { HuntingRecipe } from "../dataObjects/recipes/huntingRecipe.js";
import { MetalWorkRecipe } from "../dataObjects/recipes/metalWorkRecipe.js";

export const STATIC_COMBAT_RECIPES_LIST = [
    "monster001", 
    "monster002", 
    "monster003",
    "monster004"
];
export const STATIC_HUNTING_RECIPES_LIST = [
    "hunt001",
    "hunt002"
];
export const STATIC_COOKING_RECIPES_LIST = [
    "meal001",
    "meal002"
];
export const STATIC_EXCAVATION_RECIPES_LIST = [
    "exca001",
    "exca002",
    "exca003"
]
export const STATIC_METALWORK_RECIPES_LIST = [
    "mw001",
    "mw002",
    "mw003"
]
export const STATIC_RECIPES_LIST = [
    ["Combat",  STATIC_COMBAT_RECIPES_LIST], 
    ["Hunting", STATIC_HUNTING_RECIPES_LIST], 
    ["Cooking", STATIC_COOKING_RECIPES_LIST],
    ["Excavation", STATIC_EXCAVATION_RECIPES_LIST],
    ["MetalWork", STATIC_METALWORK_RECIPES_LIST]
];

/**
 * Create a recipe by its identifier.
 * @param {string} skillIdentifier - The identifier of the skill which the recipe is a part of.
 * @param {string} recipeIdentifier - The identifier of the recipe.
 * @returns {RecipeEntity|null} The created recipe.
 */
export const createRecipeByID = (skillIdentifier, recipeIdentifier) => {
    if (skillIdentifier == "Combat") {
        return new CombatRecipe(recipeIdentifier);
    } else if (skillIdentifier == "Hunting") {
        return new HuntingRecipe(recipeIdentifier);
    } else if (skillIdentifier == "Cooking") {
        return new CookingRecipe(recipeIdentifier);
    } else if (skillIdentifier == "Excavation") {
        return new ExcavationRecipe(recipeIdentifier);
    } else if (skillIdentifier == "MetalWork") {
        return new MetalWorkRecipe(recipeIdentifier);
    } else {
        console.warn("(important)createRecipeByID:recipe not found, skillId:"+skillIdentifier);
    }
    return null;
}

export class RecipeManager extends CoreManager {
    constructor(instance) {
        super(instance);
    }

    loadRecipes = (recipesData, skillObject) => {
        if (recipesData == null || recipesData == {}) {
            console.warn("(loadRecipes) recipesData not found.", recipesData);
        } else {
            for (const key of Object.keys(recipesData)) {
                const savedRecipe = recipesData[key];
                if (savedRecipe) {
                    if (skillObject) {
                        if (!skillObject.recipes.has(key)) {
                            skillObject.recipes.set(key, createRecipeByID(skillObject.getIdentifier(), key));
                        }
                        skillObject.recipes.get(key).load(savedRecipe);
                    } else {
                        console.warn("(loadRecipes) RecipeId:" + key + ", skill not found.");
                    }
                } else {
                    console.warn("(loadRecipes) RecipeId:" + key + " savedRecipe not found. (savedRecipe..)", savedRecipe);
                }
            };
            if (skillObject.selectedRecipeID) {
                const currRecipe = skillObject.recipes.get(skillObject.selectedRecipeID);
                skillObject.setSelectedRecipe(currRecipe);
            }
        }
        return skillObject.recipes;
    }
}