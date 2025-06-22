// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

import { Action } from "./action.js";

// @ts-check
// combatAction.js

export class CombatAction extends Action {

    constructor(player) {
        super("Combat", player);
        this.setOnDoAction(() => {
            this.attack();
            return true;
        })
    }

    attack = () => {
        const player = this.getPlayer();
        const skill = this.getSkill();
        const recipe = skill.getSelectedRecipe();

        player.gold += 1;
        
        skill.xp += 1;
        recipe.xp += 2;
    }
}