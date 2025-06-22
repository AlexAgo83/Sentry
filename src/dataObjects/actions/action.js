// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// action.js

import { Entity } from "../entity.js";

export class Action extends Entity {

    constructor(identifier, player) {
        super(identifier);
        this.player = player;
        this.setOnLoad((actionData) => {
            // ...
        });
        this.setOnSave(() => {
            return this.getIdentifier();
        });
    }

    getPlayer = () => {
        return this.player;
    }

    getSkill = () => {
        return this.player.skills.get(this.getIdentifier());
    }

    getRecipe = () => {
        return this.getSkill().getSelectedRecipe();
    }

    setOnDoAction(onDoAction) {
        this.onDoAction = onDoAction;
    }

    onDoAction = () => {
        // Default onDoAction ...
        console.log("onDoAction:Default onDoAction ...");
        return false;
    }

    doAction = (player) => {
        if (this.getSkill().getSelectedRecipe()) {
            if (this.onDoAction()) {
                const currSkill = this.getSkill();
                const currRecipe = this.getSkill()?.getSelectedRecipe();
                // console.log(`(Action done!) PlayerID:${player.getIdentifier()}, Skill:${currSkill.getIdentifier()}, Recipe:${currRecipe.getIdentifier()}`); 
                if (currSkill.xp >= currSkill.xpNext) {
                    this.levelUpSkill(currSkill);
                }
                if (currRecipe.xp >= currRecipe.xpNext) {
                    this.levelUpRecipe(currRecipe);
                }
            } else console.log("doAction:Action failed.");
        } else {
            console.log("doAction:No recipe selected.");
        }
    };

    levelUpSkill = (skillObject) => {
        const player = this.getPlayer();
        const skill = skillObject;

        if (skill.level >= skill.maxLevel) {
            return;
        }

        skill.xp -= skill.xpNext;
        skill.level += 1;
        skill.xpNext = Math.floor(skill.xpNext * 1.5);

        player.dmg += 1;
        console.log(`(Level Skill up!) PlayerID:${player.getIdentifier()}, Skill:${skill.getIdentifier()}, level:${skill.level} xpNext:${skill.xpNext}`);
    }

    levelUpRecipe = (recipeObject) => {
        const player = this.getPlayer();
        const recipe = recipeObject;

        if (recipe.level >= recipe.maxLevel) {
            return;
        }

        recipe.xp -= recipe.xpNext;
        recipe.level += 1;
        recipe.xpNext = Math.floor(recipe.xpNext * 1.5);

        console.log(`(Level Recipe up!) PlayerID:${player.getIdentifier()}, Recipe:${recipe.getIdentifier()}, level:${recipe.level} xpNext:${recipe.xpNext}`);
    }
}