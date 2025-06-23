// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { formatDate } from "../utils.js";
import { CorePanel } from "./corePanel.js";

export class PlayerCardPanel extends CorePanel {

    constructor(instance, player, parentId, contentId) {
        super(
            instance,
            parentId, 
            contentId,
            false
        );
        
        this.player = player;

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = "card-" + player.id;
            // newCardDiv.classList.add("generic-container-players");

            /** ID */
            newCardDiv.appendChild(this.createLabelValue("id", "ID"));

            /** NAME */
            newCardDiv.appendChild(this.createLabel("Name")); /* ONLY LABEL */
            newCardDiv.appendChild(this.createInput(
                "name", 
                null, /* NO LABEL */
                (value) => {
                    if (value != null && value.type == "change") {
                        const input = this.getContentPanel()?.querySelector("#name");
                        if (input) {
                            const oldName = String(player.name);
                            // @ts-ignore
                            player.setName(input.value);
                            // this.instance.dataManager.save();
                            console.log(`player:${player.id} name changed from '${oldName}' to '${player.name}'`);
                        }
                    }
                })
            );

            /** DATE CREATED */
            newCardDiv.appendChild(this.createLabelValue("dateCreated", "Date Created")); // , null, "fs-s"));

            /** HP */
            newCardDiv.appendChild(this.createLabelValue("hp", "HP"));

            /** GOLD */
            newCardDiv.appendChild(this.createLabelValue("gold", "Gold"));

            /** SKILL */
            newCardDiv.appendChild(this.createLabelValue("skill", "Skill"));

            /** SKILL LEVEL */
            newCardDiv.appendChild(this.createLabelValue("skillLevel", "Skill Level"));

            /** SKILL XP */
            newCardDiv.appendChild(this.createLabelValue("skillXp", "Skill XP"));

            /** SKILL INTERVAL */
            newCardDiv.appendChild(this.createLabelValue("skillInterval", "Skill Interval"));

            /** RECIPE */
            newCardDiv.appendChild(this.createLabelValue("recipe", "Recipe"));

            /** RECIPE LEVEL */
            newCardDiv.appendChild(this.createLabelValue("recipeLevel", "Recipe Level"));

            /** RECIPE XP */
            newCardDiv.appendChild(this.createLabelValue("recipeXp", "Recipe XP"));

            /** RECIPE PROGRESSION */
            newCardDiv.appendChild(this.createLabelValue("recipeProgression", "Recipe Progression"));

            /** Progression - Custom animation */
            const onChangeInterval = () => {
                const selectedAction = player.getSelectedAction();
                const currentSkill = selectedAction?.getSkill();
                const progress = selectedAction?.getProgression();
                if (currentSkill) {
                    return {
                        interval: currentSkill.baseInterval,
                        progression: progress
                    };
                }
                return {
                    interval: 0, 
                    progression: 0
                };
            }
            newCardDiv.appendChild(this.createProgress("recipeProgressionView"+player.id, null, onChangeInterval));
            result.push(newCardDiv);
            return result;
        });
    
        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const contentPanel = this.getContentPanel();
                if (contentPanel) {
                    const selectedAction = player.getSelectedAction();
                    const currentSkill = selectedAction?.getSkill();
                    const panel = this.getPanel();
    
                    if (panel && currentSkill) {
                        const cardElement = panel.querySelector(`#card-${player.id}`);
                        if (cardElement) {
    
                            const currAction = player.getSelectedAction();
                            const currSkill = currAction?.getSkill();
                            const currRecipe = currSkill?.getSelectedRecipe();
    
                            /* Player Data */
                            /* ID */
                            const idElement = cardElement.querySelector("#id");
                            if (idElement) idElement.textContent = String(player.id);
                            /* Name */
                            const nameElement = cardElement.querySelector(`#name`);
                            if (nameElement) 
                                // @ts-ignore
                                nameElement.value = String(player.name);
                            /* Date Created */
                            const dateCreatedElement = cardElement.querySelector("#dateCreated");
                            if (dateCreatedElement) dateCreatedElement.textContent = formatDate(new Date(player.dateCreated));
                            /* HP */
                            const hpElement = cardElement.querySelector("#hp");
                            if (hpElement) hpElement.textContent = String(player.hp);
                            /* Gold */
                            const goldElement = cardElement.querySelector("#gold");
                            if (goldElement) goldElement.textContent = String(player.gold);
    
                            /* Skill Data */
                            /* Skill */
                            const skillElement = cardElement.querySelector("#skill");
                            if (skillElement) skillElement.textContent = String(currSkill?.getIdentifier() ?? "N/A");
                            /* Skill Level */
                            const skillLevelElement = cardElement.querySelector("#skillLevel");
                            if (skillLevelElement) skillLevelElement.textContent = String(currentSkill?.level) + "/" + String(currentSkill?.maxLevel);
                            /* Skill XP */
                            const skillXpElement = cardElement.querySelector("#skillXp");
                            if (skillXpElement) skillXpElement.textContent = String(currentSkill?.xp) + "/" + String(currentSkill?.xpNext);
                            /* Skill XP */
                            const skillIntervalElement = cardElement.querySelector("#skillInterval");
                            if (skillIntervalElement) skillIntervalElement.textContent = String(currSkill.baseInterval);
    
                            /* Recipe Data */
                            /* Recipe */
                            const recipeElement = cardElement.querySelector("#recipe");
                            if (recipeElement) recipeElement.textContent = String(currRecipe?.getIdentifier() ?? "N/A");
                            /* Recipe Level */
                            const recipeLevelElement = cardElement.querySelector("#recipeLevel");
                            if (recipeLevelElement) recipeLevelElement.textContent = String(currentSkill?.getSelectedRecipe()?.level) + "/" + String(currentSkill?.getSelectedRecipe()?.maxLevel);  
                            /* Recipe XP */
                            const recipeXpElement = cardElement.querySelector("#recipeXp");
                            if (recipeXpElement) recipeXpElement.textContent = String(currentSkill?.getSelectedRecipe()?.xp) + "/" + String(currentSkill?.getSelectedRecipe()?.xpNext); 
                            /* Recipe Progression */
                            const recipeProgressionElement = cardElement.querySelector("#recipeProgression");
                            if (recipeProgressionElement) recipeProgressionElement.textContent = String(currAction?.getProgression() ?? "N/A") + " %";  
                            const recipeProgressionViewElement = cardElement.querySelector("#recipeProgressionView");
                            if (recipeProgressionViewElement) {
                                /** @ts-ignore */ 
                                recipeProgressionViewElement.value = currAction?.getProgression();
                            }
    
                        } else {
                            console.log("setOnRefresh:Player element not found");
                        }
                    }
                }
            }
        })
    }
}