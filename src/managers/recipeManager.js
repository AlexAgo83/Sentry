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
import { Exca_001 }     from    "../dataObjects/recipes/excavation/exca001.js";
import { Exca_002 }     from    "../dataObjects/recipes/excavation/exca002.js";
import { Exca_003 }     from    "../dataObjects/recipes/excavation/exca003.js";
import { MW_001 } from "../dataObjects/recipes/metalWork/mw001.js";
import { MW_002 } from "../dataObjects/recipes/metalWork/mw002.js";
import { MW_003 } from "../dataObjects/recipes/metalWork/mw003.js";

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

export const createRecipeByID = (skillIdentifier, recipeIdentifier) => {
    if (skillIdentifier == "Combat") {
        /** Combat */
        if (recipeIdentifier == "monster001") {
            return new Monster_001();
        } else if (recipeIdentifier == "monster002") {
            return new Monster_002();
        } else if (recipeIdentifier == "monster003") {
            return new Monster_003();
        }
    } else if (skillIdentifier == "Hunting") {
        /** Hunting */
        if (recipeIdentifier == "hunt001") {
            return new Hunt_001();
        } else if (recipeIdentifier == "hunt002") {
            return new Hunt_002();
        }
    } else if (skillIdentifier == "Cooking") {
        /** Cooking */
        if (recipeIdentifier == "meal001") {
            return new Meal_001();
        } else if (recipeIdentifier == "meal002") {
            return new Meal_002();
        }
    } else if (skillIdentifier == "Excavation") {
        /** Excavation */
        if (recipeIdentifier == "exca001") {
            return new Exca_001();
        } else if (recipeIdentifier == "exca002") {
            return new Exca_002();
        } else if (recipeIdentifier == "exca003") {
            return new Exca_003();
        }
    } else if (skillIdentifier == "MetalWork") {
        /** MetalWork */
        if (recipeIdentifier == "mw001") {
            return new MW_001();
        } else if (recipeIdentifier == "mw002") {
            return new MW_002();
        } else if (recipeIdentifier == "mw003") {
            return new MW_003();
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