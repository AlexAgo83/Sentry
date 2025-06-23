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

        this.setOnGenId(() => {
            return player.id;
        })

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = "card-" + player.id;
            // newCardDiv.classList.add("generic-container-players");

            /** ID */
            this.registerComponent(
                newCardDiv, "id", 
                this.createLabelValue("id", "ID"));

            /** NAME LABEL */
            this.registerComponent(
                newCardDiv, "nameLabel", 
                this.createLabel("Name")); /* ONLY LABEL */
            
            /** NAME INPUT */
            this.registerComponent(
                newCardDiv, "nameInput", 
                this.createInput(
                    "nameInput", 
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
                newCardDiv, "dateCreated", 
                this.createLabelValue("dateCreated", "Date Created")); // , null, "fs-s"));

            /** HP */
            this.registerComponent(
                newCardDiv, "hp", 
                this.createLabelValue("hp", "HP"));

            /** GOLD */
            this.registerComponent(
                newCardDiv, "gold", 
                this.createLabelValue("gold", "Gold"));

            /** SKILL */
            this.registerComponent(
                newCardDiv, "skill", 
                this.createLabelValue("skill", "Skill"));

            /** SKILL LEVEL */
            this.registerComponent(
                newCardDiv, "skillLevel", 
                this.createLabelValue("skillLevel", "Skill Level"));

            /** SKILL XP */
            this.registerComponent(
                newCardDiv, "skillXp", 
                this.createLabelValue("skillXp", "Skill XP"));

            /** SKILL INTERVAL */
            this.registerComponent(
                newCardDiv, "skillInterval", 
                this.createLabelValue("skillInterval", "Skill Interval"));

            /** RECIPE */
            this.registerComponent(
                newCardDiv, "recipe", 
                this.createLabelValue("recipe", "Recipe"));

            /** RECIPE LEVEL */
            this.registerComponent(
                newCardDiv, "recipeLevel", 
                this.createLabelValue("recipeLevel", "Recipe Level"));

            /** RECIPE XP */
            this.registerComponent(
                newCardDiv, "recipeXp", 
                this.createLabelValue("recipeXp", "Recipe XP"));

            /** RECIPE PROGRESSION */
            this.registerComponent(
                newCardDiv, "recipeProgression", 
                this.createLabelValue("recipeProgression", "Recipe Progression"));

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
                newCardDiv, "recipeProgressionView", 
                this.createProgress("recipeProgressionView", null, onChangeInterval));

            /** Stop Action */
            this.registerComponent(
                newCardDiv, "stop-action", 
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
                            const idElement = this.getComponentContent("id");
                            if (idElement) idElement.textContent = String(player.id);

                            /* Name */
                            const nameElement = this.getComponentContent("nameInput");
                            if (nameElement) 
                                // @ts-ignore
                                nameElement.value = String(player.name);

                            /* Date Created */
                            const dateCreatedElement = this.getComponentContent("dateCreated");
                            if (dateCreatedElement) dateCreatedElement.textContent = formatDate(new Date(player.dateCreated));

                            /* HP */
                            const hpElement = this.getComponentContent("hp");
                            if (hpElement) hpElement.textContent = String(player.hp);

                            /* Gold */
                            const goldElement = this.getComponentContent("gold");
                            if (goldElement) goldElement.textContent = String(player.gold);
    
                            /* Skill */
                            const skillElement = this.getComponentContent("skill");
                            if (skillElement) skillElement.textContent = String(currSkill?.getIdentifier() ?? "N/A");

                            /* Skill Level */
                            const skillLevelElement = this.getComponentContent("skillLevel");
                            if (skillLevelElement) skillLevelElement.textContent = String(currentSkill?.level) + "/" + String(currentSkill?.maxLevel);

                            /* Skill XP */
                            const skillXpElement = this.getComponentContent("skillXp");
                            if (skillXpElement) skillXpElement.textContent = String(currentSkill?.xp) + "/" + String(currentSkill?.xpNext);

                            /* Skill XP */
                            const skillIntervalElement = this.getComponentContent("skillInterval");
                            if (skillIntervalElement) skillIntervalElement.textContent = String(currSkill.baseInterval);
    
                            /* Recipe */
                            const recipeElement = this.getComponentContent("recipe");
                            if (recipeElement) recipeElement.textContent = String(currRecipe?.getIdentifier() ?? "N/A");

                            /* Recipe Level */
                            const recipeLevelElement = this.getComponentContent("recipeLevel");
                            if (recipeLevelElement) recipeLevelElement.textContent = String(currentSkill?.getSelectedRecipe()?.level) + "/" + String(currentSkill?.getSelectedRecipe()?.maxLevel);  

                            /* Recipe XP */
                            const recipeXpElement = this.getComponentContent("recipeXp");
                            if (recipeXpElement) recipeXpElement.textContent = String(currentSkill?.getSelectedRecipe()?.xp) + "/" + String(currentSkill?.getSelectedRecipe()?.xpNext); 

                            /* Recipe Progression */
                            const recipeProgressionElement = this.getComponentContent("recipeProgression");
                            if (recipeProgressionElement) recipeProgressionElement.textContent = String(currAction?.getProgression() ?? "N/A") + " %";  
                            const recipeProgressionViewElement = this.getComponentContent("recipeProgressionView");
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