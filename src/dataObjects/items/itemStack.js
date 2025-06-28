// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// itemStack.js

import { ItemEntity } from "./itemEntity";

export class ItemStack extends ItemEntity {

    constructor(identifier, itemEntity, quantity) {
        super(identifier);
        this.item = itemEntity;
        this.quantity = quantity;
    }
    
}