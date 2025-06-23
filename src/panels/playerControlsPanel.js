// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playerControlsPanel.js

import { CorePanel } from "./corePanel.js";
import { STATIC_SKILLS_LIST } from "../managers/skillManager.js";
import { createActionByID } from "../managers/actionManager.js";

const REF_PLAYER_CONTROLS = "controls";
const REF_PLAYER_SELECT_SKILL = "select-skill";
const REF_PLAYER_SELECT_RECIPE = "select-recipe";
const REF_PLAYER_ACTION_START = "start-action";
const REF_PLAYER_ACTION_STOP = "stop-action";

const REF_SELECT_DEFAULT_SKILL_LABEL = "Select Skill";
const REF_SELECT_DEFAULT_RECIPE_LABEL = "Select Recipe";

export class PlayerControlsPanel extends CorePanel {
    constructor(instance, parentId, contentId, player) {
        super(
            instance,
            parentId, 
            contentId,
            false
        );

        this.player = player;

        this.optionSkills = [];
        this.optionSkills.push(new Option(REF_SELECT_DEFAULT_SKILL_LABEL, ""));
        STATIC_SKILLS_LIST.forEach((identifier) => {
            this.optionSkills.push(new Option(identifier, identifier));
        })

        this.optionRecipes = null;

        
        this.userSelectedSkill = null;
        this.currentLoadedRecipe = null;
        this.userSelectedRecipe = null;

        this.setOnGenId(() => {
            return player.getIdentifier();
        })

        this.setOnInit(() => {
            const result = [];

            const newCardDiv = document.createElement("div");
            newCardDiv.id = this.genId(REF_PLAYER_CONTROLS);
            newCardDiv.style.display = "flex";
            newCardDiv.style.width = "100%";
            newCardDiv.style.flexDirection = "column";

            /** Select Skill */
            this.registerComponent(
                newCardDiv,
                this.createSelect(
                    REF_PLAYER_SELECT_SKILL, 
                    null, 
                    this.optionSkills,
                    (value) => {
                        if (value == "") {
                            this.userSelectedSkill = null;
                            return;
                        }
                        this.userSelectedSkill = player.getSkillByID(value);
                        this.optionRecipes = null;
                        this.userSelectedRecipe = null;
                    }
                )
            )

            /** Select Recipe */
            this.registerComponent(
                newCardDiv,
                this.createSelect(
                    REF_PLAYER_SELECT_RECIPE, 
                    null, 
                    this.optionRecipes,
                    (value) => {
                        if (value == "" || this.userSelectedSkill == null) {
                            this.userSelectedRecipe = null;
                            return;
                        }
                        const selectedSkill = this.userSelectedSkill;
                        this.userSelectedRecipe = player.getSkillByID(selectedSkill.getIdentifier()).recipes.get(value);
                    }
                )
            )

            /** Start Action */
            this.registerComponent(
                newCardDiv,
                this.createButton(
                    REF_PLAYER_ACTION_START, 
                    "Start Action", 
                    () => {
                        if (this.userSelectedSkill && this.userSelectedRecipe) {
                            player.setSelectedAction(null);
                            const action = createActionByID(this.userSelectedSkill.getIdentifier(), player);
                            action.getSkill().setSelectedRecipe(this.userSelectedRecipe);
                            player.setSelectedAction(action);
                        }
                    },
                    "lightgreen"
                )
            );

            /** Stop Action */
            this.registerComponent(
                newCardDiv,
                this.createButton(
                    REF_PLAYER_ACTION_STOP, 
                    "Stop Action", 
                    () => {
                        player.setSelectedAction(null);
                    },
                    "lightpink"
                )
            );

            result.push(newCardDiv);
            return result;
        });

        this.setOnRefresh(() => {
            const panel = this.getPanel();
            const contentPanel = this.getContentPanel();
            if (!panel || !contentPanel) return;

            const controlsElement = panel.querySelector(`#${this.genId(REF_PLAYER_CONTROLS)}`);
            if (!controlsElement) return;

            /* TOOLS */
            // const currAction = player.getSelectedAction();
            // const currSkill = player.getSelectedSkill();
            // const currRecipe = player.getSelectedRecipe();

            const selectRecipe = this.getComponentContent(REF_PLAYER_SELECT_RECIPE);
            if (selectRecipe) {
                // @ts-ignore
                const options = selectRecipe.options;
                if (this.userSelectedSkill) {
                    if (this.optionRecipes) {
                        // DO NOTHING - Keep threads safe
                    } else {
                        // SETUP Options with recipes from user selected skill
                        options.length = 0;
                        options.add(
                                new Option(REF_SELECT_DEFAULT_RECIPE_LABEL, ""));
                        for (const key of this.userSelectedSkill.recipes.keys()) {
                            const recipeToAdd = this.userSelectedSkill.recipes.get(key);
                            options.add(
                                new Option(
                                    recipeToAdd.getIdentifier(), 
                                    recipeToAdd.getIdentifier()))
                        }
                        // @ts-ignore
                        selectRecipe.disabled = false;
                        this.optionRecipes = options;
                    }
                } else {
                    options.length = 0;
                    // @ts-ignore
                    selectRecipe.disabled = true;
                }
            }

            const btStartAction = this.getComponentContent(REF_PLAYER_ACTION_START);
            if (btStartAction) {
                // @ts-ignore
                btStartAction.disabled = !this.userSelectedSkill || !this.userSelectedRecipe;
            }

            const btStopAction = this.getComponentContent(REF_PLAYER_ACTION_STOP);
            if (btStopAction) {
                // @ts-ignore
                btStopAction.disabled = !player.getSelectedAction();
            }
            
        })
    }
}