// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { formatDate } from "../utils.js";
import { CorePanel } from "./corePanel.js";
import { PlayerControlsPanel } from "./playerControlsPanel.js";

const REF_PLAYER_CARD = "card";
const REF_PLAYER_ID = "identifier";
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
const REF_PLAYER_STAMINA = "stamina";
const REF_PLAYER_STAMINA_VIEW = "staminaView";

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
                        this.genId(REF_PLAYER_CARD), // Attach to the current "card"
                        this.genId("player-controls"), 
                        player));
            }
        });

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = this.genId(REF_PLAYER_CARD);
            newCardDiv.classList.add("player-card-content");

            // /** ID */
            // this.registerComponent(
            //     newCardDiv,
            //     this.createLabelValue(
            //         REF_PLAYER_ID, 
            //         "ID")
            // );

            /** NAME INPUT */
            this.registerComponent(
                newCardDiv,
                this.createInput(
                    REF_PLAYER_NAME_INPUT, 
                    "Name",
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

            // /** DATE CREATED */
            // this.registerComponent(
            //     newCardDiv,
            //     this.createLabelValue(REF_PLAYER_DATE_CREATED, "Date Created")); // , null, "fs-s"));

            // /** HP */
            // this.registerComponent(
            //     newCardDiv,
            //     this.createLabelValue(REF_PLAYER_HP, "HP"));

            /** GOLD */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_GOLD, "Gold"));

            /** SKILL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL, "Skill"));
                
            /** SKILL XP */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL_XP, "Skill XP"));

            /** SKILL LEVEL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL_LEVEL, "Skill Level"));

            /** SKILL INTERVAL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_SKILL_INTERVAL, "Skill Interval"));

            /** RECIPE */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE, "Recipe"));
                
            /** RECIPE XP */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE_XP, "Recipe XP"));

            /** RECIPE LEVEL */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE_LEVEL, "Recipe Level"));

            /** RECIPE PROGRESSION */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_RECIPE_PROGRESS, "Action"));

            /** Action progression */
            this.registerComponent(
                newCardDiv,
                this.createProgress(REF_PLAYER_RECIPE_PROGRESS_VIEW, null, null));

            /** RECIPE PROGRESSION */
            this.registerComponent(
                newCardDiv,
                this.createLabelValue(REF_PLAYER_STAMINA, "Stamina"));

            this.registerComponent(
                newCardDiv,
                this.createProgress(REF_PLAYER_STAMINA_VIEW, null, null));

            // End of init
            result.push(newCardDiv);
            return result;
        });
    
        this.setOnRefresh(() => {
            const panel = this.getPanel();
            const contentPanel = this.getContentPanel();
            if (!panel || !contentPanel) return;

            const cardElement = panel.querySelector(`#${this.genId("card")}`);
            if (!cardElement) return;

            const currAction = player.getSelectedAction();
            const currSkill = player.getSelectedSkill();
            const currRecipe = player.getSelectedRecipe();

            // /* ID */
            // const idElement = this.getComponentContent(REF_PLAYER_ID);
            // if (idElement) idElement.textContent = String(player.getIdentifier());

            // /* Date Created */
            // const dateCreatedElement = this.getComponentContent(REF_PLAYER_DATE_CREATED);
            // if (dateCreatedElement) dateCreatedElement.textContent = formatDate(new Date(player.dateCreated));

            // /* HP */
            // const hpElement = this.getComponentContent(REF_PLAYER_HP);
            // if (hpElement) hpElement.textContent = String(player.hp);

            /* Gold */
            const goldElement = this.getComponentContent(REF_PLAYER_GOLD);
            if (goldElement) goldElement.textContent = String(player.storage.gold)+"o";

            const nameElement = this.getComponentContent(REF_PLAYER_NAME_INPUT);
            /* Stamina */
            const staminaElement = this.getComponentContent(REF_PLAYER_STAMINA);
            const staminaPercent = player.staminaMax > 0 ? (player.stamina / player.staminaMax) * 100 : 0;
            const staminaProgress = Math.max(0, Math.min(100, Math.floor(staminaPercent)));
            const staminaStr = staminaProgress > 0 ? String(staminaProgress) + " %" : "Stunned!";
            if (staminaElement) staminaElement.textContent = staminaStr;  
            const staminaViewElement = this.getComponentContent(REF_PLAYER_STAMINA_VIEW);
            if (staminaViewElement) {
                /** @ts-ignore */ 
                staminaViewElement.value = staminaProgress;
                staminaViewElement.parentElement?.style.setProperty("--progress", `${staminaProgress}%`);
            }

            /** SPECIFIC IDLING */
            if (!currAction) {
                /* Name */
                // @ts-ignore
                // Allow to edit the name 
                if (nameElement) nameElement.disabled = false;
            /** SPECIFIC DOING ACTION */
            } else {
                /* Name */
                if (nameElement) {
                    // @ts-ignore
                    nameElement.value = String(player.name);
                    // @ts-ignore
                    // Prevent to edit the name
                    nameElement.disabled = true;
                }

                /* Skill */
                const skillElement = this.getComponentContent(REF_PLAYER_SKILL);
                if (skillElement) skillElement.textContent = String(currSkill?.getIdentifier() ?? "N/A");

                /* Skill Level */
                const skillLevelElement = this.getComponentContent(REF_PLAYER_SKILL_LEVEL);
                if (skillLevelElement) skillLevelElement.textContent = String(currSkill?.level) + "/" + String(currSkill?.maxLevel);

                /* Skill XP */
                const skillXpElement = this.getComponentContent(REF_PLAYER_SKILL_XP);
                if (skillXpElement) skillXpElement.textContent = String(currSkill?.xp) + "/" + String(currSkill?.xpNext);

                /* Skill XP */
                const skillIntervalElement = this.getComponentContent(REF_PLAYER_SKILL_INTERVAL);
                if (skillIntervalElement) skillIntervalElement.textContent = String(currSkill.baseInterval / 1000)+"s";

                /* Recipe */
                const recipeElement = this.getComponentContent(REF_PLAYER_RECIPE);
                if (recipeElement) recipeElement.textContent = String(currRecipe?.getIdentifier() ?? "N/A");

                /* Recipe Level */
                const recipeLevelElement = this.getComponentContent(REF_PLAYER_RECIPE_LEVEL);
                if (recipeLevelElement) recipeLevelElement.textContent = String(currSkill?.getSelectedRecipe()?.level) + "/" + String(currSkill?.getSelectedRecipe()?.maxLevel);  

                /* Recipe XP */
                const recipeXpElement = this.getComponentContent(REF_PLAYER_RECIPE_XP);
                if (recipeXpElement) recipeXpElement.textContent = String(currSkill?.getSelectedRecipe()?.xp) + "/" + String(currSkill?.getSelectedRecipe()?.xpNext); 

                /* Recipe Progression */
                const recipeProgressionElement = this.getComponentContent(REF_PLAYER_RECIPE_PROGRESS);
                const progressValue = currAction ? currAction.getProgressPercent() : 0;
                const progressStr = currAction ? String(Math.floor(progressValue)) + " %" : "N/A";
                if (recipeProgressionElement) recipeProgressionElement.textContent = progressStr;  
                const recipeProgressionViewElement = this.getComponentContent(REF_PLAYER_RECIPE_PROGRESS_VIEW)
                    ?? cardElement.querySelector(`#${this.genId(REF_PLAYER_RECIPE_PROGRESS_VIEW)}`)
                    ?? contentPanel.querySelector(`#${this.genId(REF_PLAYER_RECIPE_PROGRESS_VIEW)}`);
                if (recipeProgressionViewElement) {
                    /** @ts-ignore */ 
                    recipeProgressionViewElement.value = currAction ? progressValue : 0;
                    recipeProgressionViewElement.parentElement?.style.setProperty("--progress", `${progressValue}%`);
                }
            }
        })

        this.setOnPostInit(() => {
            this.getContentPanel()?.classList.add("player-card-panel");
        });
    }

    genId = (newId) => {
        return newId + "-" + this.player.getIdentifier();
    }
}
