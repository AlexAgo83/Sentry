// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// playerEntity.js

import { createSkillByID, STATIC_SKILLS_LIST } from "../../managers/skillManager.js";
import { CharacterEntity } from "./characterEntity.js";
import { StorageEntity } from "./storageEntity.js";

export const STATIC_NAME_PREFIXE = "Player_";
export const STATIC_DEFAULT_HP_MAX = 100;
export const STATIC_DEFAULT_HP = STATIC_DEFAULT_HP_MAX;
export const STATIC_DEFAULT_STAMINA_MAX = 100;
export const STATIC_DEFAULT_STAMINA = STATIC_DEFAULT_STAMINA_MAX;
export const STATIC_DEFAULT_GOLD = 0;

export class PlayerEntity extends CharacterEntity {

    constructor(identifier) {
        super(identifier);

        this.hp = STATIC_DEFAULT_HP;
        this.hpMax = STATIC_DEFAULT_HP_MAX;
        this.stamina = STATIC_DEFAULT_STAMINA;
        this.staminaMax = STATIC_DEFAULT_STAMINA_MAX;

        this.storage = new StorageEntity(identifier);

        this.gold = STATIC_DEFAULT_GOLD;

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
            this.hpMax = entityData.hpMax ?? STATIC_DEFAULT_HP_MAX;
            this.stamina = entityData.stamina;
            this.staminaMax = entityData.staminaMax ?? STATIC_DEFAULT_STAMINA_MAX;
            this.storage = new StorageEntity(identifier);
            this.storage.load(entityData.storageData);
            this.gold = entityData.gold;
            this.selectedActionID = entityData.selectedActionID;
            this.skillsData = entityData.skillsData;
            this.dateCreated = entityData.dateCreated ?? Date.now();
        });

        this.setOnSave(() => {
            const resultSave = {
                name: this.name,
                hp: this.hp,
                hpMax: this.hpMax,
                stamina: this.stamina,
                staminaMax: this.staminaMax,
                storageData: this.saveStorage(),
                gold: this.gold,
                selectedActionID: this.selectedActionID,
                skillsData: this.saveSkills(),
                dateCreated: this.dateCreated
            };
            return resultSave
        });
    }

    saveStorage = () => {
        return this.storage.save();
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

    /**
     * Saves the player's skills.
     * @returns {Object} An object containing the saved skill data, keyed by skill identifier.
     */
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