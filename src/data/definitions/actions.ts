import type { ActionDefinition, ActionId, SkillDefinition, SkillId } from "../../core/types";
import { SKILL_DEFINITIONS } from "./skills";

const isActionSkill = (skill: SkillDefinition): skill is SkillDefinition & { id: ActionId } => {
    return skill.id !== "Combat";
};

export const ACTION_SKILL_DEFINITIONS: Array<SkillDefinition & { id: ActionId }> = SKILL_DEFINITIONS.filter(isActionSkill);

export const ACTION_DEFINITIONS: ActionDefinition[] = ACTION_SKILL_DEFINITIONS.map((skill) => ({
    id: skill.id,
    skillId: skill.id,
    staminaCost: 10,
    goldReward: skill.id === "Roaming" ? 1 : 0,
    xpSkill: 1,
    xpRecipe: 2,
    stunTime: 5000
}));

export const getActionDefinition = (actionId: SkillId): ActionDefinition | undefined => {
    return ACTION_DEFINITIONS.find((action) => action.id === actionId);
};
