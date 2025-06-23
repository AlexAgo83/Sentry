// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playersListPanel.js

import { CorePanel } from "./corePanel.js";
import { PlayerCardPanel } from "./playerCardPanel.js";

export class PlayerListPanel extends CorePanel {
    constructor(instance) {
        super(
            instance,
            "player-list-panel", 
            "player-list-panel-content",
            false
        );
        this.maxRecipe = 10;

        this.setOnPrepare(() => {
            const playersObject = this.instance.playerManager.getPlayers();
            playersObject.forEach((player) => {
                /** SETUP Player Card Panels */
                let isAlreadyAdded = false;
                this.subPanels.forEach((subPanel) => {
                    if (subPanel instanceof PlayerCardPanel
                        && subPanel.player.id == player.id) {
                        isAlreadyAdded = true;
                    }
                });
                /** If not already added */
                if (!isAlreadyAdded) {
                    const playerCardPanel = new PlayerCardPanel(this.instance, player, "player-list-panel-content", "player-card-" + player.id);
                    this.registerSubPanel(playerCardPanel);
                    console.log(`SubModule: player-card-${player.id}-panel registered !`);
                }
            });
        })

        /** ON INIT */
        this.setOnInit(() => {
            const result = [];
            // const playersObject = this.instance.playerManager.getPlayers();
            // playersObject.forEach((player) => {
            //     // ...
            // })
            return result;
        })

        /** ON REFRESH */
        this.setOnRefresh(() => {
            // const panel = this.getPanel();
            // if (panel) {
            //     const contentPanel = this.getContentPanel();
            //     if (contentPanel) {
            //         // ...
            //     }
            // }
        });
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