// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// dataManager.js

import { CoreManager } from "./coreManager.js";

export class DataManager extends CoreManager {
    constructor(instance) {
        super(instance);
    }

    /* Game Data */
    save = () => {
        // console.log("Game data to save", this.players);

        const savedData = {};
        const savedPlayers = {};

        if (this.lastTick && this.lastTick > 0) {
            savedData.lastTick = this.lastTick;
        }

        this.instance.playerManager.savePlayers(savedPlayers, savedData);
        localStorage.setItem('saveGame-v0', JSON.stringify(savedData));
    }

    load = () => {
        const savedDataString = localStorage.getItem('saveGame-v0');
        const savedData = savedDataString ? JSON.parse(savedDataString) : {};
        console.log("saveGame to load", savedData);

        if (savedData.lastTick) {
            this.lastTick = savedData.lastTick;
        }
        this.instance.playerManager.loadPlayers(savedData);
        return savedData;
    }
}
