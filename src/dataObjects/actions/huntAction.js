// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

import { Action } from "./action.js";

// @ts-check
// combatAction.js

export class HuntAction extends Action {

    constructor(player) {
        super("Hunt", player);
        this.setOnDoAction(() => {
            this.attack();
        })
    }

    attack = () => {
        const player = this.getPlayer();
        const skill = this.getSkill();

        player.gold += 1;
        skill.xp += 1;

        if (skill.xp >= skill.xpNext) {
            this.levelUp();
        }
    }
}