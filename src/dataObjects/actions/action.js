// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// action.js

import { Entity } from "../entity.js";

export class Action extends Entity {

    constructor(identifier, player) {
        super(identifier);
        this.player = player;
        this.setOnLoad((actionData) => {
            // ...
        });
        this.setOnSave(() => {
            return this.getIdentifier();
        });
    }

    getPlayer = () => {
        return this.player;
    }

    getSkill = () => {
        return this.player.skills.get(this.getIdentifier());
    }

    setOnDoAction(onDoAction) {
        this.onDoAction = onDoAction;
    }

    onDoAction = () => {
        // Default onDoAction ...
        console.log("onDoAction:Default onDoAction ...");
    }

    doAction = (player) => {
        this.onDoAction();
    };

    levelUp = () => {
        const player = this.getPlayer();
        const skill = this.getSkill();

        skill.xp -= skill.xpNext;
        skill.level += 1;
        skill.xpNext = Math.floor(skill.xpNext * 1.5);

        player.dmg += 1;
        console.log(`(Level up!) PlayerID:${player.getIdentifier()}, level:${skill.level} xpNext:${skill.xpNext}`);
    }
}