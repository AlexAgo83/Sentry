// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playerManager.js

import { CoreManager } from "./coreManager.js";
import { PlayerEntity } from "../dataObjects/entities/playerEntity.js";

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

    /**
     * Loads a player from the given data.
     * @param {string} playerId - The ID of the player to create.
     * @param {object} savedData - The data to use to load the player.
     * @returns {PlayerEntity|null} - The created player.
     */
    loadPlayer = (playerId, savedData) => {
        if (playerId === null || savedData === null) {
            console.log("(important) loadPlayer can't load:" + playerId + ", saveData:", savedData);
            return null;
        }

        console.log("(important) loadPlayer ID:" + playerId + ", saveData:", savedData);
        const player = this.createPlayer(Number(playerId), false);
        player.load(savedData);

        this.instance.skillManager.loadSkills(savedData.skillsData, player);
        this.instance.actionManager.loadAction(savedData.selectedActionID, player);

        return player;
    }

    /**
     * Loads players from the given data.
     * @param {object} savedData - The data to use to load the players.
     */
    loadPlayers = (savedData) => {
        if (savedData.players) {
            const savedPlayers = savedData.players;
            Object.keys(savedPlayers).forEach((playerId) => {
                const savedPlayer = savedPlayers[playerId];
                this.loadPlayer(playerId, savedPlayer);
            });
        }
    }

    /**
     * Saves the current state of all players.
     * @param {object} savedPlayers - The object to store each player's data.
     * @param {object} savedData - The overall data object to store additional game data.
     */
    savePlayers = (savedPlayers, savedData) => {
        this.players.forEach((player) => {
            savedPlayers[player.getIdentifier()] = player.save();
        })
        savedData.players = savedPlayers;
    }

    /**
     * Creates a new player.
     * @param {number} id - The ID of the new player.
     * @param {boolean} withReset - If true, the game data will be reset.
     * @returns {PlayerEntity} - The created player.
     */
    createPlayer = (id, withReset=true) => {
        const newPlayer = new PlayerEntity(id);
        this.players.push(newPlayer);
        if (withReset) {
            this.instance.dataManager.save();
            this.instance.panelManager.remove();
            this.instance.initUI();
        }
        // console.log("createPlayer:" + id + " player created");
        return newPlayer;
    }

    removePlayer = (id) => {
        this.players = this.players.filter((player) => {
            return player.getIdentifier() !== id;
        });
        this.instance.dataManager.save();
        this.instance.panelManager.remove();
        this.instance.initUI();
    }
}