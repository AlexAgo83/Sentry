// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// action.js

import { Entity } from "../entity.js";

export class Action extends Entity {

    constructor(identifier, player) {
        super(identifier);
        this.player = player;
        this.progression = null;
        this.setOnLoad((actionData) => {
            // ...
        });
        this.setOnSave(() => {
            return this.getIdentifier();
        });
        this.startInterval = null;
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

    getProgression = () => {
        return this.progression;
    }

    setOnDoAction(onDoAction) {
        this.onDoAction = onDoAction;
    }

    onDoAction = () => {
        // Default onDoAction ...
        console.log("onDoAction:Default onDoAction ...");
        return false;
    }

    doAction = (player, intervalFilter=true) => {
        if (this.getSkill().getSelectedRecipe()) {
            /** Test interval */
            if (this.startInterval == null) this.startInterval = Date.now();
            else {
                /** Request found */
                const diffInterval = Date.now() - this.startInterval;
                if (diffInterval >= this.getSkill().baseInterval) {
                    this.startInterval = null;
                } else if (diffInterval > 0 && isFinite(diffInterval)) {
                    this.progression = Math.floor((diffInterval / this.getSkill().baseInterval) * 100);
                }
                return
            }
            /** Time to do action */
            if (this.onDoAction()) {
                const currSkill = this.getSkill();
                const currRecipe = this.getSkill()?.getSelectedRecipe();
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
        if (skillObject.level >= skillObject.maxLevel) return;

        skillObject.xp -= skillObject.xpNext;
        skillObject.level += 1;
        skillObject.xpNext = Math.floor(skillObject.xpNext * 1.5);

        const player = this.getPlayer();
        player.dmg += 1;
        console.log(`(Level Skill up!) 
            PlayerID:${player.getIdentifier()}, 
            Skill:${skillObject.getIdentifier()}, 
            level:${skillObject.level} 
            xpNext:${skillObject.xpNext}`);
    }

    levelUpRecipe = (recipeObject) => {
        if (recipeObject.level >= recipeObject.maxLevel) return;

        recipeObject.xp -= recipeObject.xpNext;
        recipeObject.level += 1;
        recipeObject.xpNext = Math.floor(recipeObject.xpNext * 1.5);

        console.log(`(Level Recipe up!) 
            PlayerID:${this.getPlayer().getIdentifier()}, 
            Recipe:${recipeObject.getIdentifier()}, 
            level:${recipeObject.level} 
            xpNext:${recipeObject.xpNext}`);
    }
}