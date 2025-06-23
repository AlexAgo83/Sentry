// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { formatDate } from "../utils.js";
import { CorePanel } from "./corePanel.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { MetalWorkAction } from "../dataObjects/actions/metalWorkAction.js";

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
            return player.id;
        })

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = "card-" + player.id;

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
                            const input = this.getContentPanel()?.querySelector("#name");
                            if (input) {
                                const oldName = String(player.name);
                                // @ts-ignore
                                player.setName(input.value);
                                // this.instance.dataManager.save();
                                console.log(`player:${player.id} name changed from '${oldName}' to '${player.name}'`);
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

            /** Start Action Combat */
            this.registerComponent(
                newCardDiv,
                this.createButton(
                    "start-combat",
                    "Start Combat", 
                    () => {
                        player.setSelectedAction(null);
                        const action = new CombatAction(player);
                        const recipe = action.getSkill().recipes.get("monster001");
                        action.getSkill().setSelectedRecipe(recipe);
                        player.setSelectedAction(action);
                    },
                    "lightblue"
                )
            );

            /** Start Action MetalWork */
            this.registerComponent(
                newCardDiv,
                this.createButton(
                    "start-combat",
                    "Start MetalWork", 
                    () => {
                        player.setSelectedAction(null);
                        const action = new MetalWorkAction(player);
                        const recipe = action.getSkill().recipes.get("mw001");
                        action.getSkill().setSelectedRecipe(recipe);
                        player.setSelectedAction(action);
                    },
                    "lightgreen"
                )
            );

            /** Stop Action */
            this.registerComponent(
                newCardDiv,
                this.createButton(
                    "stop-action", 
                    "Stop Action", 
                    () => {
                        player.setSelectedAction(null);
                    },
                    "lightgray"
                )
            );

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
    
                    if (panel && currentSkill) {
                        const cardElement = panel.querySelector(`#card-${player.id}`);
                        if (cardElement) {
    
                            const currAction = player.getSelectedAction();
                            const currSkill = currAction?.getSkill();
                            const currRecipe = currSkill?.getSelectedRecipe();
    
                            /* Player Data */
                            /* ID */
                            const idElement = this.getComponentContent(REF_PLAYER_ID);
                            if (idElement) idElement.textContent = String(player.id);

                            /* Name */
                            const nameElement = this.getComponentContent(REF_PLAYER_NAME_INPUT);
                            if (nameElement) 
                                // @ts-ignore
                                nameElement.value = String(player.name);

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
                            if (recipeProgressionElement) recipeProgressionElement.textContent = String(currAction?.getProgression() ?? "N/A") + " %";  
                            const recipeProgressionViewElement = this.getComponentContent(REF_PLAYER_RECIPE_PROGRESS_VIEW);
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

    genId = (newId) => {
        return newId + "-" + this.player.id;
    }
}


// const newPlayerDiv = document.createElement("div");
// newPlayerDiv.id = "player-list-item-" + player.id;
// newPlayerDiv.classList.add("generic-container-players");

// newPlayerDiv.appendChild(this.createButton(
//     "remove-player-" + player.id, 
//     "Remove", 
//     () => {
//         this.instance.playerManager.removePlayer(player.id);
//     },
//     "red"
// ));

// newPlayerDiv.appendChild(this.createButton(
//     "start-combat-" + player.id, 
//     "Start Action : Combat", 
//     () => {
//         player.setSelectedAction(null);
        
//         const combatAction = new CombatAction(player);
//         const monster001 = combatAction.getSkill().recipes.get("monster001");
//         combatAction.getSkill().setSelectedRecipe(monster001);

//         player.setSelectedAction(combatAction);
//     },
//     "lightblue"
// ));

// newPlayerDiv.appendChild(this.createButton(
//     "start-hunting-" + player.id, 
//     "Start Action : Hunting", 
//     () => {
//         player.setSelectedAction(null);

//         const huntingAction = new HuntingAction(player);
//         const hunt001 = huntingAction.getSkill().recipes.get("hunt001");
//         huntingAction.getSkill().setSelectedRecipe(hunt001);

//         player.setSelectedAction(huntingAction);
//     },
//     "lightpink"
// ));

// newPlayerDiv.appendChild(this.createButton(
//     "start-cooking-" + player.id, 
//     "Start Action : Cooking", 
//     () => {
//         player.setSelectedAction(null);

//         const cookingAction = new CookingAction(player);
//         const meal001 = cookingAction.getSkill().recipes.get("meal001");
//         cookingAction.getSkill().setSelectedRecipe(meal001);

//         player.setSelectedAction(cookingAction);
//     },
//     "lightpink"
// ));

// newPlayerDiv.appendChild(this.createButton(
//     "start-excavation-" + player.id, 
//     "Start Action : Excavation", 
//     () => {
//         player.setSelectedAction(null);

//         const excavationAction = new ExcavationAction(player);
//         const exca001 = excavationAction.getSkill().recipes.get("exca001");
//         excavationAction.getSkill().setSelectedRecipe(exca001);

//         player.setSelectedAction(excavationAction);
//     },
//     "lightgreen"
// ));

// newPlayerDiv.appendChild(this.createButton(
//     "start-metalwork-" + player.id, 
//     "Start Action : MetalWork", 
//     () => {
//         player.setSelectedAction(null);

//         const metalWorkAction = new MetalWorkAction(player);
//         const mw001 = metalWorkAction.getSkill().recipes.get("mw001");
//         metalWorkAction.getSkill().setSelectedRecipe(mw001);

//         player.setSelectedAction(metalWorkAction);
//     },
//     "lightgreen"
// ));

// for (let i = 0; i < this.maxRecipe; i++) {
//     const button = this.createButton(
//         "recipe-selector-" + i + "-" + player.id, 
//         "Select Recipe", 
//         () => {
//             player.setSelectedAction(null);
//         },
//         "lightpurple"
//     );
//     // @ts-ignore
//     button.style.display = "none";
//     newPlayerDiv.appendChild(button);
// }

// newPlayerDiv.appendChild(this.createButton(
//     "stop-action-" + player.id, 
//     "Stop Action", 
//     () => {
//         player.setSelectedAction(null);
//     },
//     "lightgray"
// ));




/////////////////////////:

// onRefresh()

// this.instance.playerManager.getPlayers().forEach((player) => {
//     const selectedAction = player.getSelectedAction();
//     const currentSkill = selectedAction?.getSkill();
//     const panel = this.getPanel();

//     if (panel && currentSkill) {

//         const playerElement = panel.querySelector(`#player-${player.id}`);
//         if (playerElement) {
//             const currAction = player.getSelectedAction();
//             const currSkill = currAction?.getSkill();
//             const currRecipe = currSkill?.getSelectedRecipe();

//             /** Recipe Selector */
//             if (currSkill) {
//                 let i = 0;
//                 for (const key of currSkill.recipes.keys()) {
//                     const lRecipe = currSkill.recipes.get(key);
//                     if (i < this.maxRecipe) {
//                         const recipeSelector = playerElement.querySelector(`#recipe-selector-${i}-${player.id}`);
//                         if (recipeSelector) {
//                             // @ts-ignore
//                             recipeSelector.style.display = "inline-block";
//                             recipeSelector.textContent = "Select Recipe : " + key;
//                             recipeSelector.addEventListener("click", () => {
//                                 currSkill.setSelectedRecipe(currSkill.getRecipeByID(key));
//                                 console.log("(important) setSelectedRecipe:" + key);

//                                 const recipe = currAction.getSkill().recipes.get(key);
//                                 currAction.getSkill().setSelectedRecipe(recipe);
//                                 player.setSelectedAction(currAction);
//                             });
//                         } 
//                         i+=1;
//                     }
//                 }

//                 if (i<this.maxRecipe) {
//                     for (i = i; i<this.maxRecipe; i++) {
//                         const recipeSelector = panel.querySelector(`#recipe-selector-${i}-${player.id}`);
//                         if (recipeSelector) {
//                             // @ts-ignore
//                             recipeSelector.style.display = "none";
//                             recipeSelector.textContent = "Select Recipe : N/A";
//                         }     
//                     }
//                 }
//             }
//         } else {
//             console.log("setOnRefresh:Player element not found");
//         }
//     }
// });