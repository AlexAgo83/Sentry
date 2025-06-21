// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playerManager.js

import { CoreManager } from "./coreManager.js";
import { Player } from "../dataObjects/player.js";

export class PlayerManager extends CoreManager {
    constructor(instance) {
        super(instance);
        this.players = [];
    }

    reset = () =>{
        this.players = [];
    }

    getPlayers = () => {
        return this.players;
    }

    loadPlayer = (playerId, savedData) => {
        const player = new Player(Number(playerId));
        player.load(savedData.players[playerId]);
        if (player.selectedActionID && !player.selectedAction) {
            this.instance.actionManager.loadAction(player.selectedActionID, player);
        }
        this.players.push(player);
    }

    loadPlayers = (savedData) => {
        if (savedData.players) {
            Object.keys(savedData.players).forEach((playerId) => {
                this.loadPlayer(playerId, savedData);
            });
        }
    }

    savePlayers = (savedPlayers, savedData) => {
        this.players.forEach((player) => {
            savedPlayers[player.getIdentifier()] = player.save();
        })
        savedData.players = savedPlayers;
    }

    createPlayer = (id) => {
        const newPlayer = new Player(id);
        this.players.push(newPlayer);
        this.instance.dataManager.saveGame();
        this.instance.panelManager.remove();
        this.instance.initUI();
        return newPlayer;
    }

    removePlayer = (id) => {
        this.players = this.players.filter((player) => {
            return player.id !== id;
        });
        this.instance.dataManager.saveGame();
        this.instance.panelManager.remove();
        this.instance.initUI();
    }
}