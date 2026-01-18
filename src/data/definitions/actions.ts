import type { ActionDefinition, SkillId } from "../../core/types";
import { SKILL_DEFINITIONS } from "./skills";

export const ACTION_DEFINITIONS: ActionDefinition[] = SKILL_DEFINITIONS.map((skill) => ({
    id: skill.id,
    skillId: skill.id,
    staminaCost: 10,
    goldReward: skill.id === "Combat" ? 1 : 0,
    xpSkill: 1,
    xpRecipe: 2,
    stunTime: 5000
}));

export const getActionDefinition = (actionId: SkillId): ActionDefinition | undefined => {
    return ACTION_DEFINITIONS.find((action) => action.id === actionId);
};
