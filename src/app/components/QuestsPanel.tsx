import { memo, useMemo } from "react";
import { CollapseIcon } from "../ui/collapseIcon";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";
import { usePersistedQuestFilters } from "../hooks/usePersistedQuestFilters";
import { QuestCompletedHideIcon, QuestCompletedShowIcon } from "../ui/questCompletedIcons";

export type QuestEntry = {
    id: string;
    title: string;
    subtitle: string;
    progressLabel: string;
    rewardGold: number;
    isCompleted: boolean;
};

type QuestsPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    completedCount: number;
    totalCount: number;
    tutorialQuests: QuestEntry[];
    skillQuests: QuestEntry[];
    craftQuests: QuestEntry[];
};

const QuestTile = ({ quest }: { quest: QuestEntry }) => {
    const rewardLabel = formatNumberCompact(quest.rewardGold);
    const rewardFullLabel = formatNumberFull(quest.rewardGold);
    const progressMatch = quest.progressLabel.match(/(\d+)\s*\/\s*(\d+)/);
    const progressValue = progressMatch ? Number(progressMatch[1]) : 0;
    const progressTotal = progressMatch ? Number(progressMatch[2]) : 0;
    const progressPercent = progressTotal > 0
        ? Math.min(100, Math.round((progressValue / progressTotal) * 100))
        : 0;
    return (
        <div className={`ts-shop-tile ts-quest-tile${quest.isCompleted ? " is-completed" : ""}`}>
            <div className="ts-quest-tile-header">
                <div className="ts-quest-tile-title">{quest.title}</div>
            </div>
            <div className="ts-quest-tile-reward-line" title={`${rewardFullLabel} gold`}>
                Reward: {rewardLabel} GOLD
            </div>
            <div className="ts-quest-tile-progress-block">
                <div className="ts-quest-tile-progress">
                    <span className="ts-quest-tile-progress-label">
                        {quest.isCompleted ? "Completed" : quest.progressLabel}
                    </span>
                    <span className="ts-quest-tile-progress-subtitle">{quest.subtitle}</span>
                </div>
                <div className="ts-quest-tile-bar" aria-hidden="true">
                    <span
                        className="ts-quest-tile-bar-fill"
                        style={{ width: `${quest.isCompleted ? 100 : progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export const QuestsPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    completedCount,
    totalCount,
    tutorialQuests,
    skillQuests,
    craftQuests
}: QuestsPanelProps) => {
    const counterLabel = `${completedCount}/${totalCount}`;
    const [questFilters, setQuestFilters] = usePersistedQuestFilters({ showCompleted: true });
    const showCompleted = questFilters.showCompleted;
    const visibleTutorialQuests = useMemo(
        () => (showCompleted ? tutorialQuests : tutorialQuests.filter((quest) => !quest.isCompleted)),
        [showCompleted, tutorialQuests]
    );
    const visibleSkillQuests = useMemo(
        () => (showCompleted ? skillQuests : skillQuests.filter((quest) => !quest.isCompleted)),
        [showCompleted, skillQuests]
    );
    const visibleCraftQuests = useMemo(
        () => (showCompleted ? craftQuests : craftQuests.filter((quest) => !quest.isCompleted)),
        [showCompleted, craftQuests]
    );

    return (
        <section className="generic-panel ts-panel ts-quests-panel">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Quests</h2>
                    <span className="ts-panel-counter">{counterLabel}</span>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className={`ts-icon-button ts-panel-action-button ts-focusable ts-quest-toggle${showCompleted ? " is-active" : ""}`}
                        onClick={() => setQuestFilters((prev) => ({ ...prev, showCompleted: !prev.showCompleted }))}
                        aria-pressed={showCompleted}
                        aria-label={showCompleted ? "Hide completed quests" : "Show completed quests"}
                        title={showCompleted ? "Hide completed quests" : "Show completed quests"}
                    >
                        <span className="ts-panel-action-icon" aria-hidden="true">
                            {showCompleted ? <QuestCompletedHideIcon /> : <QuestCompletedShowIcon />}
                        </span>
                        <span className="ts-panel-action-label">
                            Completed quests
                        </span>
                    </button>
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable"
                        onClick={onToggleCollapsed}
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <span className="ts-collapse-label">
                            <CollapseIcon isCollapsed={isCollapsed} />
                        </span>
                    </button>
                </div>
            </div>
            {!isCollapsed ? (
                <div className="ts-quests-body">
                    <div className="ts-quest-section">
                        <div className="ts-quest-section-title">Tutorial Quests</div>
                        <div className="ts-shop-grid ts-quest-grid">
                            {visibleTutorialQuests.map((quest) => (
                                <QuestTile key={quest.id} quest={quest} />
                            ))}
                        </div>
                    </div>
                    <div className="ts-quest-section">
                        <div className="ts-quest-section-title">Skill Quests</div>
                        <div className="ts-shop-grid ts-quest-grid">
                            {visibleSkillQuests.map((quest) => (
                                <QuestTile key={quest.id} quest={quest} />
                            ))}
                        </div>
                    </div>
                    <div className="ts-quest-section">
                        <div className="ts-quest-section-title">Craft Quests</div>
                        <div className="ts-shop-grid ts-quest-grid">
                            {visibleCraftQuests.map((quest) => (
                                <QuestTile key={quest.id} quest={quest} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
});

QuestsPanel.displayName = "QuestsPanel";
