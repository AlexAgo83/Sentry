import { useEffect, useMemo } from "react";
import type { SkillId } from "../../core/types";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { getRecipesForSkill, isRecipeUnlocked } from "../../data/definitions";

const getFirstUnlockedRecipeId = (skillId: SkillId, skillLevel: number): string => {
    return getRecipesForSkill(skillId).find((recipe) => isRecipeUnlocked(recipe, skillLevel))?.id ?? "";
};

export const EnsureSelectedRecipeEffect = () => {
    const activePlayerId = useGameStore((state) => state.activePlayerId);
    const selectedActionId = useGameStore((state) => (
        state.activePlayerId ? state.players[state.activePlayerId]?.selectedActionId ?? null : null
    ));
    const selectedRecipeId = useGameStore((state) => {
        const playerId = state.activePlayerId;
        if (!playerId) {
            return null;
        }
        const player = state.players[playerId];
        const skillId = player?.selectedActionId;
        if (!player || !skillId) {
            return null;
        }
        return player.skills[skillId]?.selectedRecipeId ?? null;
    });
    const skillLevel = useGameStore((state) => {
        const playerId = state.activePlayerId;
        if (!playerId) {
            return 0;
        }
        const player = state.players[playerId];
        const skillId = player?.selectedActionId;
        if (!player || !skillId) {
            return 0;
        }
        return player.skills[skillId]?.level ?? 0;
    });

    const resolved = useMemo(() => {
        if (!activePlayerId || !selectedActionId) {
            return null;
        }
        if (selectedRecipeId) {
            return null;
        }
        const recipeId = getFirstUnlockedRecipeId(selectedActionId as SkillId, skillLevel);
        if (!recipeId) {
            return null;
        }
        return { playerId: activePlayerId, skillId: selectedActionId as SkillId, recipeId };
    }, [activePlayerId, selectedActionId, selectedRecipeId, skillLevel]);

    useEffect(() => {
        if (!resolved) {
            return;
        }
        gameStore.dispatch({
            type: "selectRecipe",
            playerId: resolved.playerId,
            skillId: resolved.skillId,
            recipeId: resolved.recipeId
        });
    }, [resolved]);

    return null;
};

