// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// entity.js

export class Entity {

    constructor(id) {
        this.id = id;
    }
    
    getIdentifier() {
        return this.id;
    }

    setOnLoad(onLoad = (entityData) => {}) {
        this.onLoad = onLoad;
    }
    setOnSave(onSave = () => {return {}}) {
        this.onSave = onSave;
    }

    load(entityData) {
        if (entityData) {
            if (this.onLoad) this.onLoad(entityData);
            console.log("Entity loaded", entityData);
        } else console.log("Entity data not found");
    }

    save() {
        return this.onSave ? this.onSave() : {};
    }
}