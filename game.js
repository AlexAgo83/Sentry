// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// game.js

import { Player } from "./player.js";

export class Game {

    constructor() {
        this.players = [];
        this.attackBtn = document.getElementById("attack-btn");
        this.saveBtn = document.getElementById("save-btn");
        this.loadBtn = document.getElementById("load-btn");
        this.resetBtn = document.getElementById("reset-btn");
    }

    /* Game Data */
    saveGame = () => {
        console.log("Game data to save", this.players);

        const savedData = {};
        const savedPlayers = {};

        if (this.players && this.players.length > 0) {   
            this.players.forEach((player) => {
                savedPlayers[player.getIdentifier()] = player.save();
            })
            savedData.players = savedPlayers;
            console.log("Players saved", savedPlayers);
        }

        localStorage.setItem('saveGame-v0', JSON.stringify(savedData));
        console.log("Game saved", savedData);
    }

    loadSavedGame = () => {
        const savedDataString = localStorage.getItem('saveGame-v0');
        const savedData = savedDataString ? JSON.parse(savedDataString) : {};
        console.log("saveGame to load", savedData);

        if (savedData.players) {
            Object.keys(savedData.players).forEach((playerId) => {
                const player = new Player(Number(playerId));
                player.load(savedData.players[playerId]);
                this.players.push(player);
            });
        }

        console.log("Game loaded", savedData);
    }

    resetData = () => {
        clearInterval(this.interval);
        this.players = [];
        this.saveGame();
        this.removePlayerUI();
        this.startup();
    }

    /** UI Setup */
    initUI = () => {
        /** PLAYER UI */
        const playerPanel = document.body.querySelector("#player-panel");
        const contentPanel = playerPanel?.querySelector("#player-panel-content");
        if (contentPanel) return;
        else {
            const newContent = this.initPlayerUI();
            newContent.id = "player-panel-content";
            playerPanel?.appendChild(newContent);
            this.setupListener();
        }
    }

    initPlayerUI = () => {
        const newPlayersDiv = document.createElement("div");
        newPlayersDiv.style.display = "flex";
        newPlayersDiv.style.flexDirection = "row";

        this.players.forEach((player) => {
            const newPlayerDiv = document.createElement("div");
            newPlayerDiv.id = "player-" + player.id;
            newPlayerDiv.style.margin = "10px";
            newPlayerDiv.appendChild(this.createLabelValue("id", "ID"));
            newPlayerDiv.appendChild(this.createLabelValue("name", "Name"));
            newPlayerDiv.appendChild(this.createLabelValue("hp", "HP"));
            newPlayerDiv.appendChild(this.createLabelValue("level", "Level"));
            newPlayerDiv.appendChild(this.createLabelValue("xp", "XP"));
            newPlayerDiv.appendChild(this.createLabelValue("gold", "Gold"));
            newPlayersDiv.appendChild(newPlayerDiv);
        })
        return newPlayersDiv;
    }

    removePlayerUI = () => {
        const playerPanel = document.body.querySelector("#player-panel");
        const contentPanel = playerPanel?.querySelector("#player-panel-content");
        if (contentPanel) contentPanel.remove();
    }

    createLabelValue = (id, label, defaultValue=null) => {
        const newPanel = document.createElement("p");
        const newSpanLabel = document.createElement("span");
        newSpanLabel.textContent = label + " : ";
        newPanel.appendChild(newSpanLabel);
        const newSpanValue = document.createElement("span");
        newSpanValue.id = id;
        newSpanValue.textContent = defaultValue ? defaultValue : "N/A";
        newPanel.appendChild(newSpanValue);
        return newPanel;
    }

    /** Update the game UI */
    updateUI = () => {
        this.players.forEach((player) => {
            const playerElement = document.getElementById(`player-${player.id}`);
            if (playerElement) {
                /* ID */
                const idElement = playerElement.querySelector("#id");
                if (idElement) idElement.textContent = String(player.id);
                /* Name */
                const nameElement = playerElement.querySelector("#name");
                if (nameElement) nameElement.textContent = player.name;
                /* HP */
                const hpElement = playerElement.querySelector("#hp");
                if (hpElement) hpElement.textContent = String(player.hp);
                /* LEVEL */
                const levelElement = playerElement.querySelector("#level");
                if (levelElement) levelElement.textContent = String(player.level);
                /* XP */
                const xpElement = playerElement.querySelector("#xp");
                if (xpElement) xpElement.textContent = String(player.xp);
                /* GOLD */
                const goldElement = playerElement.querySelector("#gold");
                if (goldElement) goldElement.textContent = String(player.gold);
            }
        });
    }

    setupListener = () => {
        this.attackBtn?.addEventListener("click", () => {
            this.players.forEach((player) => player.attack());
            this.updateUI();
        });
        this.saveBtn?.addEventListener('click', this.saveGame);
        this.loadBtn?.addEventListener('click', this.loadSavedGame);
        this.resetBtn?.addEventListener('click', this.resetData);
    }

    startup = () => {
        console.log("Startup::Begin");

        /* Trying to load last saved game */
        this.loadSavedGame();

        /* First init ?! */
        if (this.players.length === 0) {

            const char1 = new Player(1);
            this.players.push(char1);

            const char2 = new Player(2);
            this.players.push(char2);

            const char3 = new Player(3);
            this.players.push(char3);

            this.saveGame()
        }

        /* Init UI */
        this.initUI();
        this.updateUI();

        /** GAME LOOP */
        this.interval = setInterval(() => {
            this.players.forEach((player) => player.attack());
            // console.log("Startup::Interval");
            this.updateUI();
        }, 250);

        console.log("Startup::End");
    }
}

const _game = new Game();
_game.startup();