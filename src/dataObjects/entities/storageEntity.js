// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// storageEntity.js

import { Entity } from "../entity.js";

export const STATIC_DEFAULT_GOLD = 150;

export class StorageEntity extends Entity {
    
    constructor(identifier) {
        super(identifier);

        this.gold = STATIC_DEFAULT_GOLD;

        this.setOnLoad((storageData) => {
            this.gold = storageData.gold ?? STATIC_DEFAULT_GOLD;
        });
        this.setOnSave(() => {
            const resultSave = {
                gold: this.gold
            };
            return resultSave;
        });
    }

}
