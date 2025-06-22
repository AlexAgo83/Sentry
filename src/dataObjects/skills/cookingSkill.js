// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cookingSkill.js

import { SkillEntity } from "./skillEntity.js";

export class CookingSkill extends SkillEntity {
    constructor() {
        super(
            "Cooking",
            "assets/ic_cooking.png");
        this.baseInterval = 2500;
    }
}