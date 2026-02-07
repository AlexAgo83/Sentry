import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { ChangeIcon } from "../ui/changeIcon";
import { InterruptIcon } from "../ui/interruptIcon";
import { ItemIcon } from "../ui/itemIcon";
import { TabIcon } from "../ui/tabIcons";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";

type ItemEntry = {
    id: string;
    name: string;
    amount: number;
};

type ActionStatusPanelProps = {
    activeSkillId: SkillId | "";
    displaySkillId?: SkillId | "";
    activeSkillName: string;
    activeRecipeLabel: string;
    activeConsumptionLabel: string;
    activeProductionLabel: string;
    activeConsumptionEntries: ItemEntry[];
    activeProductionEntries: ItemEntry[];
    actionSpeedBonusLabel: string;
    actionSpeedBonusTooltip: string;
    actionDurationLabel: string;
    actionXpLabel: string;
    actionXpBonusLabel: string;
    actionXpBonusTooltip: string;
    stunTimeLabel: string | null;
    resourceHint: string | null;
    staminaStyle: CSSProperties;
    skillStyle: CSSProperties;
    recipeStyle: CSSProperties;
    staminaCurrent: number;
    staminaMax: number;
    activeSkillLevel: number;
    activeSkillXp: number;
    activeSkillXpNext: number;
    activeRecipeLevel: number;
    activeRecipeXp: number;
    activeRecipeXpNext: number;
    activeSkillMax: number;
    activeRecipeMax: number;
    skillIconColor: string;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    onChangeAction: () => void;
    canChangeAction: boolean;
    onInterruptAction: () => void;
    canInterruptAction: boolean;
    showChangeAction?: boolean;
    showInterruptAction?: boolean;
    showDungeonShortcut?: boolean;
    onOpenDungeon?: () => void;
};

