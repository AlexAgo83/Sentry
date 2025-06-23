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

export class ActionManager extends CoreManager {

    constructor(instance) {
        super(instance);
        this.selectedRecipe = null;
    }
    
    loadAction = (id, player) => {
        if (!id) {
            console.log("loadAction:Action not found");
            return null;
        }
        // console.log("loadAction:" + id + " action loaded");
        const actionResult = this.createActionByID(id, player);
        player.setSelectedAction(actionResult);
        return actionResult;
    }

    /**
     * Creates an action based on the provided identifier.
     * 
     * @param {string} identifier - The type of action to create.
     * @param {...any} args - Additional arguments for the action constructor.
     * @returns {Object|null} - The created action instance or null if not found.
     */
    createActionByID = (identifier, ...args) => {
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
}