import { memo } from "react";
import { CollapseIcon } from "../ui/collapseIcon";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";

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
    skillQuests: QuestEntry[];
    craftQuests: QuestEntry[];
};

const QuestTile = ({ quest }: { quest: QuestEntry }) => {
    const rewardLabel = formatNumberCompact(quest.rewardGold);
    const rewardFullLabel = formatNumberFull(quest.rewardGold);
    return (
        <div className={`ts-shop-tile ts-quest-tile${quest.isCompleted ? " is-completed" : ""}`}>
            <div className="ts-shop-tile-title">{quest.title}</div>
            <div className="ts-shop-tile-subtitle">{quest.subtitle}</div>
            <div className="ts-shop-tile-meta">{quest.progressLabel}</div>
            <div className="ts-shop-tile-footer">
                <span className="ts-shop-tile-price" title={`${rewardFullLabel} gold`}>
                    {rewardLabel} gold
                </span>
                {quest.isCompleted ? (
                    <span className="ts-quest-complete" aria-label="Completed">Completed</span>
                ) : null}
            </div>
        </div>
    );
};

export const QuestsPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    completedCount,
    totalCount,
    skillQuests,
    craftQuests
}: QuestsPanelProps) => {
    const counterLabel = `${completedCount}/${totalCount}`;

    return (
        <section className="generic-panel ts-panel ts-quests-panel">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Quests</h2>
                    <span className="ts-panel-counter">{counterLabel}</span>
                </div>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onToggleCollapsed}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                    <span className="ts-collapse-label">
                        <CollapseIcon isCollapsed={isCollapsed} />
                    </span>
                </button>
            </div>
            {!isCollapsed ? (
                <div className="ts-quests-body">
                    <div className="ts-quest-section">
                        <div className="ts-quest-section-title">Skill Quests</div>
                        <div className="ts-shop-grid ts-quest-grid">
                            {skillQuests.map((quest) => (
                                <QuestTile key={quest.id} quest={quest} />
                            ))}
                        </div>
                    </div>
                    <div className="ts-quest-section">
                        <div className="ts-quest-section-title">Craft Quests</div>
                        <div className="ts-shop-grid ts-quest-grid">
                            {craftQuests.map((quest) => (
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
