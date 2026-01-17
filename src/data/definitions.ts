import { ActionDefinition, RecipeDefinition, SkillDefinition, SkillId } from "../core/types";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    { id: "Combat", name: "Combat", baseInterval: 1000 },
    { id: "Hunting", name: "Hunting", baseInterval: 1000 },
    { id: "Cooking", name: "Cooking", baseInterval: 1000 },
    { id: "Excavation", name: "Excavation", baseInterval: 1000 },
    { id: "MetalWork", name: "MetalWork", baseInterval: 1000 }
];

const RECIPES_BY_SKILL: Record<SkillId, RecipeDefinition[]> = {
    Combat: [
        { id: "monster001", skillId: "Combat", name: "Monster I" },
        { id: "monster002", skillId: "Combat", name: "Monster II" },
        { id: "monster003", skillId: "Combat", name: "Monster III" },
        { id: "monster004", skillId: "Combat", name: "Monster IV" }
    ],
    Hunting: [
        { id: "hunt001", skillId: "Hunting", name: "Hunt I" },
        { id: "hunt002", skillId: "Hunting", name: "Hunt II" }
    ],
    Cooking: [
        { id: "meal001", skillId: "Cooking", name: "Meal I" },
        { id: "meal002", skillId: "Cooking", name: "Meal II" }
    ],
    Excavation: [
        { id: "exca001", skillId: "Excavation", name: "Excavation I" },
        { id: "exca002", skillId: "Excavation", name: "Excavation II" },
        { id: "exca003", skillId: "Excavation", name: "Excavation III" }
    ],
    MetalWork: [
        { id: "mw001", skillId: "MetalWork", name: "Metalwork I" },
        { id: "mw002", skillId: "MetalWork", name: "Metalwork II" },
        { id: "mw003", skillId: "MetalWork", name: "Metalwork III" }
    ]
};

export const getRecipesForSkill = (skillId: SkillId): RecipeDefinition[] => {
    return RECIPES_BY_SKILL[skillId] ?? [];
};

export const ACTION_DEFINITIONS: ActionDefinition[] = [
    {
        id: "Combat",
        skillId: "Combat",
        staminaCost: 10,
        goldReward: 1,
        xpSkill: 1,
        xpRecipe: 2,
        stunTime: 5000
    },
    {
        id: "Hunting",
        skillId: "Hunting",
        staminaCost: 10,
        goldReward: 1,
        xpSkill: 1,
        xpRecipe: 2,
        stunTime: 5000
    },
    {
        id: "Cooking",
        skillId: "Cooking",
        staminaCost: 10,
        goldReward: 1,
        xpSkill: 1,
        xpRecipe: 2,
        stunTime: 5000
    },
    {
        id: "Excavation",
        skillId: "Excavation",
        staminaCost: 10,
        goldReward: 1,
        xpSkill: 1,
        xpRecipe: 2,
        stunTime: 5000
    },
    {
        id: "MetalWork",
        skillId: "MetalWork",
        staminaCost: 10,
        goldReward: 1,
        xpSkill: 1,
        xpRecipe: 2,
        stunTime: 5000
    }
];

export const getActionDefinition = (actionId: SkillId): ActionDefinition | undefined => {
    return ACTION_DEFINITIONS.find((action) => action.id === actionId);
};
