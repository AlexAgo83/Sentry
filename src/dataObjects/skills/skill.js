// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// skill.js

import { createRecipeByID, STATIC_RECIPES_LIST } from "../../managers/recipeManager.js";
import { Entity } from "../entity.js";

export class Skill extends Entity {
    constructor(identifier) {
        super(identifier);
        this.xp = 0;
        this.level = 1;
        this.maxLevel = 120;
        this.xpNext = 10;
        this.recipes = new Map();
        this.selectedRecipeID = null;

        for (const value of STATIC_RECIPES_LIST) {
            const skillIdentifier = value[0];
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

    getRecipeByID = (identifier) => {
        return this.recipes.get(identifier);
    }

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
        console.log(`skill:Selected recipe ${this.selectedRecipeID}`);
    }
    getSelectedRecipe() {
        return this.selectedRecipe;
    }

    addRecipe(recipe) {
        this.recipes.set(recipe.getIdentifier(), recipe);
    }

}