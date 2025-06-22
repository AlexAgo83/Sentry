// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersPanel.js

import { CorePanel } from "./corePanel.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { HuntingAction } from "../dataObjects/actions/huntingAction.js";
import { CookingAction } from "../dataObjects/actions/cookingAction.js";

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
                        const combatAction = new CombatAction(player);
                        
                        /** Select monster001 */
                        const monster001 = combatAction.getSkill().recipes.get("monster001");
                        combatAction.getSkill().setSelectedRecipe(monster001);

                        player.setSelectedAction(combatAction);
                    },
                    "lightblue"
                ));

                newPlayerDiv.appendChild(this.createButton(
                    "start-hunting-" + player.id, 
                    "Start Action : Hunting", 
                    () => {
                        const huntingAction = new HuntingAction(player);
                        
                        /** Select hunt001 */
                        const hunt001 = huntingAction.getSkill().recipes.get("hunt001");
                        huntingAction.getSkill().setSelectedRecipe(hunt001);

                        player.setSelectedAction(huntingAction);
                    },
                    "lightgreen"
                ));

                newPlayerDiv.appendChild(this.createButton(
                    "start-cooking-" + player.id, 
                    "Start Action : Cooking", 
                    () => {
                        const cookingAction = new CookingAction(player);
                        
                        /** Select meal001 */
                        const meal001 = cookingAction.getSkill().recipes.get("meal001");
                        cookingAction.getSkill().setSelectedRecipe(meal001);

                        player.setSelectedAction(cookingAction);
                    },
                    "lightpink"
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
                newPlayerDiv.appendChild(this.createLabelValue("hp", "HP"));
                newPlayerDiv.appendChild(this.createLabelValue("gold", "Gold"));
                newPlayerDiv.appendChild(this.createLabelValue("skill", "Skill"));
                newPlayerDiv.appendChild(this.createLabelValue("skillLevel", "Skill Level"));
                newPlayerDiv.appendChild(this.createLabelValue("skillXp", "Skill XP"));
                newPlayerDiv.appendChild(this.createLabelValue("recipe", "Recipe"));
                newPlayerDiv.appendChild(this.createLabelValue("recipeXp", "Recipe XP"));
                newPlayerDiv.appendChild(this.createLabelValue("recipeLevel", "Recipe Level"));

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
                        const currRecipe = currSkill?.getSelectedRecipe();

                        /* Player Data */
                        /* ID */
                        const idElement = playerElement.querySelector("#id");
                        if (idElement) idElement.textContent = String(player.id);
                        /* Name */
                        const nameElement = playerElement.querySelector("#name");
                        if (nameElement) nameElement.textContent = player.name;
                        /* HP */
                        const hpElement = playerElement.querySelector("#hp");
                        if (hpElement) hpElement.textContent = String(player.hp);
                        /* Gold */
                        const goldElement = playerElement.querySelector("#gold");
                        if (goldElement) goldElement.textContent = String(player.gold);

                        /* Skill Data */
                        /* Skill */
                        const skillElement = playerElement.querySelector("#skill");
                        if (skillElement) skillElement.textContent = String(currSkill?.getIdentifier() ?? "N/A");
                        /* Skill Level */
                        const skillLevelElement = playerElement.querySelector("#skillLevel");
                        if (skillLevelElement) skillLevelElement.textContent = String(currentSkill?.level);
                        /* Skill XP */
                        const skillXpElement = playerElement.querySelector("#skillXp");
                        if (skillXpElement) skillXpElement.textContent = String(currentSkill?.xp);

                        /* Recipe Data */
                        /* Recipe */
                        const recipeElement = playerElement.querySelector("#recipe");
                        if (recipeElement) recipeElement.textContent = String(currRecipe?.getIdentifier() ?? "N/A");
                        /* Recipe Level */
                        const recipeLevelElement = playerElement.querySelector("#recipeLevel");
                        if (recipeLevelElement) recipeLevelElement.textContent = String(currentSkill?.getSelectedRecipe()?.level);
                        /* Recipe XP */
                        const recipeXpElement = playerElement.querySelector("#recipeXp");
                        if (recipeXpElement) recipeXpElement.textContent = String(currentSkill?.getSelectedRecipe()?.xp);
                    } else {
                        console.log("setOnRefresh:Player element not found");
                    }
                // } else {
                //     console.log("setOnRefresh:Player panel or skills not setup", currentSkill);
                }
            });
        });
    }
}