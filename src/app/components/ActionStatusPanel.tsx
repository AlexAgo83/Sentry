import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";

type ActionStatusPanelProps = {
    activeSkillId: SkillId | "";
    activeSkillName: string;
    activeRecipeLabel: string;
    activeConsumptionLabel: string;
    activeProductionLabel: string;
    resourceHint: string | null;
    progressPercent: number;
    progressStyle: CSSProperties;
    staminaStyle: CSSProperties;
    skillStyle: CSSProperties;
    recipeStyle: CSSProperties;
    staminaPercent: number;
    skillPercent: number;
    recipePercent: number;
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
};

export const ActionStatusPanel = memo(({
    activeSkillId,
    activeSkillName,
    activeRecipeLabel,
    activeConsumptionLabel,
    activeProductionLabel,
    resourceHint,
    progressPercent,
    progressStyle,
    staminaStyle,
    skillStyle,
    recipeStyle,
    staminaPercent,
    skillPercent,
    recipePercent,
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
    canChangeAction
}: ActionStatusPanelProps) => (
    <section className="generic-panel ts-panel">
        <div className="ts-panel-header">
            <div className="ts-panel-heading">
                <h2 className="ts-panel-title">Action</h2>
            </div>
            <div className="ts-panel-actions ts-panel-actions-inline">
                <button
                    type="button"
                    className="ts-icon-button is-action ts-panel-action-button ts-focusable"
                    onClick={onChangeAction}
                    disabled={!canChangeAction}
                    aria-label="Change"
                >
                    Change
                </button>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onToggleCollapsed}
                    data-mobile-label={isCollapsed ? "+" : "-"}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                    <span className="ts-collapse-label">
                        {isCollapsed ? "Expand" : "Collapse"}
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
                        <span className="ts-resource-label">Consumes</span>
                        <span className="ts-resource-value">{activeConsumptionLabel}</span>
                    </div>
                    <div className="ts-resource-row">
                        <span className="ts-resource-label">Produces</span>
                        <span className="ts-resource-value">{activeProductionLabel}</span>
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
                <progress
                    className={`generic-field progress ts-progress-action${isStunned ? " is-stunned" : ""}`}
                    max={100}
                    value={progressPercent}
                />
                <div
                    className="generic-field panel progress-row ts-progress-row ts-progress-stamina"
                    style={staminaStyle}
                >
                    <span className="ts-progress-label">
                        Stamina {staminaCurrent}/{staminaMax}
                    </span>
                </div>
                <progress
                    className="generic-field progress ts-progress-stamina"
                    max={100}
                    value={staminaPercent}
                />
                <div
                    className="generic-field panel progress-row ts-progress-row ts-progress-skill"
                    style={skillStyle}
                >
                    <span className="ts-progress-label">
                        Skill Lv {activeSkillLevel} - XP {activeSkillXp}/{activeSkillXpNext}
                    </span>
                </div>
                <progress
                    className="generic-field progress ts-progress-skill"
                    max={100}
                    value={skillPercent}
                />
                <div
                    className="generic-field panel progress-row ts-progress-row ts-progress-recipe"
                    style={recipeStyle}
                >
                    <span className="ts-progress-label">
                        Recipe Lv {activeRecipeLevel} - XP {activeRecipeXp}/{activeRecipeXpNext}
                    </span>
                </div>
                <progress
                    className="generic-field progress ts-progress-recipe"
                    max={100}
                    value={recipePercent}
                />
            </>
        ) : null}
    </section>
));

ActionStatusPanel.displayName = "ActionStatusPanel";
