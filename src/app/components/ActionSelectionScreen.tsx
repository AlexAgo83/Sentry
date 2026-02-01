import { memo, type CSSProperties } from "react";
import type { PlayerState, SkillDefinition, SkillId, SkillState } from "../../core/types";
import { getRecipeUnlockLevel, getRecipesForSkill, isRecipeUnlocked, ITEM_DEFINITIONS } from "../../data/definitions";
import { StartActionIcon } from "../ui/startActionIcon";
import { InterruptIcon } from "../ui/interruptIcon";
import { BackIcon } from "../ui/backIcon";
import { SkillIcon } from "../ui/skillIcons";
import { getSkillIconColor } from "../ui/skillColors";
import { formatItemListEntries, formatItemListEntriesFull, getItemListEntries } from "../ui/itemFormatters";
import { ItemIcon } from "../ui/itemIcon";
import { formatNumberCompact } from "../ui/numberFormatters";

type ItemEntry = {
    id: string;
    name: string;
    amount: number;
};

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
    pendingConsumptionEntries: ItemEntry[];
    pendingProductionEntries: ItemEntry[];
    pendingSpeedBonusLabel: string;
    pendingSpeedBonusTooltip: string;
    pendingActionDurationLabel: string;
    pendingActionXpLabel: string;
    pendingXpBonusLabel: string;
    pendingXpBonusTooltip: string;
    pendingStunTimeLabel: string | null;
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
    pendingConsumptionEntries,
    pendingProductionEntries,
    pendingSpeedBonusLabel,
    pendingSpeedBonusTooltip,
    pendingActionDurationLabel,
    pendingActionXpLabel,
    pendingXpBonusLabel,
    pendingXpBonusTooltip,
    pendingStunTimeLabel,
    missingItemsLabel,
    canStartAction,
    canStopAction,
    onSkillSelect,
    onRecipeSelect,
    onStartAction,
    onStopAction,
    onBack
}: ActionSelectionScreenProps) => {
    const currentActionId = activePlayer.selectedActionId ?? "";
    const currentRecipeId = currentActionId ? activePlayer.skills[currentActionId]?.selectedRecipeId ?? "" : "";
    const isSameRecipeSelected = Boolean(
        pendingSkillId &&
        pendingRecipeId &&
        pendingSkillId === currentActionId &&
        pendingRecipeId === currentRecipeId
    );
    const startActionClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-start",
        canStartAction ? (isSameRecipeSelected ? "is-ready-same" : "is-ready-new") : ""
    ].filter(Boolean).join(" ");
    const renderItemSummary = (
        entries: ItemEntry[],
        fallbackLabel: string,
        tone: "consume" | "produce"
    ) => {
        if (entries.length === 0) {
            return fallbackLabel;
        }
        const fullLabel = formatItemListEntriesFull(entries);
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

    const getSkillProgressStyle = (skillId: SkillId | ""): CSSProperties => {
        if (!skillId) {
            return {
                "--ts-skill-progress": "0%",
                "--ts-skill-progress-color": "rgba(93, 217, 193, 0.12)"
            } as CSSProperties;
        }
        const state = activePlayer.skills[skillId];
        if (!state) {
            return {};
        }
        const progress = state.maxLevel > 0 && state.level >= state.maxLevel
            ? 1
            : state.xpNext > 0
                ? state.xp / state.xpNext
                : 0;
        const percent = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
        const color = getSkillIconColor(skillId);
        const progressColor = color.startsWith("#") && color.length === 7
            ? `${color}33`
            : "rgba(93, 217, 193, 0.2)";
        return {
            "--ts-skill-progress": percent,
            "--ts-skill-progress-color": progressColor
        } as CSSProperties;
    };

    const getRecipeProgressStyle = (xp: number, xpNext: number, isUnlocked: boolean): CSSProperties => {
        if (!isUnlocked) {
            return {
                "--ts-recipe-progress": "0%",
                "--ts-recipe-progress-color": "rgba(93, 217, 193, 0.12)"
            } as CSSProperties;
        }
        const progress = xpNext > 0 ? xp / xpNext : 0;
        const percent = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
        const color = getSkillIconColor(pendingSkillId as SkillId);
        const progressColor = color.startsWith("#") && color.length === 7
            ? `${color}33`
            : "rgba(93, 217, 193, 0.2)";
        return {
            "--ts-recipe-progress": percent,
            "--ts-recipe-progress-color": progressColor
        } as CSSProperties;
    };

    return (
        <section className="generic-panel ts-panel ts-action-selection-panel">
        <div className="ts-panel-header">
            <div className="ts-panel-heading">
                <h2 className="ts-panel-title">Action</h2>
            </div>
            <div className="ts-panel-actions ts-panel-actions-inline">
                <button
                    type="button"
                    className={`${startActionClassName} ts-action-button`}
                    onClick={onStartAction}
                    disabled={!canStartAction}
                    aria-label="Start action"
                    title="Start action"
                >
                    <span className="ts-collapse-label">
                        <StartActionIcon />
                    </span>
                    <span className="ts-action-button-label">Start</span>
                </button>
                <button
                    type="button"
                    className={`ts-collapse-button ts-focusable ts-action-stop ts-action-button${canStopAction ? " is-ready-stop" : ""}`}
                    onClick={onStopAction}
                    disabled={!canStopAction}
                    aria-label="Interrupt"
                    title="Interrupt"
                >
                    <span className="ts-collapse-label">
                        <InterruptIcon />
                    </span>
                    <span className="ts-action-button-label">Interrupt</span>
                </button>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable ts-action-button"
                    onClick={onBack}
                    aria-label="Back"
                    title="Back"
                >
                    <span className="ts-collapse-label">
                        <BackIcon />
                    </span>
                    <span className="ts-action-button-label">Back</span>
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
                            <div className="ts-choice-card ts-skill-choice" style={getSkillProgressStyle("")}>
                                <div className="ts-choice-icon" aria-hidden="true">
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
                            const skillXp = activePlayer?.skills[skill.id]?.xp ?? 0;
                            const skillXpNext = activePlayer?.skills[skill.id]?.xpNext ?? 0;
                            const skillColor = getSkillIconColor(skill.id);
                            const xpCurrent = Number.isFinite(skillXp) ? Math.round(skillXp) : 0;
                            const xpNextValue = Number.isFinite(skillXpNext) ? Math.round(skillXpNext) : 0;
                            const xpLabel = `XP ${xpCurrent}/${xpNextValue}`;
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
                                    <div className="ts-choice-card ts-skill-choice" style={getSkillProgressStyle(skill.id)}>
                                        <div className="ts-choice-icon" aria-hidden="true">
                                            <SkillIcon skillId={skill.id} color={skillColor} />
                                        </div>
                                        <div className="ts-choice-copy">
                                            <div className="ts-choice-title">{skill.name}</div>
                                        </div>
                                        <div className="ts-choice-meta">
                                            <div className="ts-choice-level">Lv {skillLevel}</div>
                                            <div className="ts-choice-xp">{xpLabel}</div>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            </div>

            <div className="ts-action-selection-column">
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
                            <span className="ts-action-summary-label">Speed bonus</span>
                            <span className="ts-action-summary-value" title={pendingSpeedBonusTooltip}>
                                {pendingSpeedBonusLabel}
                            </span>
                        </div>
                        <div className="ts-action-summary-row">
                            <span className="ts-action-summary-label">XP per action</span>
                            <span className="ts-action-summary-value">{pendingActionXpLabel}</span>
                        </div>
                        <div className="ts-action-summary-row">
                            <span className="ts-action-summary-label">XP bonus</span>
                            <span className="ts-action-summary-value" title={pendingXpBonusTooltip}>
                                {pendingXpBonusLabel}
                            </span>
                        </div>
                        <div className="ts-action-summary-row">
                            <span className="ts-action-summary-label">Stun time</span>
                            <span className="ts-action-summary-value">{pendingStunTimeLabel ?? "None"}</span>
                        </div>
                        <div className="ts-action-summary-row ts-action-summary-row--wide">
                            <span className="ts-action-summary-label">Consumes</span>
                            <span className="ts-action-summary-value">
                                {renderItemSummary(pendingConsumptionEntries, pendingConsumptionLabel, "consume")}
                            </span>
                        </div>
                        <div className="ts-action-summary-row ts-action-summary-row--wide">
                            <span className="ts-action-summary-label">Produces</span>
                            <span className="ts-action-summary-value">
                                {renderItemSummary(pendingProductionEntries, pendingProductionLabel, "produce")}
                            </span>
                        </div>
                    </div>
                    {missingItemsLabel ? (
                        <div className="ts-missing-hint">{missingItemsLabel}</div>
                    ) : null}
                </div>
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
                                const consumptionFullLabel = consumptionEntries.length > 0
                                    ? formatItemListEntriesFull(consumptionEntries)
                                    : consumptionLabel;
                                const productionFullLabel = productionEntries.length > 0
                                    ? formatItemListEntriesFull(productionEntries)
                                    : productionLabel;
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
                                        <div
                                            className="ts-choice-card ts-recipe-choice"
                                            style={getRecipeProgressStyle(recipeXp, recipeXpNext, unlocked)}
                                        >
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
                                                                <span className="ts-item-inline-list" title={consumptionFullLabel}>
                                                                    {consumptionEntries.map((entry, index) => (
                                                                        <span key={entry.id} className="ts-item-inline">
                                                                            {formatNumberCompact(entry.amount)} {entry.name}
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
                                                                <span className="ts-item-inline-list" title={productionFullLabel}>
                                                                    {productionEntries.map((entry, index) => (
                                                                        <span key={entry.id} className="ts-item-inline">
                                                                            {formatNumberCompact(entry.amount)} {entry.name}
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
                        <div className="ts-picker-empty ts-picker-empty--pulse">Choose a skill to see recipes.</div>
                    )}
                </fieldset>
            </div>
        </div>
    </section>
    );
});

ActionSelectionScreen.displayName = "ActionSelectionScreen";
