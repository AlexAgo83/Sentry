// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

import { Entity } from "./entity.js";

// @ts-check
// player.js

export class Player extends Entity {

    constructor(id) {
        super(id)
        this.name = "Player_"+id;
        this.hp = 100;
        this.xp = 0;
        this.xpNext = 10;
        this.level = 1;
        this.gold = 0;
        this.dmg = 1;
        this.actionCombat = false;

        this.setOnLoad((entityData) => {
            this.name = entityData.name;
            this.hp = entityData.hp;
            this.xp = entityData.xp;
            this.xpNext = entityData.xpNext;
            this.level = entityData.level;
            this.gold = entityData.gold;
            this.dmg = entityData.dmg;
            this.actionCombat = entityData.actionCombat;
        });

        this.setOnSave(() => {
            return {
                name: this.name,
                hp: this.hp,
                xp: this.xp,
                xpNext: this.xpNext,
                level: this.level,
                gold: this.gold,
                dmg: this.dmg,
                actionCombat: this.actionCombat
            };
        });
    }


    setCombat(isCombat) {
        this.actionCombat = isCombat;
    }
    isCombat() {
        return this.actionCombat;
    }

    attack() {
        this.gold += 1;
        this.xp += 1;
        if (this.xp >= this.xpNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.xp -= this.xpNext;
        this.level += 1;
        this.xpNext = Math.floor(this.xpNext * 1.5);
        this.dmg += 1;
        console.log(`player:Level up! Now level ${this.level}`);
    }

}