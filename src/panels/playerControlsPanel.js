// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playerControlsPanel.js

import { CorePanel } from "./corePanel.js";
import { CombatAction } from "../dataObjects/actions/combatAction.js";
import { MetalWorkAction } from "../dataObjects/actions/metalWorkAction.js";

export class PlayerControlsPanel extends CorePanel {
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

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = this.genId("constrols");
            newCardDiv.style.display = "flex";
            newCardDiv.style.width = "100%";
            newCardDiv.style.flexDirection = "column";

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
                    "start-metalWork",
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

            result.push(newCardDiv);
            return result;
        });

        this.setOnRefresh(() => {
            // ...
        })
    }
}