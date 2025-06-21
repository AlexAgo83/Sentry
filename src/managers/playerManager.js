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

    loadPlayer = (playerId, savedData) => {
        if (playerId === null || savedData === null) {
            console.log("(important) loadPlayer can't load:" + playerId + ", saveData:", savedData);
            return;
        }

        console.log("(important) loadPlayer ID:" + playerId + ", saveData:", savedData);
        const player = this.createPlayer(Number(playerId), false);
        player.load(savedData);

        this.instance.skillManager.loadSkills(savedData.skillsData, player);
        this.instance.actionManager.loadAction(savedData.selectedActionID, player);
    }

    loadPlayers = (savedData) => {
        if (savedData.players) {
            const savedPlayers = savedData.players;
            Object.keys(savedPlayers).forEach((playerId) => {
                const savedPlayer = savedPlayers[playerId];
                this.loadPlayer(playerId, savedPlayer);
            });
        }
    }

    savePlayers = (savedPlayers, savedData) => {
        this.players.forEach((player) => {
            savedPlayers[player.getIdentifier()] = player.save();
        })
        savedData.players = savedPlayers;
    }

    createPlayer = (id, withReset=true) => {
        const newPlayer = new PlayerEntity(id);
        this.players.push(newPlayer);
        if (withReset) {
            this.instance.dataManager.save();
            this.instance.panelManager.remove();
            this.instance.initUI();
        }
        console.log("createPlayer:" + id + " player created");
        return newPlayer;
    }

    removePlayer = (id) => {
        this.players = this.players.filter((player) => {
            return player.id !== id;
        });
        this.instance.dataManager.save();
        this.instance.panelManager.remove();
        this.instance.initUI();
    }
}