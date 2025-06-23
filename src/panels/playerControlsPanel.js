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
        
        this.userSelectedSkill = null;
        this.userSelectedRecipe = null;

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

            /** Select Skill */
            this.registerComponent(
                newCardDiv,
                this.createSelect(
                    "select-skill", 
                    null, 
                    [{  value: "",        label: "Select Skill"},
                     {  value: "Combat",        label: "Combat"},
                     {  value: "Cooking",       label: "Cooking"},
                     {  value: "Excavation",    label: "Excavation"},
                     {  value: "Hunting",       label: "Hunting"},
                     {  value: "MetalWork",     label: "MetalWork"}],
                    (value) => {
                        if (value == "") {
                            this.userSelectedSkill = null;
                            return;
                        }
                        this.userSelectedSkill = player.getSkillByID(value);
                    }
                )
            )

            /** Select Recipe */
            this.registerComponent(
                newCardDiv,
                this.createSelect(
                    "select-recipe", 
                    null, 
                    [{  value: "",        label: "Select Recipe"}],
                    (value) => {
                        if (value == "" || this.userSelectedSkill == null) {
                            this.userSelectedRecipe = null;
                            return;
                        }
                        // const skill = player.getSkillByID(this.userSelectedRecipe)
                    }
                )
            )

            result.push(newCardDiv);
            return result;
        });

        this.setOnRefresh(() => {
            const panel = this.getPanel();
            if (panel) {
                const contentPanel = this.getContentPanel();
                if (contentPanel) {

                }
            }
        })
    }
}