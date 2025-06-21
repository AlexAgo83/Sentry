// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// game.js

import { DataManager } from "./managers/dataManager.js";
import { ActionManager } from "./managers/actionManager.js";
import { PlayerManager } from "./managers/playerManager.js";
import { PanelManager } from "./managers/panelManager.js";

export class Game {

    constructor() {
        this.lastIntervalTime = null;
        this.loopInterval = 500;

        this.dataManager = new DataManager(this);
        this.actionManager = new ActionManager(this);
        this.playerManager = new PlayerManager(this);
        this.panelManager = new PanelManager(this);
    }

    resetUI = () => {
        this.panelManager.remove();
    }

    resetInstance = () => {
        clearInterval(this.interval);
        this.playerManager.reset();
        this.resetUI();
        console.log("Instance reset");
    }

    /** UI Setup */
    initUI = () => {
        this.panelManager.init();
    }

    /** Update the game UI */
    updateUI = () => {
        this.panelManager.refresh();
    }

    stopAction = () => {
        if (this.interval) clearInterval(this.interval);
    }

    runAction = () => {
        if (this.interval) clearInterval(this.interval);
        /** GAME LOOP */
        this.interval = setInterval(() => {
            const dateNow = Date.now();
            if (this.lastIntervalTime) {
                const diff = dateNow - this.lastIntervalTime;
                if (diff > 1000) {
                    // Is this offline ?
                    const howMuchLoops = Math.floor(diff / this.loopInterval);
                    console.log(`Offline for ${diff}ms, looping ${howMuchLoops} times.`);
                }
            }
            
            this.lastIntervalTime = dateNow;
            this.playerManager.getPlayers().forEach((player) => {
                if (player.getSelectedAction()) {
                    player.getSelectedAction().doAction();
                }
            });

            this.updateUI();
            this.dataManager.save();
        }, this.loopInterval);
    }

    startup = () => {
        console.log("Startup ...");
        this.initUI();
        this.runAction();
        console.log("Game start !");
    }
}

const _game = new Game();
_game.dataManager.load();
_game.startup();