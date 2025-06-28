// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// storageEntity.js

import { Entity } from "../entity";

export const STATIC_DEFAULT_GOLD = 0;

export class StorageEntity extends Entity {
    
    constructor(identifier) {
        super(identifier);
        this.gold = STATIC_DEFAULT_GOLD;

        this.setOnLoad((storageData) => {

        });
        this.setOnSave(() => {
            const resultSave = {
                // name: this.name,
            };
            return resultSave;
        });
    }

}