// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// metalWorkSkill.js

import { SkillEntity } from "./skillEntity.js";

export class MetalWorkSkill extends SkillEntity {
    constructor() {
        super(
            "MetalWork",
            "ic_metalWork.png");
        this.baseInterval = 2500;
    }
}