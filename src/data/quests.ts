import type { ItemId, PlayerId, PlayerState, QuestId, SkillId } from "../core/types";
import { SKILL_DEFINITIONS, getRecipeUnlockLevel, getRecipesForSkill } from "./definitions";
import { EQUIPMENT_DEFINITIONS } from "./equipment";

export type QuestKind = "skill" | "craft";

export type QuestCondition =
    | { type: "skill"; skillId: SkillId; level: number }
    | { type: "craft"; itemId: ItemId; count: number };

export type QuestDefinition = {
    id: QuestId;
    kind: QuestKind;
    title: string;
    subtitle: string;
    rewardGold: number;
    condition: QuestCondition;
};

type SkillQuestDefinition = QuestDefinition & { condition: { type: "skill"; skillId: SkillId; level: number } };
type CraftQuestDefinition = QuestDefinition & { condition: { type: "craft"; itemId: ItemId; count: number } };

export type QuestProgress = {
    current: number;
    target: number;
    isComplete: boolean;
};

const SKILL_QUEST_LEVEL = 10;
const SKILL_QUEST_REWARD_GOLD = 100;
const CRAFT_QUEST_COUNT = 10;
const CRAFT_QUEST_BASE_GOLD = 50;
const CRAFT_QUEST_GOLD_PER_LEVEL = 10;

const buildCraftRewardLookup = (): Record<ItemId, number> => {
    const equipableIds = new Set(EQUIPMENT_DEFINITIONS.map((item) => item.id));
    const result: Record<ItemId, number> = {};
    SKILL_DEFINITIONS.forEach((skill) => {
        const recipes = getRecipesForSkill(skill.id);
        recipes.forEach((recipe) => {
            if (!recipe.itemRewards) {
                return;
            }
            const unlockLevel = getRecipeUnlockLevel(recipe);
            Object.keys(recipe.itemRewards).forEach((itemId) => {
                if (!equipableIds.has(itemId)) {
                    return;
                }
                const current = result[itemId];
                if (!current || unlockLevel < current) {
                    result[itemId] = unlockLevel;
                }
            });
        });
    });
    return result;
};

const craftRewardLevels = buildCraftRewardLookup();

const SKILL_QUESTS: SkillQuestDefinition[] = SKILL_DEFINITIONS.map((skill) => ({
    id: `quest:skill:${skill.id}`,
    kind: "skill",
    title: `Reach ${skill.name} Lv ${SKILL_QUEST_LEVEL}`,
    subtitle: "Skill milestone",
    rewardGold: SKILL_QUEST_REWARD_GOLD,
    condition: {
        type: "skill",
        skillId: skill.id,
        level: SKILL_QUEST_LEVEL
    }
}));

const CRAFT_QUESTS: CraftQuestDefinition[] = EQUIPMENT_DEFINITIONS.map((item) => {
    const recipeLevel = craftRewardLevels[item.id] ?? 0;
    const rewardGold = recipeLevel > 0
        ? CRAFT_QUEST_BASE_GOLD + recipeLevel * CRAFT_QUEST_GOLD_PER_LEVEL
        : CRAFT_QUEST_BASE_GOLD;

    return {
        id: `quest:craft:${item.id}`,
        kind: "craft",
        title: `Craft ${item.name} x${CRAFT_QUEST_COUNT}`,
        subtitle: "Equipable item",
        rewardGold,
        condition: {
            type: "craft",
            itemId: item.id,
            count: CRAFT_QUEST_COUNT
        }
    };
});

export const QUEST_DEFINITIONS: QuestDefinition[] = [
    ...SKILL_QUESTS,
    ...CRAFT_QUESTS
];

export const QUEST_DEFINITIONS_BY_KIND = {
    skill: SKILL_QUESTS,
    craft: CRAFT_QUESTS
};

export const QUEST_CRAFT_ITEM_IDS = new Set<ItemId>(
    CRAFT_QUESTS.map((quest) => quest.condition.itemId)
);

export const getSharedSkillLevels = (players: Record<PlayerId, PlayerState>): Record<SkillId, number> => {
    const levels = SKILL_DEFINITIONS.reduce<Record<SkillId, number>>((acc, skill) => {
        acc[skill.id] = 0;
        return acc;
    }, {} as Record<SkillId, number>);

    Object.values(players).forEach((player) => {
        SKILL_DEFINITIONS.forEach((skill) => {
            const candidate = player.skills[skill.id]?.level ?? 0;
            if (candidate > levels[skill.id]) {
                levels[skill.id] = candidate;
            }
        });
    });

    return levels;
};

export const getQuestProgress = (
    quest: QuestDefinition,
    craftCounts: Record<ItemId, number>,
    skillLevels: Record<SkillId, number>
): QuestProgress => {
    if (quest.condition.type === "craft") {
        const current = craftCounts[quest.condition.itemId] ?? 0;
        const target = quest.condition.count;
        return {
            current,
            target,
            isComplete: current >= target
        };
    }

    const current = skillLevels[quest.condition.skillId] ?? 0;
    const target = quest.condition.level;
    return {
        current,
        target,
        isComplete: current >= target
    };
};

export const getQuestProgressLabel = (quest: QuestDefinition, progress: QuestProgress): string => {
    const current = Math.min(progress.current, progress.target);
    if (quest.condition.type === "craft") {
        return `Crafted ${current}/${progress.target}`;
    }
    return `Lv ${current}/${progress.target}`;
};
