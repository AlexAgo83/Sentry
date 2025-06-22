// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// combatSkill.js

import { SkillEntity } from "./skillEntity.js";

export class CombatSkill extends SkillEntity {
    constructor() {
        super(
            "Combat",
            "assets/ic_combat.png");
        this.baseInterval = 1500;
    }
}