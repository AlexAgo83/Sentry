// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// action.js

import { Entity } from "../entity.js";

export class Action extends Entity {

    constructor(identifier, player) {
        super(identifier);
        this.player = player;
        this.currentInterval = 0;
        this.progression = null;
        this.lastExecutionTime = null;
        this.setOnLoad((actionData) => {});
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
    getTimeLeft = () => {
        const diff = this.getSkill().baseInterval - this.currentInterval;
        return diff > 0 ? diff : 0;
    }

    setOnDoAction(onDoAction) {
        this.onDoAction = onDoAction;
    }

    onDoAction = () => {
        // Default onDoAction ...
        console.log("onDoAction:Default onDoAction ...");
        return false;
    }

    doAction = (player, loopInterval) => {
        if (this.getSkill().getSelectedRecipe()) {
            let diffToReturn = 0;

            // Each turn, add loop interval time to current action interval time
            this.currentInterval += loopInterval;

            const diffInterval = this.getSkill().baseInterval - this.currentInterval;
            if (this.currentInterval >= this.getSkill().baseInterval) {
                // If current interval is greater than base interval 
                // Action is ready to go and now we need to keep extra time for next action...     
                diffToReturn = -diffInterval;
                this.lastExecutionTime = this.currentInterval;
                this.currentInterval -= this.getSkill().baseInterval;
                this.progression = 100;
                // (VERBOSE) 
                // console.log("doAction:Action ready to start, 
                //      time used:" + this.lastExecutionTime + "ms, 
                //      time left:" + diffToReturn + "ms");
            } else {
                // If current interval is less than base interval
                // Action is not ready, so we need to :
                // * Compute action progression : (currentInterval / baseInterval) * 100
                // * Return diffInterval (negative value)
                this.progression = (this.currentInterval / this.getSkill().baseInterval) * 100;
                return diffInterval;
            }
            
            /** Time to do action */
            if (this.onDoAction()) {
                const currSkill = this.getSkill();
                const currRecipe = this.getSkill()?.getSelectedRecipe();
                // Test if skill xp reach limit and need to call levelup
                if (currSkill.xp >= currSkill.xpNext) {
                    this.levelUpSkill(currSkill);
                }
                // Test if recipe xp reach limit and need to call levelup
                if (currRecipe.xp >= currRecipe.xpNext) {
                    this.levelUpRecipe(currRecipe);
                }
            } else console.log("doAction:Action failed."); 

            return diffToReturn;
        } else {
            console.log("doAction:No recipe selected.");
        }
    };

    levelUpSkill = (skillObject) => {
        if (skillObject.level >= skillObject.maxLevel) return;

        skillObject.xp -= skillObject.xpNext;
        skillObject.level += 1;
        skillObject.xpNext = Math.floor(skillObject.xpNext * skillObject.xpNextMultiplier);

        const player = this.getPlayer();
        player.dmg += 1;
        console.log(`(Level Up) PlayerID:${player.getIdentifier()}, SkillID:${skillObject.getIdentifier()}, newLevel:${skillObject.level}`);
    }

    levelUpRecipe = (recipeObject) => {
        if (recipeObject.level >= recipeObject.maxLevel) return;

        recipeObject.xp -= recipeObject.xpNext;
        recipeObject.level += 1;
        recipeObject.xpNext = Math.floor(recipeObject.xpNext * recipeObject.xpNextMultiplier);

        console.log(`(Level Up) PlayerID:${this.getPlayer().getIdentifier()}, RecipeId:${recipeObject.getIdentifier()}, newLevel:${recipeObject.level}`);
    }
}