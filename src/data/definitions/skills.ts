import type { SkillDefinition, SkillId } from "../../core/types";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    { id: "CombatMelee", name: "Combat - Melee", baseInterval: 5000 },
    { id: "CombatRanged", name: "Combat - Ranged", baseInterval: 5000 },
    { id: "CombatMagic", name: "Combat - Magic", baseInterval: 5000 },
    { id: "Roaming", name: "Roaming", baseInterval: 5000 },
    { id: "Hunting", name: "Hunting", baseInterval: 2500 },
    { id: "Cooking", name: "Cooking", baseInterval: 3000 },
    { id: "Excavation", name: "Excavation", baseInterval: 2000 },
    { id: "MetalWork", name: "Metalwork", baseInterval: 3500 },
    { id: "Alchemy", name: "Alchemy", baseInterval: 3000 },
    { id: "Herbalism", name: "Herbalism", baseInterval: 2500 },
    { id: "Tailoring", name: "Tailoring", baseInterval: 3500 },
    { id: "Fishing", name: "Fishing", baseInterval: 2500 },
    { id: "Carpentry", name: "Carpentry", baseInterval: 3500 },
    { id: "Leatherworking", name: "Tanning", baseInterval: 3500 },
    { id: "Invocation", name: "Invocation", baseInterval: 3500 }
];

const SKILL_BY_ID = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillDefinition>>((acc, skill) => {
    acc[skill.id] = skill;
    return acc;
}, {} as Record<SkillId, SkillDefinition>);

export const getSkillDefinition = (skillId: SkillId): SkillDefinition | undefined => {
    return SKILL_BY_ID[skillId];
};
