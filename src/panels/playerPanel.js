// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersPanel.js

import { CorePanel } from "./corePanel.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { HuntingAction } from "../dataObjects/actions/huntingAction.js";
import { CookingAction } from "../dataObjects/actions/cookingAction.js";
import { ExcavationAction } from "../dataObjects/actions/excavationAction.js";
import { MetalWorkAction } from "../dataObjects/actions/metalWorkAction.js";

export class PlayerPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "players-panel", 
            "players-panel-content"
        );
        this.maxRecipe = 10;

        /** ON INIT */
        this.setOnInit(() => {
            const result = [];
            const playersObject = this.instance.playerManager.getPlayers();

            playersObject.forEach((player) => {
                const newPlayerDiv = document.createElement("div");
                newPlayerDiv.id = "player-" + player.id;
                newPlayerDiv.style.marginRight = "10px";
                newPlayerDiv.style.display = "flex";
                newPlayerDiv.style.flexDirection = "column";


                newPlayerDiv.appendChild(this.createLabelValue("id", "ID"));
                newPlayerDiv.appendChild(this.createInput(
                    "name", 
                    "Name", 
                    (value, ...args) => {
                        if (value != null && value.type == "change") {
                            const input = newPlayerDiv.querySelector("#name");
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

                newPlayerDiv.appendChild(this.createLabelValue("dateCreated", "Date Created")); // , null, "fs-s"));
                newPlayerDiv.appendChild(this.createLabelValue("hp", "HP"));
                newPlayerDiv.appendChild(this.createLabelValue("gold", "Gold"));
                newPlayerDiv.appendChild(this.createLabelValue("skill", "Skill"));
                newPlayerDiv.appendChild(this.createLabelValue("skillLevel", "Skill Level"));
                newPlayerDiv.appendChild(this.createLabelValue("skillXp", "Skill XP"));
                newPlayerDiv.appendChild(this.createLabelValue("skillInterval", "Skill Interval"));
                newPlayerDiv.appendChild(this.createLabelValue("recipe", "Recipe"));
                newPlayerDiv.appendChild(this.createLabelValue("recipeLevel", "Recipe Level"));
                newPlayerDiv.appendChild(this.createLabelValue("recipeXp", "Recipe XP"));
                newPlayerDiv.appendChild(this.createLabelValue("recipeProgression", "Recipe Progression"));
                newPlayerDiv.appendChild(this.createProgress("recipeProgressionView", "Action"));


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
                    "lightpink"
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
                    "start-excavation-" + player.id, 
                    "Start Action : Excavation", 
                    () => {
                        const excavationAction = new ExcavationAction(player);
                        
                        /** Select exca001 */
                        const exca001 = excavationAction.getSkill().recipes.get("exca001");
                        excavationAction.getSkill().setSelectedRecipe(exca001);

                        player.setSelectedAction(excavationAction);
                    },
                    "lightgreen"
                ));

                newPlayerDiv.appendChild(this.createButton(
                    "start-metalwork-" + player.id, 
                    "Start Action : MetalWork", 
                    () => {
                        const metalWorkAction = new MetalWorkAction(player);
                        
                        /** Select mw001 */
                        const mw001 = metalWorkAction.getSkill().recipes.get("mw001");
                        metalWorkAction.getSkill().setSelectedRecipe(mw001);

                        player.setSelectedAction(metalWorkAction);
                    },
                    "lightgreen"
                ));

                for (let i = 0; i < this.maxRecipe; i++) {
                    const button = this.createButton(
                        "recipe-selector-" + i + "-" + player.id, 
                        "Select Recipe", 
                        () => {
                            player.setSelectedAction(null);
                        },
                        "lightpurple"
                    );
                    button.style.display = "none";
                    newPlayerDiv.appendChild(button);
                }

                newPlayerDiv.appendChild(this.createButton(
                    "stop-action-" + player.id, 
                    "Stop Action", 
                    () => {
                        player.setSelectedAction(null);
                    },
                    "lightgray"
                ));

                result.push(newPlayerDiv);
            })
            console.log("(important) setOnInit:Players panel setup", result);
            return result;
        })

        /** ON REFRESH */
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

                        /** Recipe Selector */
                        if (currSkill) {
                            let i = 0;
                            for (const key of currSkill.recipes.keys()) {
                                const lRecipe = currSkill.recipes.get(key);
                                if (i < this.maxRecipe) {
                                    const recipeSelector = playerElement.querySelector(`#recipe-selector-${i}-${player.id}`);
                                    if (recipeSelector) {
                                        // @ts-ignore
                                        recipeSelector.style.display = "inline-block";
                                        recipeSelector.textContent = "Select Recipe : " + key;
                                        recipeSelector.addEventListener("click", () => {
                                            currSkill.setSelectedRecipe(currSkill.getRecipeByID(key));
                                            console.log("(important) setSelectedRecipe:" + key);

                                            const recipe = currAction.getSkill().recipes.get(key);
                                            currAction.getSkill().setSelectedRecipe(recipe);
                                            player.setSelectedAction(currAction);
                                        });
                                    } 
                                    i+=1;
                                }
                            }
                            if (i<this.maxRecipe) {
                                for (i = i; i<this.maxRecipe; i++) {
                                    const recipeSelector = panel.querySelector(`#recipe-selector-${i}-${player.id}`);
                                    if (recipeSelector) {
                                        // @ts-ignore
                                        recipeSelector.style.display = "none";
                                        recipeSelector.textContent = "Select Recipe : N/A";
                                    }     
                                }
                            }
                        }

                        /* Player Data */
                        /* ID */
                        const idElement = playerElement.querySelector("#id");
                        if (idElement) idElement.textContent = String(player.id);
                        /* Name */
                        const nameElement = playerElement.querySelector(`#name`);
                        if (nameElement) 
                            // @ts-ignore
                            nameElement.value = String(player.name);
                        /* Date Created */
                        const dateCreatedElement = playerElement.querySelector("#dateCreated");
                        if (dateCreatedElement) dateCreatedElement.textContent = new Date(player.dateCreated)?.toLocaleDateString();
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
                        if (skillLevelElement) skillLevelElement.textContent = String(currentSkill?.level) + "/" + String(currentSkill?.maxLevel);
                        /* Skill XP */
                        const skillXpElement = playerElement.querySelector("#skillXp");
                        if (skillXpElement) skillXpElement.textContent = String(currentSkill?.xp) + "/" + String(currentSkill?.xpNext);
                        /* Skill XP */
                        const skillIntervalElement = playerElement.querySelector("#skillInterval");
                        if (skillIntervalElement) skillIntervalElement.textContent = String(currSkill.baseInterval);

                        /* Recipe Data */
                        /* Recipe */
                        const recipeElement = playerElement.querySelector("#recipe");
                        if (recipeElement) recipeElement.textContent = String(currRecipe?.getIdentifier() ?? "N/A");
                        /* Recipe Level */
                        const recipeLevelElement = playerElement.querySelector("#recipeLevel");
                        if (recipeLevelElement) recipeLevelElement.textContent = String(currentSkill?.getSelectedRecipe()?.level) + "/" + String(currentSkill?.getSelectedRecipe()?.maxLevel);  
                        /* Recipe XP */
                        const recipeXpElement = playerElement.querySelector("#recipeXp");
                        if (recipeXpElement) recipeXpElement.textContent = String(currentSkill?.getSelectedRecipe()?.xp) + "/" + String(currentSkill?.getSelectedRecipe()?.xpNext); 
                        /* Recipe Progression */
                        const recipeProgressionElement = playerElement.querySelector("#recipeProgression");
                        if (recipeProgressionElement) recipeProgressionElement.textContent = String(currAction?.getProgression() ?? "N/A") + " %";  
                        const recipeProgressionViewElement = playerElement.querySelector("#recipeProgressionView");
                        if (recipeProgressionViewElement) {
                            /** @ts-ignore */ 
                            recipeProgressionViewElement.value = currAction?.getProgression();
                        }

                    } else {
                        console.log("setOnRefresh:Player element not found");
                    }
                }
            });
        });
    }
}