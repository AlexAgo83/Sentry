import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { ActionDefinition, ItemDelta, PlayerState, RecipeDefinition, RecipeState, SkillId, SkillState } from "../../core/types";
import { getActionDefinition, getRecipeDefinition } from "../../data/definitions";

type ActionStatusState = {
    activeSkillId: SkillId | "";
    activeSkill: SkillState | null;
    activeRecipeId: string;
    activeRecipe: RecipeState | null;
    activeCosts?: ItemDelta;
    activeRewardsWithGold?: ItemDelta;
    hasActiveRecipeSelection: boolean;
    staminaPercent: number;
    skillPercent: number;
    recipePercent: number;
    staminaStyle: CSSProperties;
    skillStyle: CSSProperties;
    recipeStyle: CSSProperties;
    isStunned: boolean;
};

export const useActionStatus = (activePlayer: PlayerState | null): ActionStatusState => {
    const activeSkillId = activePlayer?.selectedActionId ?? "";
    const activeSkill = activeSkillId ? (activePlayer?.skills[activeSkillId] ?? null) : null;
    const activeRecipeId = activeSkill?.selectedRecipeId ?? "";
    const activeRecipe = activeSkillId && activeRecipeId
        ? activeSkill?.recipes[activeRecipeId] ?? null
        : null;

    const activeActionDef = useMemo<ActionDefinition | null>(
        () => (activeSkillId ? getActionDefinition(activeSkillId as SkillId) ?? null : null),
        [activeSkillId]
    );
    const activeRecipeDef = useMemo<RecipeDefinition | null>(
        () => (
            activeSkillId && activeRecipeId
                ? getRecipeDefinition(activeSkillId as SkillId, activeRecipeId) ?? null
                : null
        ),
        [activeRecipeId, activeSkillId]
    );
    const activeCosts = activeRecipeDef?.itemCosts ?? activeActionDef?.itemCosts;
    const activeRewards = activeRecipeDef?.itemRewards ?? activeActionDef?.itemRewards;
    const activeGoldReward = activeRecipeDef?.goldReward ?? activeActionDef?.goldReward ?? 0;
    const activeRewardsWithGold = activeRewards
        ? { ...activeRewards, ...(activeGoldReward ? { gold: activeGoldReward } : {}) }
        : activeGoldReward
            ? { gold: activeGoldReward }
            : undefined;
    const hasActiveRecipeSelection = Boolean(activeSkillId && activeRecipeId);

    const staminaPercent = activePlayer
        ? Math.max(0, Math.min(100, (activePlayer.stamina / activePlayer.staminaMax) * 100))
        : 0;
    const staminaStyle = { "--progress": `${staminaPercent}%` } as CSSProperties;
    const skillPercent = activeSkill?.xpNext
        ? Math.max(0, Math.min(100, (activeSkill.xp / activeSkill.xpNext) * 100))
        : 0;
    const skillStyle = { "--progress": `${skillPercent}%` } as CSSProperties;
    const recipePercent = activeRecipe?.xpNext
        ? Math.max(0, Math.min(100, (activeRecipe.xp / activeRecipe.xpNext) * 100))
        : 0;
    const recipeStyle = { "--progress": `${recipePercent}%` } as CSSProperties;
    const isStunned = Boolean(activePlayer?.selectedActionId) && (activePlayer?.stamina ?? 0) <= 0;

    return {
        activeSkillId,
        activeSkill,
        activeRecipeId,
        activeRecipe,
        activeCosts,
        activeRewardsWithGold,
        hasActiveRecipeSelection,
        staminaPercent,
        skillPercent,
        recipePercent,
        staminaStyle,
        skillStyle,
        recipeStyle,
        isStunned
    };
};
