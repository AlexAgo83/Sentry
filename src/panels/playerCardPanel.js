// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { formatDate } from "../utils.js";
import { CorePanel } from "./corePanel.js";
import { PlayerControlsPanel } from "./playerControlsPanel.js";

const REF_PLAYER_ID = "id";
const REF_PLAYER_NAME_LABEL = "nameLabel";
const REF_PLAYER_NAME_INPUT = "nameInput";
const REF_PLAYER_DATE_CREATED = "dateCreated";
const REF_PLAYER_HP = "hp";
const REF_PLAYER_GOLD = "gold";
const REF_PLAYER_SKILL = "shill";
const REF_PLAYER_SKILL_LEVEL = "shillLevel";
const REF_PLAYER_SKILL_XP = "shillXp";
const REF_PLAYER_SKILL_INTERVAL = "shillInterval";
const REF_PLAYER_RECIPE = "recipe";
const REF_PLAYER_RECIPE_LEVEL = "recipeLevel";
const REF_PLAYER_RECIPE_XP = "recipeXp";
const REF_PLAYER_RECIPE_PROGRESS = "recipeProgress";
const REF_PLAYER_RECIPE_PROGRESS_VIEW = "recipeProgressView";

export class PlayerCardPanel extends CorePanel {

    constructor(instance, parentId, contentId, player) {
        super(
            instance,
            parentId, 
            contentId,
            false
        );

        this.player = player;

        this.setOnGenId(() => {
            return player.getIdentifier();
        })

        this.setOnPrepare(() => {
            let isAlreadyAdded = false;
            this.subPanels.forEach((subPanel) => {
                if (subPanel instanceof PlayerControlsPanel
                    && subPanel.player.getIdentifier() == player.getIdentifier()) {
                    isAlreadyAdded = true;
                }
            });
            /** If not already added */
            if (!isAlreadyAdded) {
                this.registerSubPanel(
                    new PlayerControlsPanel(
                        this.instance, 
                        this.genId("card"), // Attach to the current "card"
                        this.genId("player-controls"), 
                        player));
            }
        });

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = this.genId("card");

            /** ID */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_ID, "ID"));

            /** NAME LABEL */
            this.registerComponent(
                newCardDiv, 
                this.createLabel(REF_PLAYER_NAME_LABEL, "Name")); /* ONLY LABEL */
            
            /** NAME INPUT */
            this.registerComponent(
                newCardDiv,
                this.createInput(
                    REF_PLAYER_NAME_INPUT, 
                    null, /* NO LABEL */
                    (value) => {
                        if (value != null && value.type == "change") {
                            const input = this.getContentPanel()?.querySelector("#" + this.genId(REF_PLAYER_NAME_INPUT));
                            if (input) {
                                const oldName = String(player.name);
                                // @ts-ignore
                                player.setName(input.value);
                                // this.instance.dataManager.save();
                                console.log(`player:${player.getIdentifier()} name changed from '${oldName}' to '${player.name}'`);
                            }
                        }
                    }
                )
            );

            /** DATE CREATED */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_DATE_CREATED, "Date Created")); // , null, "fs-s"));

            /** HP */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_HP, "HP"));

            /** GOLD */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_GOLD, "Gold"));

            /** SKILL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL, "Skill"));

            /** SKILL LEVEL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL_LEVEL, "Skill Level"));

            /** SKILL XP */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL_XP, "Skill XP"));

            /** SKILL INTERVAL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL_INTERVAL, "Skill Interval"));

            /** RECIPE */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE, "Recipe"));

            /** RECIPE LEVEL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE_LEVEL, "Recipe Level"));

            /** RECIPE XP */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE_XP, "Recipe XP"));

            /** RECIPE PROGRESSION */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE_PROGRESS, "Recipe Progression"));

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
            this.registerComponent(
                newCardDiv,
                this.createProgress(REF_PLAYER_RECIPE_PROGRESS_VIEW, null, onChangeInterval));

            // End of init
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
    
                    if (panel && !selectedAction) {
                        /** No active Action */

                        /* Name */
                        const nameElement = this.getComponentContent(REF_PLAYER_NAME_INPUT);
                        if (nameElement) {
                            // @ts-ignore
                            nameElement.disabled = false;
                        }
                    } else if (panel && !currentSkill) {
                        /** No active Skill */
                    } else if (panel && currentSkill) {
                        /** Active Skill */
                        const cardElement = panel.querySelector(`#card-${player.getIdentifier()}`);
                        if (cardElement) {
    
                            const currAction = player.getSelectedAction();
                            const currSkill = currAction?.getSkill();
                            const currRecipe = currSkill?.getSelectedRecipe();
    
                            /* Player Data */
                            /* ID */
                            const idElement = this.getComponentContent(REF_PLAYER_ID);
                            if (idElement) idElement.textContent = String();

                            /* Name */
                            const nameElement = this.getComponentContent(REF_PLAYER_NAME_INPUT);
                            if (nameElement) {
                                // @ts-ignore
                                nameElement.value = String(player.name);
                                // @ts-ignore
                                nameElement.disabled = true;
                            }

                            /* Date Created */
                            const dateCreatedElement = this.getComponentContent(REF_PLAYER_DATE_CREATED);
                            if (dateCreatedElement) dateCreatedElement.textContent = formatDate(new Date(player.dateCreated));

                            /* HP */
                            const hpElement = this.getComponentContent(REF_PLAYER_HP);
                            if (hpElement) hpElement.textContent = String(player.hp);

                            /* Gold */
                            const goldElement = this.getComponentContent(REF_PLAYER_GOLD);
                            if (goldElement) goldElement.textContent = String(player.gold);
    
                            /* Skill */
                            const skillElement = this.getComponentContent(REF_PLAYER_SKILL);
                            if (skillElement) skillElement.textContent = String(currSkill?.getIdentifier() ?? "N/A");

                            /* Skill Level */
                            const skillLevelElement = this.getComponentContent(REF_PLAYER_SKILL_LEVEL);
                            if (skillLevelElement) skillLevelElement.textContent = String(currentSkill?.level) + "/" + String(currentSkill?.maxLevel);

                            /* Skill XP */
                            const skillXpElement = this.getComponentContent(REF_PLAYER_SKILL_XP);
                            if (skillXpElement) skillXpElement.textContent = String(currentSkill?.xp) + "/" + String(currentSkill?.xpNext);

                            /* Skill XP */
                            const skillIntervalElement = this.getComponentContent(REF_PLAYER_SKILL_INTERVAL);
                            if (skillIntervalElement) skillIntervalElement.textContent = String(currSkill.baseInterval);
    
                            /* Recipe */
                            const recipeElement = this.getComponentContent(REF_PLAYER_RECIPE);
                            if (recipeElement) recipeElement.textContent = String(currRecipe?.getIdentifier() ?? "N/A");

                            /* Recipe Level */
                            const recipeLevelElement = this.getComponentContent(REF_PLAYER_RECIPE_LEVEL);
                            if (recipeLevelElement) recipeLevelElement.textContent = String(currentSkill?.getSelectedRecipe()?.level) + "/" + String(currentSkill?.getSelectedRecipe()?.maxLevel);  

                            /* Recipe XP */
                            const recipeXpElement = this.getComponentContent(REF_PLAYER_RECIPE_XP);
                            if (recipeXpElement) recipeXpElement.textContent = String(currentSkill?.getSelectedRecipe()?.xp) + "/" + String(currentSkill?.getSelectedRecipe()?.xpNext); 

                            /* Recipe Progression */
                            const recipeProgressionElement = this.getComponentContent(REF_PLAYER_RECIPE_PROGRESS);
                            const progress = currAction?.getProgression();
                            const progressStr = progress ? String(Math.floor(progress)) + " %" : "N/A";
                            if (recipeProgressionElement) recipeProgressionElement.textContent = progressStr;  
                            const recipeProgressionViewElement = this.getComponentContent(REF_PLAYER_RECIPE_PROGRESS_VIEW);
                            if (recipeProgressionViewElement) {
                                /** @ts-ignore */ 
                                recipeProgressionViewElement.value = progress;
                            }
    
                        } else {
                            console.log("setOnRefresh:Player element not found");
                        }
                    }
                }
            }
        })
    }

    genId = (newId) => {
        return newId + "-" + this.player.getIdentifier();
    }
}