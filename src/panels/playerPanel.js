// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersPanel.js

import { CorePanel } from "./corePanel.js";
import { CombatAction } from "../dataObjects/combatAction.js";

export class PlayerPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "players-panel", 
            "players-panel-content"
        );

        this.setOnInit(() => {
            const result = [];
            this.instance.playerManager.getPlayers().forEach((player) => {
                const newPlayerDiv = document.createElement("div");
                newPlayerDiv.id = "player-" + player.id;
                newPlayerDiv.style.margin = "10px";
                newPlayerDiv.appendChild(this.createButton(
                    "remove-player-" + player.id, 
                    "Remove", 
                    () => {
                        this.instance.playerManager.removePlayer(player.id);
                    },
                    "red"
                ));
                newPlayerDiv.appendChild(this.createButton(
                    "start-combat-" + player.id, 
                    "Start Combat", 
                    () => {
                        player.setSelectedAction(new CombatAction(player));
                    },
                    "aqua"
                ));
                newPlayerDiv.appendChild(this.createButton(
                    "stop-combat-" + player.id, 
                    "Stop Combat", 
                    () => {
                        player.setSelectedAction(null);
                    },
                    "aqua"
                ));
                newPlayerDiv.appendChild(this.createLabelValue("id", "ID"));
                newPlayerDiv.appendChild(this.createLabelValue("name", "Name"));
                newPlayerDiv.appendChild(this.createLabelValue("hp", "HP"));
                newPlayerDiv.appendChild(this.createLabelValue("level", "Level"));
                newPlayerDiv.appendChild(this.createLabelValue("xp", "XP"));
                newPlayerDiv.appendChild(this.createLabelValue("gold", "Gold"));
                result.push(newPlayerDiv);
            })
            console.log("setOnInit:Players panel setup", result);
            return result;
        })

        this.setOnRefresh(() => {
            this.instance.playerManager.getPlayers().forEach((player) => {
                const panel = this.getPanel();
                if (panel) {
                    const playerElement = panel.querySelector(`#player-${player.id}`);
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
                    } else {
                        console.log("setOnRefresh:Player element not found");
                    }
                }
            });
        });
    }
}