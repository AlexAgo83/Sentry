// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// skillEntity.js

import { createRecipeByID, STATIC_RECIPES_LIST } from "../../managers/recipeManager.js";
import { Entity } from "../entity.js";

export class SkillEntity extends Entity {
    constructor(identifier, mediaPath) {
        super(identifier);
        this.xp = 0;
        this.level = 1;
        this.maxLevel = 120;
        this.xpNext = 10;
        this.xpNextMultiplier = 1.5;
        this.baseInterval = 1000;
        this.recipes = new Map();
        this.selectedRecipeID = null;
        this.media = mediaPath;

        for (const value of STATIC_RECIPES_LIST) {
            const skillIdentifier = String(value[0]);
            if (skillIdentifier != this.getIdentifier()) continue;
            const arrayOfRecipeIdentifier = value[1];
            for (const recipeIdentifier of arrayOfRecipeIdentifier) {
                this.addRecipe(createRecipeByID(skillIdentifier, recipeIdentifier))
            }
        }

        this.setOnLoad((skillData) => {
            this.xp = skillData.xp;
            this.level = skillData.level;
            this.xpNext = skillData.xpNext;
            this.selectedRecipeID = skillData.selectedRecipeID;
            this.recipesData = skillData.recipesData;
        })
        
        this.setOnSave(() => {
            return {
                id: this.getIdentifier(),
                xp: this.xp,
                xpNext: this.xpNext,
                level: this.level,
                selectedRecipeID: this.selectedRecipeID,
                recipesData: this.saveRecipes()
            };
        })
    }

    setBaseInterval(interval) {
        this.baseInterval = interval;
    }

    getRecipeByID = (identifier) => {
        return this.recipes.get(identifier);
    }
    
    /**
     * @returns {object} The saved recipes object with the format {recipeId: recipeData, ...}
     */
    saveRecipes = () => {
        const result = {};
        for (const key of this.recipes.keys()) {
            const recipeObject = this.getRecipeByID(key);
            result[recipeObject.getIdentifier()] = recipeObject.save();
        }
        return result;
    }

    setSelectedRecipe(recipe) {
        this.selectedRecipe = recipe;
        this.selectedRecipeID = recipe?.getIdentifier();
        // console.log(`(important) skill:Selected recipe ${this.selectedRecipeID}`);
    }
    getSelectedRecipe() {
        return this.selectedRecipe;
    }

    addRecipe(recipe) {
        if (recipe) this.recipes.set(recipe.getIdentifier(), recipe);
    }
}