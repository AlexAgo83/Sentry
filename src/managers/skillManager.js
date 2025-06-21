// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// skillManager.js

import { CoreManager } from "./coreManager.js";

import { CombatSkill } from "../dataObjects/skills/combatSkill.js";
import { HuntSkill } from "../dataObjects/skills/huntSkill.js";

export const STATIC_SKILLS_LIST = ["Combat", "Hunt"];

export const createSkillByID = (identifier) => {
    if (identifier == "Combat") {
        console.log("createSkillByID:Combat skill created");
        return new CombatSkill();
    } else if (identifier == "Hunt") {
        console.log("createSkillByID:Hunt skill created");
        return new HuntSkill();
    } else {
        console.log("createSkillByID:Skill not found");
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