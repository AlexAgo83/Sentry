import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { ChangeIcon } from "../ui/changeIcon";
import { InterruptIcon } from "../ui/interruptIcon";
import { ItemIcon } from "../ui/itemIcon";

type ItemEntry = {
    id: string;
    name: string;
    amount: number;
};

type ActionStatusPanelProps = {
    activeSkillId: SkillId | "";
    activeSkillName: string;
    activeRecipeLabel: string;
    activeConsumptionLabel: string;
    activeProductionLabel: string;
    activeConsumptionEntries: ItemEntry[];
    activeProductionEntries: ItemEntry[];
    actionSpeedBonusLabel: string;
    actionDurationLabel: string;
    actionXpLabel: string;
    actionXpBonusLabel: string;
    resourceHint: string | null;
    progressPercent: number;
    progressStyle: CSSProperties;
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
    isStunned: boolean;
    skillIconColor: string;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    onChangeAction: () => void;
    canChangeAction: boolean;
    onInterruptAction: () => void;
    canInterruptAction: boolean;
};

export const ActionStatusPanel = memo(({
    activeSkillId,
    activeSkillName,
    activeRecipeLabel,
    activeConsumptionLabel,
    activeProductionLabel,
    activeConsumptionEntries,
    activeProductionEntries,
    actionSpeedBonusLabel,
    actionDurationLabel,
    actionXpLabel,
    actionXpBonusLabel,
    resourceHint,
    progressPercent,
    progressStyle,
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
    isStunned,
    skillIconColor,
    isCollapsed,
    onToggleCollapsed,
    onChangeAction,
    canChangeAction,
    onInterruptAction,
    canInterruptAction
}: ActionStatusPanelProps) => {
    const formatXp = (value: number): string => {
        if (!Number.isFinite(value)) {
            return "0";
        }
        return String(Math.round(value));
    };

    const renderItemSummary = (
        entries: ItemEntry[],
        fallbackLabel: string,
        tone: "consume" | "produce"
    ) => {
        if (entries.length === 0) {
            return fallbackLabel;
        }
        return (
            <span className="ts-item-inline-list">
                {entries.map((entry, index) => (
                    <span key={entry.id} className="ts-item-inline">
                        {entry.amount} {entry.name}
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
	                <button
	                    type="button"
	                    className="ts-collapse-button ts-focusable"
	                    onClick={onChangeAction}
	                    disabled={!canChangeAction}
	                    aria-label="Change"
	                    title="Change"
	                >
	                    <span className="ts-collapse-label">
	                        <ChangeIcon />
	                    </span>
	                </button>
	                <button
	                    type="button"
	                    className="ts-collapse-button ts-focusable"
	                    onClick={onInterruptAction}
	                    disabled={!canInterruptAction}
	                    aria-label="Interrupt"
	                    title="Interrupt"
	                >
	                    <span className="ts-collapse-label">
	                        <InterruptIcon />
	                    </span>
	                </button>
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
                        <SkillIcon skillId={activeSkillId} color={skillIconColor} />
                    </div>
                    <div className="ts-skill-copy">
                        <div className="ts-skill-label">Selected skill</div>
                        <div className="ts-skill-name">{activeSkillName}</div>
                    </div>
                </div>
                <div className="ts-resource-card">
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">Recipe</span>
                        <span className="ts-resource-value">{activeRecipeLabel}</span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">Action time</span>
                        <span className="ts-resource-value">{actionDurationLabel}</span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">Speed bonus</span>
                        <span className="ts-resource-value">{actionSpeedBonusLabel}</span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">XP per action</span>
                        <span className="ts-resource-value">{actionXpLabel}</span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">XP bonus</span>
                        <span className="ts-resource-value">{actionXpBonusLabel}</span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">Consumes</span>
                        <span className="ts-resource-value">
                            {renderItemSummary(activeConsumptionEntries, activeConsumptionLabel, "consume")}
                        </span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">Produces</span>
                        <span className="ts-resource-value">
                            {renderItemSummary(activeProductionEntries, activeProductionLabel, "produce")}
                        </span>
                    </div>
                    {resourceHint ? (
                        <div className="ts-resource-hint">{resourceHint}</div>
                    ) : null}
                </div>
                <div
                    className={`generic-field panel progress-row ts-progress-row ts-progress-action${isStunned ? " is-stunned" : ""}`}
                    style={progressStyle}
                >
                    <span className="ts-progress-label">
                        Progress {progressPercent.toFixed(1)}%
                    </span>
                </div>
                <div
                    className="generic-field panel progress-row ts-progress-row ts-progress-stamina"
                    style={staminaStyle}
                >
                    <span className="ts-progress-label">
                        Stamina {staminaCurrent}/{staminaMax}
                    </span>
                </div>
                <div
                    className="generic-field panel progress-row ts-progress-row ts-progress-skill"
                    style={skillStyle}
                >
                    <span className="ts-progress-label">
                        Skill Lv {activeSkillLevel} - XP {formatXp(activeSkillXp)}/{formatXp(activeSkillXpNext)}
                    </span>
                </div>
                <div
                    className="generic-field panel progress-row ts-progress-row ts-progress-recipe"
                    style={recipeStyle}
	                >
	                    <span className="ts-progress-label">
	                        Recipe Lv {activeRecipeLevel} - XP {formatXp(activeRecipeXp)}/{formatXp(activeRecipeXpNext)}
	                    </span>
	                </div>
	            </>
	        ) : null}
	    </section>
	    );
});

ActionStatusPanel.displayName = "ActionStatusPanel";
