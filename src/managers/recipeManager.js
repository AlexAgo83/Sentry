// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// recipeManager.js

import { CoreManager }  from    "./coreManager.js";
import { Monster_001 }  from    "../dataObjects/recipes/combat/monster001.js";
import { Monster_002 }  from    "../dataObjects/recipes/combat/monster002.js";
import { Monster_003 }  from    "../dataObjects/recipes/combat/monster003.js";
import { Hunt_001 }     from    "../dataObjects/recipes/hunting/hunt001.js";
import { Hunt_002 }     from    "../dataObjects/recipes/hunting/hunt002.js";
import { Meal_001 }     from    "../dataObjects/recipes/cooking/meal001.js";
import { Meal_002 }     from    "../dataObjects/recipes/cooking/meal002.js";

export const STATIC_COMBAT_RECIPES_LIST = [
    "monster001", 
    "monster002", 
    "monster003"
];
export const STATIC_HUNTING_RECIPES_LIST = [
    "hunt001",
    "hunt002"
];
export const STATIC_COOKING_RECIPES_LIST = [
    "meal001",
    "meal002"
];
export const STATIC_RECIPES_LIST = [
    ["Combat",  STATIC_COMBAT_RECIPES_LIST], 
    ["Hunting", STATIC_HUNTING_RECIPES_LIST], 
    ["Cooking", STATIC_COOKING_RECIPES_LIST]
];

export const createRecipeByID = (skillIdentifier, recipeIdentifier) => {
    if (skillIdentifier == "Combat") {
        if (recipeIdentifier == "monster001") {
            return new Monster_001();
        } else if (recipeIdentifier == "monster002") {
            return new Monster_002();
        } else if (recipeIdentifier == "monster003") {
            return new Monster_003();
        }
    } else if (skillIdentifier == "Hunting") {
        if (recipeIdentifier == "hunt001") {
            return new Hunt_001();
        } else if (recipeIdentifier == "hunt002") {
            return new Hunt_002();
        }
    } else if (skillIdentifier == "Cooking") {
        if (recipeIdentifier == "meal001") {
            return new Meal_001();
        } else if (recipeIdentifier == "meal002") {
            return new Meal_002();
        }
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
            console.warn("loadRecipes:recipesData not found.", recipesData);
        } else {
            // console.log("loadRecipes:skillsData found.", recipesData);
            for (const key of Object.keys(recipesData)) {
                // console.log("loadRecipes:skillsData key:" + key + ".");
                const savedRecipe = recipesData[key];
                if (savedRecipe) {
                    if (skillObject) {
                        if (!skillObject.recipes.has(key)) {
                            skillObject.recipes.set(key, createRecipeByID(skillObject.getIdentifier(), key));
                            console.log("loadRecipes:createRecipe key:" + key + ".");
                        }
                        skillObject.recipes.get(key).load(savedRecipe);
                    } else {
                        console.warn("loadRecipes:" + key + " skill not found.");
                    }
                } else {
                    console.warn("loadRecipes:" + key + " savedRecipe not found.", savedRecipe);
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