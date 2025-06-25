// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// game.js

// Plan to 0.2.X :
// Stage 001 - Basics UI ; Img, Btn and Selector
// Stage 002 - Workflow : (Select)Skill -> (Select)Recipe -> (Button)Action
// Stage 003 - Offline Processing on thread

import { DataManager } from "./managers/dataManager.js";
import { SkillManager } from "./managers/skillManager.js";
import { RecipeManager } from "./managers/recipeManager.js";
import { ActionManager } from "./managers/actionManager.js";
import { PlayerManager } from "./managers/playerManager.js";
import { DialogManager } from "./managers/dialogManager.js";
import { PanelManager } from "./managers/panelManager.js";

/* global __APP_VERSION__ */
let parseEngineVersion = () => { 
    try {
        // @ts-ignore
        return __APP_VERSION__ 
    } catch (error) {
        return "<DEBUG>";
    }
}
export const STATIC_GAME_VERSION = parseEngineVersion();

/* Loop Settings */
export const STATIC_DEFAULT_LOOP_INTERVAL = 250;
export const STATIC_DEFAULT_LOOP_OFFLINE = 500;
export const STATIC_DEFAULT_OFFLINE_THRESHOLD = 1.5;

export class Engine {

    constructor() {
        this.lastIntervalTime = null;
        
        this.loopInterval = STATIC_DEFAULT_LOOP_INTERVAL;
        this.loopIntervalOffline = STATIC_DEFAULT_LOOP_OFFLINE;
        this.loopIntervalOfflineThreshold = STATIC_DEFAULT_OFFLINE_THRESHOLD;

        this.dataManager = new DataManager(this);
        this.skillManager = new SkillManager(this);
        this.recipeManager = new RecipeManager(this);
        this.actionManager = new ActionManager(this);
        this.playerManager = new PlayerManager(this);
        this.dialogManager = new DialogManager(this);
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
    stopLoop = () => {
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
        let handleOfflineLoop = null;
        this.interval = setInterval(() => {    
            /* Skip if already handling offline */
            if (handleOfflineLoop) return;

            /** Start collect offline time */
            const startTime = Date.now();
            if (this.lastIntervalTime) {
                const diff = startTime - this.lastIntervalTime;
                const threshold = this.loopInterval * this.loopIntervalOfflineThreshold;
                if (diff > threshold) {
                    handleOfflineLoop = new Promise((resolve) => {
                        this.offlineLoop(diff);    
                        resolve(true);
                    });
                }
            }
            
            /** Handling offline process or run common action */
            if (handleOfflineLoop) {
                Promise.all([handleOfflineLoop]).then(() => {
                    handleOfflineLoop = null;    
                    this.onRunAction(startTime);
                });
            } else this.onRunAction(startTime);
        }, this.loopInterval);
    }

    onRunAction = (startTime) => {
        /** Threads management */
        this.lastIntervalTime = startTime;
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
    }

    /**
     * Handles the game loop when the game was offline for a period.
     * @param {number} diff - The time difference in milliseconds since the last interval.
     */
    offlineLoop = (diff) => {        
        let howMuchLoops = Math.floor(diff / this.loopIntervalOffline);
        const memHowMuchLoops = howMuchLoops;
        if (howMuchLoops > 0) {
            console.log(`Offline for ${diff}ms, looping ${howMuchLoops} times, in progress...`);
            const garbageTime = new Map();
            let skippedLoop = 0;
            for (let i = 1; i < howMuchLoops; i++) {
                this.playerManager.getPlayers().forEach((player) => {
                    if (player.getSelectedAction()) {
                        let gt = garbageTime.get(player.getIdentifier()) ?? 0;
                        const actionDiff = player.getSelectedAction().doAction(player, this.loopIntervalOffline);
                        gt += actionDiff;
                        if (gt >= this.loopIntervalOffline) {
                            howMuchLoops -= 1;
                            gt -= this.loopIntervalOffline;
                            skippedLoop++;
                        }
                        garbageTime.set(player.getIdentifier(), 0);
                    }
                });
            }
            this.dialogManager.openOffline(diff, memHowMuchLoops, skippedLoop)
            console.log(`Offline '${howMuchLoops} actions' processed ! loop skipped: ${skippedLoop}`);
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
        console.log("Engine start !");
    }
}