// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// excavationSkill.js

import { SkillEntity } from "./skillEntity.js";

export class ExcavationSkill extends SkillEntity {
    constructor() {
        super(
            "Excavation",
            "assets/ic_excavation.png");
        this.baseInterval = 2000;
    }
}