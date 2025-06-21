// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// actionManager.js

import { CoreManager } from "./coreManager.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { HuntAction } from "../dataObjects/actions/huntAction.js";

export class ActionManager extends CoreManager {

    constructor(instance) {
        super(instance);
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

    createActionByID = (id, ...args) => {
        if (id == "Combat") {
            console.log("createActionByID:Combat action created");
            return new CombatAction(...args);
        } else if (id == "Hunt") {
            console.log("createActionByID:Hunt action created");
            return new HuntAction(...args);
        } else {
            console.warn("createActionByID:Action not found, id: " + id);
        }
        return null;
    }
}