import type { SkillDefinition, SkillId } from "../../core/types";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    { id: "Combat", name: "Roaming", baseInterval: 5000 },
    { id: "Hunting", name: "Hunting", baseInterval: 2500 },
    { id: "Cooking", name: "Cooking", baseInterval: 3000 },
    { id: "Excavation", name: "Excavation", baseInterval: 2000 },
    { id: "MetalWork", name: "Metalwork", baseInterval: 3500 },
    { id: "Alchemy", name: "Alchemy", baseInterval: 3000 },
    { id: "Herbalism", name: "Herbalism", baseInterval: 2500 },
    { id: "Tailoring", name: "Tailoring", baseInterval: 3500 },
    { id: "Fishing", name: "Fishing", baseInterval: 2500 },
    { id: "Carpentry", name: "Carpentry", baseInterval: 3500 },
    { id: "Leatherworking", name: "Leatherworking", baseInterval: 3500 }
];

const SKILL_BY_ID = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillDefinition>>((acc, skill) => {
    acc[skill.id] = skill;
    return acc;
}, {} as Record<SkillId, SkillDefinition>);

export const getSkillDefinition = (skillId: SkillId): SkillDefinition | undefined => {
    return SKILL_BY_ID[skillId];
};
