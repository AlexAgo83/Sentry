import { useMemo } from "react";
import type { ActionDefinition, ActionId, ItemDelta, PlayerState, RecipeDefinition, SkillState } from "../../core/types";
import { getActionDefinition, getRecipeDefinition, isRecipeUnlocked } from "../../data/definitions";

type MissingItem = {
    itemId: string;
    needed: number;
};

type PendingActionSelectionState = {
    pendingSkill: SkillState | null;
    pendingRecipeDef: RecipeDefinition | null;
    pendingRecipeUnlocked: boolean;
    pendingItemCosts?: ItemDelta;
    pendingRewardsWithGold?: ItemDelta;
    missingItems: MissingItem[];
    isRunningSelection: boolean;
    canStartAction: boolean;
};

export const usePendingActionSelection = ({
    activePlayer,
    pendingSkillId,
    pendingRecipeId,
    inventoryItems
}: {
    activePlayer: PlayerState | null;
    pendingSkillId: ActionId | "";
    pendingRecipeId: string;
    inventoryItems: Record<string, number>;
}): PendingActionSelectionState => {
    const pendingSkill = useMemo(
        () => (pendingSkillId && activePlayer ? activePlayer.skills[pendingSkillId] : null),
        [activePlayer, pendingSkillId]
    );
    const pendingRecipeDef = useMemo(
        () => (
            pendingSkillId && pendingRecipeId
                ? getRecipeDefinition(pendingSkillId, pendingRecipeId) ?? null
                : null
        ),
        [pendingRecipeId, pendingSkillId]
    );
    const pendingRecipeUnlocked = useMemo(() => {
        if (!pendingSkill || !pendingRecipeDef) {
            return false;
        }
        return isRecipeUnlocked(pendingRecipeDef, pendingSkill.level);
    }, [pendingRecipeDef, pendingSkill]);

    const pendingActionDef = useMemo<ActionDefinition | null>(
        () => (pendingSkillId ? getActionDefinition(pendingSkillId) ?? null : null),
        [pendingSkillId]
    );
    const pendingItemCosts = pendingRecipeDef?.itemCosts ?? pendingActionDef?.itemCosts;
    const pendingItemRewards = pendingRecipeDef?.itemRewards ?? pendingActionDef?.itemRewards;
    const pendingGoldReward = pendingRecipeDef?.goldReward ?? pendingActionDef?.goldReward ?? 0;
    const pendingRewardsWithGold = pendingItemRewards
        ? { ...pendingItemRewards, ...(pendingGoldReward ? { gold: pendingGoldReward } : {}) }
        : pendingGoldReward
            ? { gold: pendingGoldReward }
            : undefined;

    const missingItems = useMemo<MissingItem[]>(() => {
        if (!pendingItemCosts) {
            return [];
        }
        return Object.entries(pendingItemCosts)
            .map(([itemId, amount]) => {
                const available = inventoryItems[itemId] ?? 0;
                const needed = amount - available;
                return needed > 0 ? { itemId, needed } : null;
            })
            .filter((entry): entry is MissingItem => entry !== null);
    }, [inventoryItems, pendingItemCosts]);

    const activeSkillId = activePlayer?.selectedActionId ?? "";
    const activeSkill = activeSkillId ? activePlayer?.skills[activeSkillId] : null;
    const activeRecipeId = activeSkill?.selectedRecipeId ?? "";
    const isRunningSelection = Boolean(activePlayer?.selectedActionId)
        && pendingSkillId === activeSkillId
        && Boolean(pendingRecipeId)
        && pendingRecipeId === activeRecipeId;
    const canStartAction = Boolean(
        activePlayer
        && pendingSkillId
        && pendingRecipeId
        && pendingRecipeUnlocked
        && !isRunningSelection
        && missingItems.length === 0
    );

    return {
        pendingSkill,
        pendingRecipeDef,
        pendingRecipeUnlocked,
        pendingItemCosts,
        pendingRewardsWithGold,
        missingItems,
        isRunningSelection,
        canStartAction
    };
};
