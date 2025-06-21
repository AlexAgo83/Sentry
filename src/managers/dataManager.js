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

        if (this.instance.lastIntervalTime && this.instance.lastIntervalTime > 0) {
            savedData.lastIntervalTime = this.instance.lastIntervalTime;
        }

        this.instance.playerManager.savePlayers(savedPlayers, savedData);
        localStorage.setItem('saveGame-v0', JSON.stringify(savedData));
    }

    load = () => {
        const savedDataString = localStorage.getItem('saveGame-v0');
        const savedData = savedDataString ? JSON.parse(savedDataString) : {};
        console.log("saveGame to load", savedData);

        if (savedData.lastIntervalTime) {
            this.instance.lastIntervalTime = savedData.lastIntervalTime;
        }
        this.instance.playerManager.loadPlayers(savedData);
        return savedData;
    }
}
