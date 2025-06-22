// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// excavationSkill.js

import { Skill } from "./skill.js";

export class ExcavationSkill extends Skill {
    constructor() {
        super("Excavation");
        this.baseInterval = 2000;
    }
}