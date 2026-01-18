import type { ChangeEvent } from "react";
import { memo } from "react";
import type { PlayerState, SkillDefinition, SkillId, SkillState } from "../../core/types";
import { getRecipeUnlockLevel, getRecipesForSkill, isRecipeUnlocked } from "../../data/definitions";
import { ModalShell } from "./ModalShell";

type LoadoutModalProps = {
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
    onSkillChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onRecipeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onStartAction: () => void;
    onStopAction: () => void;
    onClose: () => void;
};

export const LoadoutModal = memo(({
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
    onSkillChange,
    onRecipeChange,
    onStartAction,
    onStopAction,
    onClose
}: LoadoutModalProps) => (
    <ModalShell kicker="Loadout" title={activePlayer.name} onClose={onClose}>
        <div className="ts-field-group">
            <label className="ts-field-label" htmlFor="skill-select">Select skill</label>
            <select
                id="skill-select"
                className="generic-field select ts-focusable"
                value={pendingSkillId}
                onChange={onSkillChange}
            >
                <option value="">Choose a path</option>
                {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                        {skill.name} - Lv {activePlayer?.skills[skill.id]?.level ?? 0}
                    </option>
                ))}
            </select>
            <label className="ts-field-label" htmlFor="recipe-select">Select recipe</label>
            <select
                id="recipe-select"
                className="generic-field select ts-focusable"
                value={pendingRecipeId}
                onChange={onRecipeChange}
                disabled={!pendingSkill}
            >
                <option value="">Choose a recipe</option>
                {pendingSkill && pendingSkillId
                    ? getRecipesForSkill(pendingSkillId as SkillId).map((recipeDef) => {
                        const recipeState = pendingSkill.recipes[recipeDef.id];
                        const recipeLevel = recipeState?.level ?? 0;
                        const unlocked = isRecipeUnlocked(recipeDef, pendingSkill.level);
                        const unlockLevel = getRecipeUnlockLevel(recipeDef);
                        const unlockLabel = unlocked ? "" : ` (Unlocks at Lv ${unlockLevel})`;
                        return (
                            <option key={recipeDef.id} value={recipeDef.id} disabled={!unlocked}>
                                {recipeDef.name} - Lv {recipeLevel}{unlockLabel}
                            </option>
                        );
                    })
                    : null}
            </select>
            <div className="ts-action-summary">
                <div className="ts-action-summary-row">
                    <span className="ts-action-summary-label">Action selection</span>
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
            <div className="ts-action-row">
                <button
                    type="button"
                    className="generic-field button ts-focusable"
                    onClick={onStartAction}
                    disabled={!canStartAction}
                >
                    Start action
                </button>
            </div>
            {missingItemsLabel ? (
                <div className="ts-missing-hint">{missingItemsLabel}</div>
            ) : null}
            <div className="ts-action-row">
                <button
                    type="button"
                    className="generic-field button ts-stop ts-focusable"
                    onClick={onStopAction}
                    disabled={!canStopAction}
                >
                    Pause action
                </button>
            </div>
        </div>
    </ModalShell>
));

LoadoutModal.displayName = "LoadoutModal";
