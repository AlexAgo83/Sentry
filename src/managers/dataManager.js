// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// dataManager.js

import { CoreManager } from "./coreManager.js";

export const STATIC_SAVEGAME_TAG = "saveGame-v9";
export class DataManager extends CoreManager {
    constructor(instance) {
        super(instance);
    }

    /**
     * Save the game data
     * @returns {object} The saved data object
     */
    save = () => {
        // console.log("Game data to save", this.players);

        const savedData = {};
        const savedPlayers = {};

        if (this.instance.lastIntervalTime && this.instance.lastIntervalTime > 0) {
            savedData.lastIntervalTime = this.instance.lastIntervalTime;
        }
        this.instance.playerManager.savePlayers(savedPlayers, savedData);

        localStorage.setItem(STATIC_SAVEGAME_TAG, JSON.stringify(savedData));

        // console.log("Game data saved", savedData);
        return savedData;
    }

    /**
     * Load the game data
     * @returns {object} The loaded data object
     */
    load = () => {
        const savedDataString = localStorage.getItem(STATIC_SAVEGAME_TAG);
        const savedData = savedDataString ? JSON.parse(savedDataString) : {};
        // console.log("saveGame to load", savedData);

        if (savedData.lastIntervalTime) {
            this.instance.lastIntervalTime = savedData.lastIntervalTime;
        }

        this.instance.playerManager.loadPlayers(savedData);

        return savedData;
    }
}
