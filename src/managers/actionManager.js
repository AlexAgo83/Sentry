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
        if (id == "Combat") {
            player.setSelectedAction(new CombatAction(player));
        }
        return 
    }
}