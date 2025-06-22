// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// actionManager.js

import { CoreManager } from "./coreManager.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { HuntingAction } from "../dataObjects/actions/huntingAction.js";
import { CookingAction } from "../dataObjects/actions/cookingAction.js";

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
        console.log("loadAction:" + id + " action loaded");
        const actionResult = this.createActionByID(id, player);
        player.setSelectedAction(actionResult);
        return actionResult;
    }

    createActionByID = (identifier, ...args) => {
        if (identifier == "Combat") {
            console.log("createActionByID:Combat action created");
            return new CombatAction(...args);
        } else if (identifier == "Hunting") {
            console.log("createActionByID:Hunting action created");
            return new HuntingAction(...args);
        } else if (identifier == "Cooking") {
            console.log("createActionByID:Cooking action created");
            return new CookingAction(...args);
        } else {
            console.warn("createActionByID:Action not found, id: " + identifier);
        }
        return null;
    }
}