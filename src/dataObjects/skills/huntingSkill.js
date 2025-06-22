// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// huntingSkill.js

import { SkillEntity } from "./skillEntity.js";

export class HuntingSkill extends SkillEntity {
    constructor() {
        super(
            "Hunting",
            "ress/assets/ic_hunting.png");
        this.baseInterval = 2000;
    }
}