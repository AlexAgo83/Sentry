// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// skillManager.js

import { CoreManager } from "./coreManager.js";

import { CombatSkill } from "../dataObjects/skills/combatSkill.js";
import { HuntingSkill } from "../dataObjects/skills/huntingSkill.js";
import { CookingSkill } from "../dataObjects/skills/cookingSkill.js";
import { ExcavationSkill } from "../dataObjects/skills/excavationSkill.js";
import { MetalWorkSkill } from "../dataObjects/skills/metalWorkSkill.js";

export const STATIC_SKILLS_LIST = ["Combat", "Hunting", "Cooking", "Excavation", "MetalWork"];

export const createSkillByID = (identifier) => {
    if (identifier == "Combat") {
        return new CombatSkill();
    } else if (identifier == "Hunting") {
        return new HuntingSkill();
    } else if (identifier == "Cooking") {
        return new CookingSkill();
    } else if (identifier == "Excavation") {
        return new ExcavationSkill();
    } else if (identifier == "MetalWork") {
        return new MetalWorkSkill();
    } else {
        console.warn("(createSkillByID) Skill not found, id:" + identifier);
    }
    return null;
}

export class SkillManager extends CoreManager {

    constructor(instance) {
        super(instance);
    }

    loadSkills = (skillsData, playerObject) => {
        if (skillsData == null || skillsData == {}) {
            console.warn("loadSkills:skillsData not found for player " + playerObject.getIdentifier(), skillsData);
        } else {
            Object.keys(skillsData).forEach((key) => {
                const savedSkill = skillsData[key];
                if (savedSkill) {
                    const currSkill = playerObject.skills.get(key);
                    if (currSkill) {   
                        currSkill.load(savedSkill);
                        if (savedSkill.recipesData) {
                            this.instance.recipeManager.loadRecipes(savedSkill.recipesData, currSkill);
                        }
                    } else {
                        console.warn("loadSkill:" + key + " skill not found for player " + playerObject.getIdentifier());
                    }
                } else {
                    console.warn("loadSkill:" + key + " skill not found for player " + playerObject.getIdentifier());
                }
            });
        }
        return playerObject.skills;
    }

    
}