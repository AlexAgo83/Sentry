// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// skillManager.js

import { CoreManager } from "./coreManager.js";

import { CombatSkill } from "../dataObjects/skills/combatSkill.js";
import { HuntingSkill } from "../dataObjects/skills/huntingSkill.js";
import { CookingSkill } from "../dataObjects/skills/cookingSkill.js";

export const STATIC_SKILLS_LIST = ["Combat", "Hunting", "Cooking"];

export const createSkillByID = (identifier) => {
    if (identifier == "Combat") {
        console.log("createSkillByID:Combat skill created");
        return new CombatSkill();
    } else if (identifier == "Hunting") {
        console.log("createSkillByID:Hunting skill created");
        return new HuntingSkill();
    } else if (identifier == "Cooking") {
        console.log("createSkillByID:Cooking skill created");
        return new CookingSkill();
    } else {
        console.warn("createSkillByID:Skill not found");
    }
    return null;
}

export class SkillManager extends CoreManager {

    constructor(instance) {
        super(instance);
    }

    loadSkills = (skillsData, player) => {
        if (skillsData == null || skillsData == {}) {
            console.warn("loadSkills:skillsData not found for player " + player.getIdentifier(), skillsData);
        } else {
            console.log("loadSkills:skillsData found for player " + player.getIdentifier(), skillsData);
            Object.keys(skillsData).forEach((key) => {
                const savedSkill = skillsData[key];
                if (savedSkill) {
                    const currSkill = player.skills.get(key);
                    if (currSkill) {   
                        currSkill.load(savedSkill);
                        console.log("loadSkill:" + key + " skill loaded for player " + player.getIdentifier());
                    } else {
                        console.warn("loadSkill:" + key + " skill not found for player " + player.getIdentifier());
                    }
                } else {
                    console.warn("loadSkill:" + key + " skill not found for player " + player.getIdentifier());
                }
            });
        }
        return player.skills;
    }

    
}