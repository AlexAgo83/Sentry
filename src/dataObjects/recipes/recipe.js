// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// recipe.js

import { Entity } from "../entity.js";

export class RecipeEntity extends Entity {
    constructor(identifier) {
        super(identifier);
        this.xp = 0;
        this.level = 1;
        this.maxLevel = 99;
        this.xpNext = 10;
        this.xpNextMultiplier = 1.5;

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