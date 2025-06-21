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
        const skill = this.getSkill();
        player.gold += 1;
        skill.xp += 1;
        if (skill.xp >= skill.xpNext) {
            this.levelUp();
        }
    }

    levelUp = () => {
        const player = this.getPlayer();
        const skill = this.getSkill();
        skill.xp -= skill.xpNext;
        skill.level += 1;
        skill.xpNext = Math.floor(skill.xpNext * 1.5);
        player.dmg += 1;
        console.log(`levelUp:Level up! Now level ${skill.level} xpNext ${skill.xpNext}`);
    }
}