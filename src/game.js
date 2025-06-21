// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// game.js

import { Player } from "./player.js";
import { InfoPanel } from "./infoPanel.js";
import { PlayersPanel } from "./playersPanel.js";
import { ControlsPanel } from "./controlsPanel.js";

export class Game {

    constructor() {
        this.lastTick = null;
        this.players = [];

        this.infoPanel = new InfoPanel(this);
        this.playersPanel = new PlayersPanel(this);
        this.controlsPanel = new ControlsPanel(this);
    }

    getPlayers = () => {
        return this.players;
    }

    createPlayer = (id) => {
        const newPlayer = new Player(id);
        this.players.push(newPlayer);
        this.saveGame();
        this.resetPanels();
        this.initUI();
        return newPlayer;
    }

    removePlayer = (id) => {
        this.players = this.players.filter((player) => {
            return player.id !== id;
        });
        this.saveGame();
        this.resetPanels();
        this.initUI();
    }

    /* Game Data */
    saveGame = () => {
        // console.log("Game data to save", this.players);

        const savedData = {};
        const savedPlayers = {};

        if (this.lastTick && this.lastTick > 0) {
            savedData.lastTick = this.lastTick;
        }
        if (this.players && this.players.length > 0) {   
            this.players.forEach((player) => {
                savedPlayers[player.getIdentifier()] = player.save();
            })
            savedData.players = savedPlayers;
            // console.log("Players saved", savedPlayers);
        }

        localStorage.setItem('saveGame-v0', JSON.stringify(savedData));
        // console.log("Game saved", savedData);
    }

    loadSavedGameSafe = () => {
        const savedDataString = localStorage.getItem('saveGame-v0');
        const savedData = savedDataString ? JSON.parse(savedDataString) : {};
        console.log("saveGame to load", savedData);

        if (savedData.lastTick) {
            this.lastTick = savedData.lastTick;
        }
        if (savedData.players) {
            Object.keys(savedData.players).forEach((playerId) => {
                const player = new Player(Number(playerId));
                player.load(savedData.players[playerId]);
                this.players.push(player);
            });
        }
    }

    loadSavedGameWithRestart = () => {
        this.resetInstance();
        const savedData = this.loadSavedGameSafe();
        this.initUI();
        this.runAction();
        console.log("Game loaded", savedData);
    }

    resetPanels = () => {
        this.infoPanel?.remove();
        this.playersPanel?.remove();
        this.controlsPanel?.remove();
        console.log("Panels removed");
    }

    resetInstance = () => {
        clearInterval(this.interval);
        this.players = [];
        this.resetPanels();
        console.log("Instance reset");
    }

    /** UI Setup */
    initUI = () => {
        this.infoPanel.init();
        this.playersPanel.init();
        this.controlsPanel.init();
    }

    /** Update the game UI */
    updateUI = () => {
        this.infoPanel?.refresh();
        this.playersPanel?.refresh();
        this.controlsPanel?.refresh();
    }

    stopAction = () => {
        if (this.interval) clearInterval(this.interval);
    }

    runAction = () => {
        if (this.interval) clearInterval(this.interval);
        /** GAME LOOP */
        this.interval = setInterval(() => {
            const dateNow = Date.now();
            if (this.lastTick) {
                const diff = dateNow - this.lastTick;
                if (diff > 1000) {
                    // Is this offline ?
                    console.log(`Offline for ${diff}ms`);
                }
            }
            
            this.lastTick = dateNow;
            this.players.forEach((player) => {
                if (player.isCombat()) player.attack();
            });

            this.updateUI();
            this.saveGame();
        }, 250);
    }

    debug = () => {
        /* Is First init ?! */
        if (this.players.length === 0) {
            this.createPlayer(1);
            this.createPlayer(2);
            this.createPlayer(3);
            this.saveGame()
        }
    }

    startup = () => {
        console.log("Startup ...");
        this.debug();
        
        /* Run ... */
        this.initUI();
        this.runAction();
        console.log("Game start !");
    }
}

const _game = new Game();
_game.loadSavedGameSafe();
_game.startup();