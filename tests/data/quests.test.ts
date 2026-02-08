import { describe, expect, it } from "vitest";
import {
    QUEST_DEFINITIONS_BY_KIND,
    getQuestProgress,
    getQuestProgressLabel
} from "../../src/data/quests";
import { SKILL_DEFINITIONS } from "../../src/data/definitions";
import type { SkillId } from "../../src/core/types";

const findTutorialQuest = (predicate: (quest: typeof QUEST_DEFINITIONS_BY_KIND.tutorial[number]) => boolean) => {
    const quest = QUEST_DEFINITIONS_BY_KIND.tutorial.find(predicate);
    if (!quest) {
        throw new Error("Tutorial quest not found");
    }
    return quest;
};

const buildEmptySkillLevels = (): Record<SkillId, number> => {
    return SKILL_DEFINITIONS.reduce<Record<SkillId, number>>((acc, skill) => {
        acc[skill.id] = 0;
        return acc;
    }, {} as Record<SkillId, number>);
};

describe("quest progress", () => {
    it("tracks collect quests using global item counts", () => {
        const collectMeat = findTutorialQuest(
            (quest) => quest.condition.type === "collect" && !quest.condition.skillId
        );

        const progress = getQuestProgress(
            collectMeat,
            {},
            buildEmptySkillLevels(),
            { meat: 40 },
            {},
            {}
        );

        expect(progress).toEqual({ current: 40, target: 100, isComplete: false });
        expect(getQuestProgressLabel(collectMeat, progress)).toBe("Collected 40/100");
    });

    it("tracks collect quests scoped to a skill", () => {
        const cookFood = findTutorialQuest(
            (quest) => quest.condition.type === "collect" && quest.condition.skillId === "Cooking"
        );

        const progress = getQuestProgress(
            cookFood,
            {},
            buildEmptySkillLevels(),
            {},
            {},
            { Cooking: { food: 120 } }
        );

        expect(progress).toEqual({ current: 120, target: 100, isComplete: true });
        expect(getQuestProgressLabel(cookFood, progress)).toBe("Cooked 100/100");
    });

    it("tracks dungeon completion quests", () => {
        const dungeonQuest = findTutorialQuest(
            (quest) => quest.condition.type === "dungeon"
        );
        if (dungeonQuest.condition.type !== "dungeon") {
            throw new Error("Expected dungeon quest condition");
        }

        const progress = getQuestProgress(
            dungeonQuest,
            {},
            buildEmptySkillLevels(),
            {},
            { [dungeonQuest.condition.dungeonId]: 12 },
            {}
        );

        expect(progress).toEqual({ current: 12, target: 10, isComplete: true });
        expect(getQuestProgressLabel(dungeonQuest, progress)).toBe("Cleared 10/10");
    });

    it("tracks craft and skill quests", () => {
        const craftQuest = QUEST_DEFINITIONS_BY_KIND.craft[0];
        const skillQuest = QUEST_DEFINITIONS_BY_KIND.skill[0];
        const skillLevels = buildEmptySkillLevels();
        skillLevels[skillQuest.condition.skillId] = skillQuest.condition.level;

        const craftProgress = getQuestProgress(
            craftQuest,
            { [craftQuest.condition.itemId]: craftQuest.condition.count },
            buildEmptySkillLevels(),
            {},
            {},
            {}
        );
        const skillProgress = getQuestProgress(
            skillQuest,
            {},
            skillLevels,
            {},
            {},
            {}
        );

        expect(craftProgress.isComplete).toBe(true);
        expect(getQuestProgressLabel(craftQuest, craftProgress)).toBe(
            `Crafted ${craftQuest.condition.count}/${craftQuest.condition.count}`
        );

        expect(skillProgress.isComplete).toBe(true);
        expect(getQuestProgressLabel(skillQuest, skillProgress)).toBe(
            `Lv ${skillQuest.condition.level}/${skillQuest.condition.level}`
        );
    });
});
