import { useMemo } from "react";
import { QuestsPanel, type QuestEntry } from "../components/QuestsPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { useGameStore } from "../hooks/useGameStore";
import {
    type QuestDefinition,
    QUEST_DEFINITIONS_BY_KIND,
    getQuestProgress,
    getQuestProgressLabel,
    getSharedSkillLevels
} from "../../data/quests";

const buildEntries = (
    quests: QuestDefinition[],
    craftCounts: Record<string, number>,
    skillLevels: Record<string, number>,
    itemCounts: Record<string, number>,
    dungeonCompletionCounts: Record<string, number>,
    itemCountsBySkill: Record<string, Record<string, number>>,
    completed: Record<string, boolean>
): QuestEntry[] => {
    const mapped = quests.map((quest) => {
        const progress = getQuestProgress(
            quest,
            craftCounts,
            skillLevels,
            itemCounts,
            dungeonCompletionCounts,
            itemCountsBySkill
        );
        return {
            id: quest.id,
            title: quest.title,
            subtitle: quest.subtitle,
            progressLabel: getQuestProgressLabel(quest, progress),
            rewardGold: quest.rewardGold,
            isCompleted: Boolean(completed[quest.id])
        };
    });
    const active = mapped.filter((quest) => !quest.isCompleted);
    const done = mapped.filter((quest) => quest.isCompleted);
    return [...active, ...done];
};

export const QuestsPanelContainer = () => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("quests", false);
    const questsState = useGameStore((state) => state.quests);
    const dungeonCompletionCounts = useGameStore((state) => state.dungeon.completionCounts);
    const players = useGameStore((state) => state.players);

    const skillLevels = useMemo(() => getSharedSkillLevels(players), [players]);

    const skillEntries = useMemo(
        () => buildEntries(
            QUEST_DEFINITIONS_BY_KIND.skill,
            questsState.craftCounts,
            skillLevels,
            questsState.itemCounts,
            dungeonCompletionCounts,
            questsState.itemCountsBySkill as Record<string, Record<string, number>>,
            questsState.completed
        ),
        [questsState.craftCounts, questsState.completed, questsState.itemCounts, questsState.itemCountsBySkill, dungeonCompletionCounts, skillLevels]
    );

    const craftEntries = useMemo(
        () => buildEntries(
            QUEST_DEFINITIONS_BY_KIND.craft,
            questsState.craftCounts,
            skillLevels,
            questsState.itemCounts,
            dungeonCompletionCounts,
            questsState.itemCountsBySkill as Record<string, Record<string, number>>,
            questsState.completed
        ),
        [questsState.craftCounts, questsState.completed, questsState.itemCounts, questsState.itemCountsBySkill, dungeonCompletionCounts, skillLevels]
    );

    const tutorialEntries = useMemo(
        () => buildEntries(
            QUEST_DEFINITIONS_BY_KIND.tutorial,
            questsState.craftCounts,
            skillLevels,
            questsState.itemCounts,
            dungeonCompletionCounts,
            questsState.itemCountsBySkill as Record<string, Record<string, number>>,
            questsState.completed
        ),
        [questsState.craftCounts, questsState.completed, questsState.itemCounts, questsState.itemCountsBySkill, dungeonCompletionCounts, skillLevels]
    );

    const totalCount = tutorialEntries.length + skillEntries.length + craftEntries.length;
    const completedCount = useMemo(() => (
        tutorialEntries.filter((quest) => quest.isCompleted).length
        + skillEntries.filter((quest) => quest.isCompleted).length
        + craftEntries.filter((quest) => quest.isCompleted).length
    ), [tutorialEntries, skillEntries, craftEntries]);

    return (
        <QuestsPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            completedCount={completedCount}
            totalCount={totalCount}
            tutorialQuests={tutorialEntries}
            skillQuests={skillEntries}
            craftQuests={craftEntries}
        />
    );
};
