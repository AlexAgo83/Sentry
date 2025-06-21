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
        })
    }

    attack = () => {
        const player = this.getPlayer();
        player.gold += 1;
        player.xp += 1;
        if (player.xp >= player.xpNext) {
            player.levelUp();
        }
    }
}