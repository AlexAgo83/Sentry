// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// action.js

import { Entity } from "../entity.js";

import { PlayerEntity } from "../entities/playerEntity.js";
import { RecipeEntity } from "../recipes/recipeEntity.js";
import { SkillEntity } from "../skills/skillEntity.js";

export const STATIC_DEFAULT_GOLD_MODIFIER = 1
export const STATIC_DEFAULT_XP_SKILL_MODIFIER = 1;
export const STATIC_DEFAULT_XP_RECIPE_MODIFIER = 2;
export const STATIC_DEFAULT_STAMINA_MODIFIER = 10;
export const STATIC_DEFAULT_STUN_TIME = 5000;

export class Action extends Entity {

    constructor(identifier, player) {
        super(identifier);

        this.player = player;

        this.goldModifier = STATIC_DEFAULT_GOLD_MODIFIER;
        this.xpSkillModifier = STATIC_DEFAULT_XP_SKILL_MODIFIER;
        this.xpRecipeModifier = STATIC_DEFAULT_XP_RECIPE_MODIFIER;
        this.staminaModifier = STATIC_DEFAULT_STAMINA_MODIFIER;
        this.stunTime = STATIC_DEFAULT_STUN_TIME;

        this.currentInterval = 0;
        this.progression = 0;
        this.lastExecutionTime = null;
        this.setOnLoad((actionData) => {});
        this.setOnSave(() => {
            return this.getIdentifier();
        });
        this.startInterval = null;
    }

    /**
     * Retrieves the player associated with the action.
     * @returns {PlayerEntity} The player entity associated with the action.
     */
    getPlayer = () => {
        return this.player;
    }

    /**
     * Retrieves the skill associated with the action.
     * @returns {SkillEntity} The skill entity or null if not found.
     */
    getSkill = () => {
        return this.player?.skills?.get(this.getIdentifier());
    }

    /**
     * Retrieves the recipe associated with the action.
     * @returns {RecipeEntity|null} The recipe entity or null if not found.
     */
    getRecipe = () => {
        return this.getSkill()?.getSelectedRecipe();
    }
    
    /**
     * @returns {number|null} The current progress (0-100) of the action
     */
    getProgression = () => {
        return Number.isFinite(this.progression) ? this.progression : 0;
    }

    /**
     * Returns the current progress percentage based on the internal timer.
     * @returns {number} Progress from 0 to 100.
     */
    getProgressPercent = () => {
        const actionInterval = this.actionInterval(this.player);
        if (actionInterval <= 0) return 0;
        const ratio = (this.currentInterval / actionInterval) * 100;
        return Math.max(0, Math.min(100, ratio));
    }

    /**
     * Returns the time left until the action is finished.
     * @returns {number} The time left in milliseconds
     */
    getTimeLeft = () => {
        const diff = this.getSkill().baseInterval - this.currentInterval;
        return diff > 0 ? diff : 0;
    }

    /**
     * Sets the function to be called when the action is executed.
     * @param {*} onDoAction - The function to be called when the action is executed.
     */
    setOnDoAction = (onDoAction) => {
        this.onDoAction = onDoAction;
    }

    /**
     * The function to be called when the action is executed.
     * @returns {boolean}
     */
    onDoAction = () => {
        // Default onDoAction ...
        console.log("onDoAction:Default onDoAction ...");
        return false;
    }

    /**
     * Executes the action for the given player.
     * @param {Object} player - The player object performing the action.
     * @param {number} loopInterval - The time interval for the game loop.
     * @returns {number|null} The extra time to be used for the next action.
     */
    doAction = (player, loopInterval) => {
        if (this.getSkill()?.getSelectedRecipe() == null) {
            console.log("doAction:No recipe selected.");
            return null;
        }

        let diffToReturn = 0;

        // Each turn, add loop interval time to current action interval time
        this.currentInterval += loopInterval;

        const actionInterval = this.actionInterval(player);

        const diffInterval = actionInterval - this.currentInterval;
        if (this.currentInterval >= actionInterval) {
            // If current interval is greater than base interval 
            // Action is ready to go and now we need to keep extra time for next action...     
            diffToReturn = -diffInterval;
            this.lastExecutionTime = this.currentInterval;
            this.currentInterval -= actionInterval;
            this.progression = 100;

            if (this.player.stamina <= 0)
                this.player.stamina = this.player.staminaMax;

            // (VERBOSE) 
            // console.log("doAction:Action ready to start, 
            //      time used:" + this.lastExecutionTime + "ms, 
            //      time left:" + diffToReturn + "ms");
        } else {
            // If current interval is less than base interval
            // Action is not ready, so we need to :
            // * Compute action progression : (currentInterval / baseInterval) * 100
            // * Return diffInterval (negative value)
            this.progression = (this.currentInterval / actionInterval) * 100;
            return diffInterval;
        }
        
        /** Time to do action */
        if (this.onDoAction()) {

            const currSkill = this.getSkill();
            const currRecipe = this.getSkill()?.getSelectedRecipe();
    
            player.storage.gold += this.goldModifier;
            player.stamina -= this.staminaModifier;
            currSkill.xp += this.xpSkillModifier;
            currRecipe.xp += this.xpRecipeModifier;

            // Test if skill xp reach limit and need to call levelup
            if (currSkill.xp >= currSkill.xpNext) {
                this.levelUpSkill(currSkill);
            }

            // Test if recipe xp reach limit and need to call levelup
            if (currRecipe.xp >= currRecipe.xpNext) {
                this.levelUpRecipe(currRecipe);
            }

            // Test stamina 
            // if (player.stamina <= player.staminaMax) {
            //     player.stamina = player.staminaMax;
            //     this.currentInterval -= STATIC_DEFAULT_STUN_TIME;
            // }

        } else console.log("doAction:Action failed."); 

        return diffToReturn;
    
    };

    /**
     * Compute the time the action will take in ms, 
     * based on the player's stamina and the action's interval.
     * If the player's stamina is 0, add the stun time to the action's interval.
     * @param {*} player 
     * @returns {number} The time the action will take in ms.
     */
    actionInterval = (player) => {
        return this.getSkill().baseInterval + (player.stamina <= 0 ? this.stunTime:0)
    }

    /**
     * Level up the given skill object if possible.
     * 
     * @param {SkillEntity} skillObject - The skill object to level up.
     * @returns {void}
     */
    levelUpSkill = (skillObject) => {
        if (skillObject.level >= skillObject.maxLevel) return;

        skillObject.xp -= skillObject.xpNext;
        skillObject.level += 1;
        skillObject.xpNext = Math.floor(skillObject.xpNext * skillObject.xpNextMultiplier);

        const player = this.getPlayer();
        // player.dmg += 1;
        console.log(`(Level Up) PlayerID:${player.getIdentifier()}, SkillID:${skillObject.getIdentifier()}, newLevel:${skillObject.level}`);
    }

    /**
     * Level up the given recipe object if possible.
     * 
     * @param {RecipeEntity} recipeObject - The recipe object to level up.
     * @returns {void}
     */
    levelUpRecipe = (recipeObject) => {
        if (recipeObject.level >= recipeObject.maxLevel) return;

        recipeObject.xp -= recipeObject.xpNext;
        recipeObject.level += 1;
        recipeObject.xpNext = Math.floor(recipeObject.xpNext * recipeObject.xpNextMultiplier);

        console.log(`(Level Up) PlayerID:${this.getPlayer().getIdentifier()}, RecipeId:${recipeObject.getIdentifier()}, newLevel:${recipeObject.level}`);
    }
}
