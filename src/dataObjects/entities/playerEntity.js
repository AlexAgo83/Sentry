// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// player.js

import { createSkillByID, STATIC_SKILLS_LIST } from "../../managers/skillManager.js";
import { CharacterEntity } from "./characterEntity.js";

export const STATIC_NAME_PREFIXE = "Player_";

export class PlayerEntity extends CharacterEntity {

    constructor(identifier) {
        super(identifier);

        this.hp = 100;
        this.gold = 0;
        this.dmg = 1;

        this.setName(STATIC_NAME_PREFIXE + identifier);
        this.selectedAction = null;
        this.selectedActionID = null;
        this.dateCreated = Date.now();

        this.skills = new Map();

        STATIC_SKILLS_LIST.forEach((identifier) => {
            this.addSkill(createSkillByID(identifier)); 
        })

        this.setOnLoad((entityData) => {
            this.name = entityData.name;
            this.hp = entityData.hp;
            this.gold = entityData.gold;
            this.dmg = entityData.dmg;
            this.selectedActionID = entityData.selectedActionID;
            this.skillsData = entityData.skillsData;
            this.dateCreated = entityData.dateCreated ?? Date.now();
        });

        this.setOnSave(() => {
            const resultSave = {
                name: this.name,
                hp: this.hp,
                gold: this.gold,
                dmg: this.dmg,
                selectedActionID: this.selectedActionID,
                skillsData: this.saveSkills(),
                dateCreated: this.dateCreated
            };
            return resultSave
        });
    }

    addSkill = (skill) => {
        this.skills.set(skill.getIdentifier(), skill);
    }
    removeSkill = (skill) => {
        this.skills.delete(skill.getIdentifier());
    }
    getSkillByID = (identifier) => {
        return this.skills.get(identifier);
    }
    saveSkills = () => {
        const result = {};
        for (const key of this.skills.keys()) {
            const skillObject = this.getSkillByID(key);
            result[skillObject.getIdentifier()] = skillObject.save();
        }
        return result;
    }

    setSelectedAction = (action) => {
        this.selectedAction = action;
        this.selectedActionID = action?.getIdentifier();
        // console.log(`player:Selected action ${this.selectedActionID}`);
    }
    getSelectedAction = () => {
        return this.selectedAction;
    }

    getSelectedSkill = () => {
        return this.selectedAction?.getSkill();
    }
    
    getSelectedRecipe = () => {
        return this.selectedAction?.getSkill()?.getSelectedRecipe();
    }

}