// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// player.js

import { Entity } from "../entity.js";

export class CharacterEntity extends Entity {
    constructor(identifier) {
        super(identifier);
        this.name = "Entity_"+identifier;
    }

    setName = (name) => {
        if (name && name.trim().length > 0) {
            this.name = name.trim();
        }
    }
    getName = () => {
        return this.name;
    }
}