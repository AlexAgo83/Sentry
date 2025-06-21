// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// skill.js

import { Entity } from "../entity.js";

export class Skill extends Entity {
    constructor(identifier) {
        super(identifier);
        this.xp = 0;
        this.level = 1;
        this.xpNext = 10;

        this.setOnLoad((skillData) => {
            this.xp = skillData.xp;
            this.level = skillData.level;
            this.xpNext = skillData.xpNext;
        })
        
        this.setOnSave(() => {
            return {
                id: this.getIdentifier(),
                xp: this.xp,
                xpNext: this.xpNext,
                level: this.level
            };
        })
    }

}