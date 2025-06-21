// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersPanel.js

import { CorePanel } from "./corePanel.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { HuntAction } from "../dataObjects/actions/huntAction.js";

export class PlayerPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "players-panel", 
            "players-panel-content"
        );

        this.setOnInit(() => {
            const result = [];
            const playersObject = this.instance.playerManager.getPlayers();

            playersObject.forEach((player) => {
                const newPlayerDiv = document.createElement("div");
                newPlayerDiv.id = "player-" + player.id;
                newPlayerDiv.style.marginRight = "10px";
                newPlayerDiv.style.display = "flex";
                newPlayerDiv.style.flexDirection = "column";

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
                    "Start Action : Combat", 
                    () => {
                        player.setSelectedAction(new CombatAction(player));
                    },
                    "lightblue"
                ));

                newPlayerDiv.appendChild(this.createButton(
                    "start-hunt-" + player.id, 
                    "Start Action : Hunt", 
                    () => {
                        player.setSelectedAction(new HuntAction(player));
                    },
                    "lightgreen"
                ));

                newPlayerDiv.appendChild(this.createButton(
                    "stop-combat-" + player.id, 
                    "Stop Action", 
                    () => {
                        player.setSelectedAction(null);
                    },
                    "lightgray"
                ));

                newPlayerDiv.appendChild(this.createLabelValue("id", "ID"));
                newPlayerDiv.appendChild(this.createLabelValue("name", "Name"));
                newPlayerDiv.appendChild(this.createLabelValue("skill", "Skill"));
                newPlayerDiv.appendChild(this.createLabelValue("hp", "HP"));
                newPlayerDiv.appendChild(this.createLabelValue("level", "Level"));
                newPlayerDiv.appendChild(this.createLabelValue("xp", "XP"));
                newPlayerDiv.appendChild(this.createLabelValue("gold", "Gold"));

                result.push(newPlayerDiv);
            })
            console.log("(important) setOnInit:Players panel setup", result);
            return result;
        })

        this.setOnRefresh(() => {
            this.instance.playerManager.getPlayers().forEach((player) => {
                const selectedAction = player.getSelectedAction();
                const currentSkill = selectedAction?.getSkill();
                const panel = this.getPanel();
                if (panel && currentSkill) {
                    const playerElement = panel.querySelector(`#player-${player.id}`);
                    if (playerElement) {
                        const currAction = player.getSelectedAction();
                        const currSkill = currAction?.getSkill();

                        /* ID */
                        const idElement = playerElement.querySelector("#id");
                        if (idElement) idElement.textContent = String(player.id);
                        /* Name */
                        const nameElement = playerElement.querySelector("#name");
                        if (nameElement) nameElement.textContent = player.name;
                        /* Skill */
                        const skillElement = playerElement.querySelector("#skill");
                        if (skillElement) skillElement.textContent = String(currSkill?.getIdentifier() ?? "N/A");
                        /* HP */
                        const hpElement = playerElement.querySelector("#hp");
                        if (hpElement) hpElement.textContent = String(player.hp);
                        /* LEVEL */
                        const levelElement = playerElement.querySelector("#level");
                        if (levelElement) levelElement.textContent = String(currentSkill.level);
                        /* XP */
                        const xpElement = playerElement.querySelector("#xp");
                        if (xpElement) xpElement.textContent = String(currentSkill.xp);
                        /* GOLD */
                        const goldElement = playerElement.querySelector("#gold");
                        if (goldElement) goldElement.textContent = String(player.gold);
                    } else {
                        console.log("setOnRefresh:Player element not found");
                    }
                } else {
                    console.log("setOnRefresh:Player panel or skills not setup", currentSkill);
                }
            });
        });
    }
}