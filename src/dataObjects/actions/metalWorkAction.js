// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// metalWorkAction.js

import { Action } from "./action.js";

export class MetalWorkAction extends Action {

    constructor(player) {
        super("MetalWork", player);
        // this.goldModifier = 1;
        // this.xpSkillModifier = 1;
        // this.xpRecipeModifier = 2;
        this.setOnDoAction(() => {
            this.craft();
            return true;
        })
    }

    craft = () => {
        // ...
    }
}