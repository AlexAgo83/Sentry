// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// metalWorkSkill.js

import { Skill } from "./skill.js";

export class MetalWorkSkill extends Skill {
    constructor() {
        super("MetalWork");
        this.baseInterval = 2500;
    }
}