export const ActionStatusPanel = memo(({
    activeSkillId,
    displaySkillId = "",
    activeSkillName,
    activeRecipeLabel,
    activeConsumptionLabel,
    activeProductionLabel,
    activeConsumptionEntries,
    activeProductionEntries,
    actionSpeedBonusLabel,
    actionSpeedBonusTooltip,
    actionDurationLabel,
    actionXpLabel,
    actionXpBonusLabel,
    actionXpBonusTooltip,
    stunTimeLabel,
    resourceHint,
    staminaStyle,
    skillStyle,
    recipeStyle,
    staminaCurrent,
    staminaMax,
    activeSkillLevel,
    activeSkillXp,
    activeSkillXpNext,
    activeRecipeLevel,
    activeRecipeXp,
    activeRecipeXpNext,
    activeSkillMax,
    activeRecipeMax,
    skillIconColor,
    isCollapsed,
    onToggleCollapsed,
    onChangeAction,
    canChangeAction,
    onInterruptAction,
    canInterruptAction,
    showChangeAction = true,
    showInterruptAction = true,
    showDungeonShortcut = false,
    onOpenDungeon
}: ActionStatusPanelProps) => {
    const hasActiveAction = Boolean(activeSkillId);
    const resolvedDisplaySkillId = displaySkillId || activeSkillId;
    const canShowDungeonShortcut = showDungeonShortcut && typeof onOpenDungeon === "function";
    const changeActionClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-change",
        canChangeAction ? (hasActiveAction ? "is-ready-active" : "is-ready-empty") : ""
    ].filter(Boolean).join(" ");
    const formatXp = (value: number): string => {
        if (!Number.isFinite(value)) {
            return "0";
        }
        return String(Math.round(value));
    };

    const formatSummaryValue = (value: string | null | undefined): string => {
        if (!value || value === "None") {
            return "-";
        }
        return value;
    };

    const renderItemSummary = (
        entries: ItemEntry[],
        fallbackLabel: string,
        tone: "consume" | "produce"
    ) => {
        if (entries.length === 0) {
            return fallbackLabel;
        }
        const fullLabel = entries.map((entry) => `${formatNumberFull(entry.amount)} ${entry.name}`).join(", ");
        return (
            <span className="ts-item-inline-list" title={fullLabel}>
                {entries.map((entry, index) => (
                    <span key={entry.id} className="ts-item-inline">
                        {formatNumberCompact(entry.amount)} {entry.name}
                        <ItemIcon itemId={entry.id} tone={tone} />
                        {index < entries.length - 1 ? ", " : null}
                    </span>
                ))}
            </span>
        );
    };

    return (
	    <section className="generic-panel ts-panel">
	        <div className="ts-panel-header">
	            <div className="ts-panel-heading">
	                <h2 className="ts-panel-title">Action</h2>
	            </div>
	            <div className="ts-panel-actions ts-panel-actions-inline">
                    {showChangeAction ? (
                        <button
                            type="button"
                            className={`${changeActionClassName} ts-action-button`}
                            onClick={onChangeAction}
                            disabled={!canChangeAction}
                            aria-label="Change"
                            title="Change"
                        >
                            <span className="ts-collapse-label">
                                <ChangeIcon />
                            </span>
                            <span className="ts-action-button-label">Change</span>
                        </button>
                    ) : null}
                    {canShowDungeonShortcut ? (
                        <button
                            type="button"
                            className="ts-collapse-button ts-focusable ts-action-dungeon ts-action-button"
                            onClick={onOpenDungeon}
                            aria-label="Dungeon"
                            title="Dungeon"
                        >
                            <span className="ts-collapse-label">
                                <TabIcon kind="dungeon" />
                            </span>
                            <span className="ts-action-button-label">Dungeon</span>
                        </button>
                    ) : showInterruptAction ? (
                        <button
                            type="button"
                            className={`ts-collapse-button ts-focusable ts-action-stop ts-action-button${canInterruptAction ? " is-ready-stop" : ""}`}
                            onClick={onInterruptAction}
                            disabled={!canInterruptAction}
                            aria-label="Interrupt"
                            title="Interrupt"
                        >
                            <span className="ts-collapse-label">
                                <InterruptIcon />
                            </span>
                            <span className="ts-action-button-label">Interrupt</span>
                        </button>
                    ) : null}
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
        </div>
        {!isCollapsed ? (
            <>
                <div className="ts-skill-card">
                    <div className="ts-skill-icon" style={{ borderColor: skillIconColor }} aria-hidden="true">
                        <SkillIcon skillId={resolvedDisplaySkillId} color={skillIconColor} />
                    </div>
                    <div className="ts-skill-copy">
                        <div className="ts-skill-label">Selected skill</div>
                        <div className="ts-skill-name">{activeSkillName}</div>
                    </div>
                </div>
                {hasActiveAction ? (
                    <>
                        <div className="ts-action-summary">
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Action</span>
                                <span className="ts-action-summary-value">{formatSummaryValue(activeSkillName)}</span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Recipe</span>
                                <span className="ts-action-summary-value">{formatSummaryValue(activeRecipeLabel)}</span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Action time</span>
                                <span className="ts-action-summary-value">{formatSummaryValue(actionDurationLabel)}</span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Speed bonus</span>
                                <span className="ts-action-summary-value" title={actionSpeedBonusTooltip}>
                                    {formatSummaryValue(actionSpeedBonusLabel)}
                                </span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">XP per action</span>
                                <span className="ts-action-summary-value">{formatSummaryValue(actionXpLabel)}</span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">XP bonus</span>
                                <span className="ts-action-summary-value" title={actionXpBonusTooltip}>
                                    {formatSummaryValue(actionXpBonusLabel)}
                                </span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Consumes</span>
                                <span className="ts-action-summary-value">
                                    {renderItemSummary(
                                        activeConsumptionEntries,
                                        formatSummaryValue(activeConsumptionLabel),
                                        "consume"
                                    )}
                                </span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Produces</span>
                                <span className="ts-action-summary-value">
                                    {renderItemSummary(
                                        activeProductionEntries,
                                        formatSummaryValue(activeProductionLabel),
                                        "produce"
                                    )}
                                </span>
                            </div>
                            <div className="ts-action-summary-row">
                                <span className="ts-action-summary-label">Stun time</span>
                                <span className="ts-action-summary-value">{formatSummaryValue(stunTimeLabel)}</span>
                            </div>
                            {resourceHint ? (
                                <div className="ts-resource-hint">{resourceHint}</div>
                            ) : null}
                        </div>
                        <div
                            className="generic-field panel progress-row ts-progress-row ts-progress-stamina"
                            style={staminaStyle}
                        >
                            <span className="ts-progress-label">Stamina</span>
                            <span className="ts-progress-value">{staminaCurrent}/{staminaMax}</span>
                        </div>
                        <div
                            className="generic-field panel progress-row ts-progress-row ts-progress-skill"
                            style={skillStyle}
                        >
                            <span className="ts-progress-label">Skill Lv {activeSkillLevel}/{activeSkillMax}</span>
                            <span className="ts-progress-value">XP {formatXp(activeSkillXp)}/{formatXp(activeSkillXpNext)}</span>
                        </div>
                        <div
                            className="generic-field panel progress-row ts-progress-row ts-progress-recipe"
                            style={recipeStyle}
                        >
                            <span className="ts-progress-label">Recipe Lv {activeRecipeLevel}/{activeRecipeMax}</span>
                            <span className="ts-progress-value">XP {formatXp(activeRecipeXp)}/{formatXp(activeRecipeXpNext)}</span>
                        </div>
                    </>
                ) : null}
            </>
	        ) : null}
	    </section>
	    );
});

ActionStatusPanel.displayName = "ActionStatusPanel";
