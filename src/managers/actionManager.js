// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// actionManager.js

import { CoreManager } from "./coreManager.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { HuntingAction } from "../dataObjects/actions/huntingAction.js";
import { CookingAction } from "../dataObjects/actions/cookingAction.js";
import { ExcavationAction } from "../dataObjects/actions/excavationAction.js";
import { MetalWorkAction } from "../dataObjects/actions/metalWorkAction.js";

import { PlayerEntity } from "../dataObjects/entities/playerEntity.js";
import { Action } from "../dataObjects/actions/action.js";

/**
 * Creates an action based on the provided identifier.
 * 
 * @param {string} identifier - The type of action to create.
 * @param {...any} args - Additional arguments for the action constructor.
 * @returns {Object|null} - The created action instance or null if not found.
 */
export const createActionByID = (identifier, ...args) => {
    if (identifier == "Combat") {
        return new CombatAction(...args);
    } else if (identifier == "Hunting") {
        return new HuntingAction(...args);
    } else if (identifier == "Cooking") {
        return new CookingAction(...args);
    } else if (identifier == "Excavation") {
        return new ExcavationAction(...args)
    } else if (identifier == "MetalWork") {
        return new MetalWorkAction(...args)
    } else {
        console.error("Action not found, id (May be nothing...) " + identifier);
    }
    return null;
}

export class ActionManager extends CoreManager {

    constructor(instance) {
        super(instance);
        this.selectedRecipe = null;
    }
    
    /**
     * Loads an action based on the provided identifier and assigns it to the player.
     * 
     * @param {string} id - The identifier of the action to load.
     * @param {PlayerEntity} player - The player to whom the action will be assigned.
     * @returns {Action|null} - The loaded action instance or null if not found.
     */
    loadAction = (id, player) => {
        if (!id) {
            console.log("loadAction:Action not found");
            return null;
        }
        // console.log("loadAction:" + id + " action loaded");
        const actionResult = createActionByID(id, player);
        player.setSelectedAction(actionResult);
        return actionResult;
    }
    
}