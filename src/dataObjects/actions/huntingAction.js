// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

import { Action } from "./action.js";

// @ts-check
// combatAction.js

export class HuntingAction extends Action {

    constructor(player) {
        super("Hunting", player);
        this.setOnDoAction(() => {
            this.attack();
            return true;
        })
    }

    attack = () => {
        const player = this.getPlayer();
        const skill = this.getSkill();
        const recipe = this.getRecipe();

        player.gold += 1;
        skill.xp += 1;
        recipe.xp += 2;
    }
}