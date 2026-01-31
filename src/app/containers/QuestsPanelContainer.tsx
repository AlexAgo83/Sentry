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
    completed: Record<string, boolean>
): QuestEntry[] => {
    const mapped = quests.map((quest) => {
        const progress = getQuestProgress(quest, craftCounts, skillLevels);
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
    const players = useGameStore((state) => state.players);

    const skillLevels = useMemo(() => getSharedSkillLevels(players), [players]);

    const skillEntries = useMemo(
        () => buildEntries(
            QUEST_DEFINITIONS_BY_KIND.skill,
            questsState.craftCounts,
            skillLevels,
            questsState.completed
        ),
        [questsState.craftCounts, questsState.completed, skillLevels]
    );

    const craftEntries = useMemo(
        () => buildEntries(
            QUEST_DEFINITIONS_BY_KIND.craft,
            questsState.craftCounts,
            skillLevels,
            questsState.completed
        ),
        [questsState.craftCounts, questsState.completed, skillLevels]
    );

    const totalCount = skillEntries.length + craftEntries.length;
    const completedCount = useMemo(() => (
        skillEntries.filter((quest) => quest.isCompleted).length
        + craftEntries.filter((quest) => quest.isCompleted).length
    ), [skillEntries, craftEntries]);

    return (
        <QuestsPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            completedCount={completedCount}
            totalCount={totalCount}
            skillQuests={skillEntries}
            craftQuests={craftEntries}
        />
    );
};
