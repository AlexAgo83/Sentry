// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// game.js

import { DataManager } from "./managers/dataManager.js";
import { SkillManager } from "./managers/skillManager.js";
import { RecipeManager } from "./managers/recipeManager.js";
import { ActionManager } from "./managers/actionManager.js";
import { PlayerManager } from "./managers/playerManager.js";
import { PanelManager } from "./managers/panelManager.js";

export const STATIC_GAME_VERSION = "0.1.0";

export class Game {

    constructor() {
        this.lastIntervalTime = null;
        this.loopInterval = 50;
        this.loopIntervalOffline = 500;
        this.loopIntervalOfflineThreshold = 1.5;

        this.dataManager = new DataManager(this);
        this.skillManager = new SkillManager(this);
        this.recipeManager = new RecipeManager(this);
        this.actionManager = new ActionManager(this);
        this.playerManager = new PlayerManager(this);
        this.panelManager = new PanelManager(this);
    }

    getGameVersion = () => {
        return STATIC_GAME_VERSION;
    }

    /**
     * Resets the UI
     */
    resetUI = () => {
        this.panelManager.remove();
    }

    /**
     * Resets the instance
     */
    resetInstance = () => {
        clearInterval(this.interval);
        this.playerManager.reset();
        this.resetUI();
        console.log("Instance reset");
    }

    /**
     * Initializes the UI
     */
    initUI = () => {
        this.panelManager.init();
    }

    /**
     * Updates the UI
     */
    updateUI = () => {
        this.panelManager.refresh();
    }

    /**
     * Stops the game loop
     */
    stopAction = () => {
        if (this.interval) {
            clearInterval(this.interval);
            console.log("Game loop stopped");
        }
    }

    /**
     * Starts the game loop
     */
    runAction = () => {
        if (this.interval) clearInterval(this.interval);
        /** GAME LOOP */
        this.interval = setInterval(() => {
            const startTime = Date.now();
            if (this.lastIntervalTime) {
                const diff = startTime - this.lastIntervalTime;
                const threshold = this.loopInterval * this.loopIntervalOfflineThreshold;
                if (diff > threshold) {
                    this.offlineLoop(diff);
                }
            }
            
            this.lastIntervalTime = startTime;
            
            /** Threads management */
            this.threads = [];
            this.playerManager.getPlayers().forEach((player) => {
                if (player.getSelectedAction()) {
                    const asyncAction = () => {
                        return new Promise((resolve) => {
                            const actionDiff = player.getSelectedAction().doAction(player, this.loopInterval);
                            resolve(true);
                        });
                    }
                    this.threads?.push(asyncAction());
                }
            });
            Promise.all(this.threads).then(() => {
                this.dataManager.save();
                this.updateUI();
                this.executionTime = Date.now() - startTime;
                this.threads = [];
            });
        }, this.loopInterval);
    }


    /**
     * Handles the game loop when the game was offline for a period.
     * @param {number} diff - The time difference in milliseconds since the last interval.
     */
    offlineLoop = (diff) => {        
        let howMuchLoops = Math.floor(diff / this.loopIntervalOffline);
        if (howMuchLoops > 0) {
            console.log(`Offline for ${diff}ms, looping ${howMuchLoops} times, in progress...`);
            let garbageTime = 0;
            for (let i = 1; i < howMuchLoops; i++) {
                this.playerManager.getPlayers().forEach((player) => {
                    if (player.getSelectedAction()) {
                        const actionDiff = player.getSelectedAction().doAction(player, this.loopIntervalOffline);
                        garbageTime += actionDiff;
                        if (garbageTime >= this.loopIntervalOffline) {
                            console.log(`Offline loop ${i}/${howMuchLoops} - ActionTime:${actionDiff}ms - garbage time ${garbageTime}ms, one loop skipped`);
                            howMuchLoops -= 1;
                            garbageTime -= this.loopIntervalOffline;
                        }
                    }
                });
            }
            console.log("Offline looping done !");
        }
    }

    /**
     * Turn on the game
     */
    startup = () => {
        console.log("Startup ...");
        this.dataManager.load();
        this.initUI();
        this.runAction();
        console.log("Game start !");
    }
}

const _game = new Game();
_game.startup();