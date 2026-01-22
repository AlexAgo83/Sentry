import { memo } from "react";
import type { PlayerState, SkillDefinition, SkillId, SkillState } from "../../core/types";
import { getRecipeUnlockLevel, getRecipesForSkill, isRecipeUnlocked, ITEM_DEFINITIONS } from "../../data/definitions";
import { StartActionIcon } from "../ui/startActionIcon";
import { InterruptIcon } from "../ui/interruptIcon";
import { BackIcon } from "../ui/backIcon";
import { SkillIcon } from "../ui/skillIcons";
import { getSkillIconColor } from "../ui/skillColors";
import { formatItemListEntries, getItemListEntries } from "../ui/itemFormatters";
import { ItemIcon } from "../ui/itemIcon";

type ActionSelectionScreenProps = {
    activePlayer: PlayerState;
    skills: SkillDefinition[];
    pendingSkillId: SkillId | "";
    pendingRecipeId: string;
    pendingSkill: SkillState | null;
    pendingSkillLabel: string;
    pendingRecipeLabel: string;
    pendingConsumptionLabel: string;
    pendingProductionLabel: string;
    pendingActionDurationLabel: string;
    pendingActionXpLabel: string;
    missingItemsLabel: string;
    canStartAction: boolean;
    canStopAction: boolean;
    onSkillSelect: (skillId: SkillId | "") => void;
    onRecipeSelect: (recipeId: string) => void;
    onStartAction: () => void;
    onStopAction: () => void;
    onBack: () => void;
};

