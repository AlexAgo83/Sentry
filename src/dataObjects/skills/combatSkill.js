// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// combatSkill.js

import { Skill } from "./skill.js";

export class CombatSkill extends Skill {
    constructor() {
        super("Combat");
        this.baseInterval = 1500;
    }
}