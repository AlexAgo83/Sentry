// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// itemEntity.js

import { STATIC_IC_ITEM } from "../../managers/assetManager.js";
import { Entity } from "../entity.js";

export class ItemEntity extends Entity {
    
    constructor(identifier) {
        super(identifier);
        this.name = "Item_"+identifier;
        this.media = STATIC_IC_ITEM;
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