export const ActionSelectionScreen = memo(({
    activePlayer,
    skills,
    pendingSkillId,
    pendingRecipeId,
    pendingSkill,
    pendingSkillLabel,
    pendingRecipeLabel,
    pendingConsumptionLabel,
    pendingProductionLabel,
    pendingActionDurationLabel,
    pendingActionXpLabel,
    missingItemsLabel,
    canStartAction,
    canStopAction,
    onSkillSelect,
    onRecipeSelect,
    onStartAction,
    onStopAction,
    onBack
}: ActionSelectionScreenProps) => (
    <section className="generic-panel ts-panel">
        <div className="ts-panel-header">
            <div className="ts-panel-heading">
                <h2 className="ts-panel-title">Action</h2>
            </div>
            <div className="ts-panel-actions ts-panel-actions-inline">
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onStartAction}
                    disabled={!canStartAction}
                    aria-label="Start action"
                    title="Start action"
                >
                    <span className="ts-collapse-label">
                        <StartActionIcon />
                    </span>
                </button>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onStopAction}
                    disabled={!canStopAction}
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
                    onClick={onBack}
                    aria-label="Back"
                    title="Back"
                >
                    <span className="ts-collapse-label">
                        <BackIcon />
                    </span>
                </button>
            </div>
        </div>
        <div className="ts-action-selection-layout">
            <div className="ts-action-selection-column">
                <fieldset className="ts-picker">
                    <legend className="ts-picker-legend">Select skill</legend>
                    <div className="ts-skill-picker" role="radiogroup" aria-label="Select skill">
                        <label className="ts-choice">
                            <input
                                className="ts-choice-input"
                                type="radio"
                                name="pending-skill"
                                value=""
                                checked={pendingSkillId === ""}
                                onChange={() => onSkillSelect("")}
                            />
                            <div className="ts-choice-card ts-skill-choice">
                                <div
                                    className="ts-choice-icon"
                                    style={{ borderColor: getSkillIconColor("") }}
                                    aria-hidden="true"
                                >
                                    <SkillIcon skillId="" color={getSkillIconColor("")} />
                                </div>
                                <div className="ts-choice-copy">
                                    <div className="ts-choice-title">Choose a path</div>
                                    <div className="ts-choice-subtitle">No skill selected</div>
                                </div>
                            </div>
                        </label>
                        {skills.map((skill) => {
                            const skillLevel = activePlayer?.skills[skill.id]?.level ?? 0;
                            const skillColor = getSkillIconColor(skill.id);
                            return (
                                <label key={skill.id} className="ts-choice">
                                    <input
                                        className="ts-choice-input"
                                        type="radio"
                                        name="pending-skill"
                                        value={skill.id}
                                        checked={pendingSkillId === skill.id}
                                        onChange={() => onSkillSelect(skill.id)}
                                    />
                                    <div className="ts-choice-card ts-skill-choice">
                                        <div className="ts-choice-icon" style={{ borderColor: skillColor }} aria-hidden="true">
                                            <SkillIcon skillId={skill.id} color={skillColor} />
                                        </div>
                                        <div className="ts-choice-copy">
                                            <div className="ts-choice-title">{skill.name}</div>
                                            <div className="ts-choice-subtitle">Skill level</div>
                                        </div>
                                        <div className="ts-choice-meta">
                                            <div className="ts-choice-level">Lv {skillLevel}</div>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            </div>

            <div className="ts-action-selection-column">
                <fieldset className="ts-picker">
                    <legend className="ts-picker-legend">Select recipe</legend>
                    {pendingSkill && pendingSkillId ? (
                        <div className="ts-recipe-picker" role="radiogroup" aria-label="Select recipe">
                            {getRecipesForSkill(pendingSkillId as SkillId)
                                .map((recipeDef, index) => ({
                                    recipeDef,
                                    index,
                                    unlockLevel: getRecipeUnlockLevel(recipeDef)
                                }))
                                .sort((a, b) => (a.unlockLevel - b.unlockLevel) || (a.index - b.index))
                                .map(({ recipeDef, unlockLevel }) => {
                                const recipeState = pendingSkill.recipes[recipeDef.id];
                                const recipeLevel = recipeState?.level ?? 0;
                                const recipeXp = recipeState?.xp ?? 0;
                                const recipeXpNext = recipeState?.xpNext ?? 0;
                                const unlocked = isRecipeUnlocked(recipeDef, pendingSkill.level);
                                const recipeXpLabel = `XP ${Number.isFinite(recipeXp) ? Math.round(recipeXp) : 0}/${Number.isFinite(recipeXpNext) ? Math.round(recipeXpNext) : 0}`;
                                const consumptionEntries = getItemListEntries(ITEM_DEFINITIONS, recipeDef.itemCosts);
                                const productionEntries = getItemListEntries(ITEM_DEFINITIONS, recipeDef.itemRewards);
                                const consumptionLabel = consumptionEntries.length > 0
                                    ? formatItemListEntries(consumptionEntries)
                                    : "None";
                                const productionLabel = productionEntries.length > 0
                                    ? formatItemListEntries(productionEntries)
                                    : "None";
                                return (
                                    <label key={recipeDef.id} className="ts-choice">
                                        <input
                                            className="ts-choice-input"
                                            type="radio"
                                            name="pending-recipe"
                                            value={recipeDef.id}
                                            checked={pendingRecipeId === recipeDef.id}
                                            disabled={!unlocked}
                                            onChange={() => onRecipeSelect(recipeDef.id)}
                                        />
                                        <div className="ts-choice-card ts-recipe-choice">
                                            <div className="ts-choice-copy">
                                                <div className="ts-choice-title">{recipeDef.name} - Lv {recipeLevel}</div>
                                                {!unlocked ? (
                                                    <div className="ts-choice-subtitle">Unlocks at Lv {unlockLevel}</div>
                                                ) : (
                                                    <div className="ts-choice-subtitle">{recipeXpLabel}</div>
                                                )}
                                                <div className="ts-choice-details" aria-hidden="true">
                                                    <div className="ts-choice-detail-row">
                                                        <span className="ts-choice-detail-label">Consumes</span>
                                                        <span className="ts-choice-detail-value">
                                                            {consumptionEntries.length > 0 ? (
                                                                <span className="ts-item-inline-list">
                                                                    {consumptionEntries.map((entry, index) => (
                                                                        <span key={entry.id} className="ts-item-inline">
                                                                            {entry.amount} {entry.name}
                                                                            <ItemIcon itemId={entry.id} tone="consume" />
                                                                            {index < consumptionEntries.length - 1 ? ", " : null}
                                                                        </span>
                                                                    ))}
                                                                </span>
                                                            ) : consumptionLabel}
                                                        </span>
                                                    </div>
                                                    <div className="ts-choice-detail-row">
                                                        <span className="ts-choice-detail-label">Produces</span>
                                                        <span className="ts-choice-detail-value">
                                                            {productionEntries.length > 0 ? (
                                                                <span className="ts-item-inline-list">
                                                                    {productionEntries.map((entry, index) => (
                                                                        <span key={entry.id} className="ts-item-inline">
                                                                            {entry.amount} {entry.name}
                                                                            <ItemIcon itemId={entry.id} tone="produce" />
                                                                            {index < productionEntries.length - 1 ? ", " : null}
                                                                        </span>
                                                                    ))}
                                                                </span>
                                                            ) : productionLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="ts-picker-empty">Choose a skill to see recipes.</div>
                    )}
                </fieldset>
            </div>
        </div>
        <div className="ts-action-selection-summary-panel">
            <div className="ts-action-summary">
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">Action</span>
                    <span className="ts-action-summary-value">{pendingSkillLabel}</span>
                </div>
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">Recipe</span>
                    <span className="ts-action-summary-value">{pendingRecipeLabel}</span>
                </div>
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">Action time</span>
                    <span className="ts-action-summary-value">{pendingActionDurationLabel}</span>
                </div>
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">XP per action</span>
                    <span className="ts-action-summary-value">{pendingActionXpLabel}</span>
                </div>
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">Consumes</span>
                    <span className="ts-action-summary-value">{pendingConsumptionLabel}</span>
                </div>
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">Produces</span>
                    <span className="ts-action-summary-value">{pendingProductionLabel}</span>
                </div>
            </div>
            {missingItemsLabel ? (
                <div className="ts-missing-hint">{missingItemsLabel}</div>
            ) : null}
        </div>
    </section>
));

ActionSelectionScreen.displayName = "ActionSelectionScreen";
