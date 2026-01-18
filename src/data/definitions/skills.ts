import type { SkillDefinition, SkillId } from "../../core/types";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    { id: "Combat", name: "Combat", baseInterval: 1000 },
    { id: "Hunting", name: "Hunting", baseInterval: 1000 },
    { id: "Cooking", name: "Cooking", baseInterval: 1000 },
    { id: "Excavation", name: "Excavation", baseInterval: 1000 },
    { id: "MetalWork", name: "Metalwork", baseInterval: 1000 },
    { id: "Alchemy", name: "Alchemy", baseInterval: 1000 },
    { id: "Herbalism", name: "Herbalism", baseInterval: 1000 },
    { id: "Tailoring", name: "Tailoring", baseInterval: 1000 },
    { id: "Fishing", name: "Fishing", baseInterval: 1000 },
    { id: "Carpentry", name: "Carpentry", baseInterval: 1000 },
    { id: "Leatherworking", name: "Leatherworking", baseInterval: 1000 }
];

const SKILL_BY_ID = SKILL_DEFINITIONS.reduce<Record<SkillId, SkillDefinition>>((acc, skill) => {
    acc[skill.id] = skill;
    return acc;
}, {} as Record<SkillId, SkillDefinition>);

export const getSkillDefinition = (skillId: SkillId): SkillDefinition | undefined => {
    return SKILL_BY_ID[skillId];
};
