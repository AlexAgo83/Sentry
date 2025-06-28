// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// excavationAction.js

import { Action } from "./action.js";

export class ExcavationAction extends Action {

    constructor(player) {
        super("Excavation", player);
        // this.goldModifier = 1;
        // this.xpSkillModifier = 1;
        // this.xpRecipeModifier = 2;
        this.setOnDoAction(() => {
            this.excavation();
            return true;
        })
    }

    excavation = () => {
        // ...
    }
}