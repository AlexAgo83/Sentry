// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// actionManager.js

import { CoreManager } from "./coreManager.js";
import { CombatAction } from "../dataObjects/combatAction.js";

export class ActionManager extends CoreManager {

    constructor(instance) {
        super(instance);
    }

    loadAction(id, player) {
        if (!id) {
            console.log("loadAction:Action not found");
            return null;
        }
        console.log("loadAction:" + id + " action loaded");
        return this.createActionByID(id, player);
    }

    createActionByID(id, ...args) {
        if (id == "Combat") {
            console.log("createActionByID:Combat action created");
            return new CombatAction(...args);
        } else {
            console.log("createActionByID:Action not found");
        }
        return null;
    }
}