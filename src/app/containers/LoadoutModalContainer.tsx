import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getActionDefinition, getRecipeDefinition, getRecipesForSkill, isRecipeUnlocked, ITEM_DEFINITIONS, SKILL_DEFINITIONS } from "../../data/definitions";
import { MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../../core/constants";
import type { ActionDefinition, SkillId, SkillState } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { getEquipmentModifiers } from "../../data/equipment";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { usePendingActionSelection } from "../hooks/usePendingActionSelection";
import { formatItemListEntries, getItemListEntries } from "../ui/itemFormatters";
import { LoadoutModal } from "../components/LoadoutModal";

const getFirstUnlockedRecipeId = (skillId: SkillId, skillLevel: number): string => {
    return getRecipesForSkill(skillId).find((recipe) => isRecipeUnlocked(recipe, skillLevel))?.id ?? "";
};

const INTELLECT_SKILLS = new Set<SkillId>([
    "Cooking",
    "Alchemy",
    "Herbalism",
    "Tailoring",
    "Carpentry"
]);

type LoadoutModalContainerProps = {
    isOpen: boolean;
    onClose: () => void;
    getSkillLabel: (skillId: SkillId | "") => string;
};

export const LoadoutModalContainer = ({ isOpen, onClose, getSkillLabel }: LoadoutModalContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const inventoryItems = useGameStore((state) => state.inventory.items);

    const [pendingSkillId, setPendingSkillId] = useState<SkillId | "">("");
    const [pendingRecipeId, setPendingRecipeId] = useState("");

    const itemNameById = useMemo(() => ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
    }, {}), []);

    const statsNowTime = Date.now();
    const equipmentModifiers = useMemo(
        () => (activePlayer ? getEquipmentModifiers(activePlayer.equipment) : []),
        [activePlayer?.equipment]
    );
    const statsSnapshot = activePlayer
        ? resolveEffectiveStats(activePlayer.stats, statsNowTime, equipmentModifiers)
        : null;
    const statsState = statsSnapshot?.stats ?? createPlayerStatsState();
    const effectiveStats = statsSnapshot?.effective ?? computeEffectiveStats(statsState, equipmentModifiers);

    const formatActionDuration = useCallback((durationMs: number): string => {
        if (!Number.isFinite(durationMs) || durationMs <= 0) {
            return "None";
        }
        return `${(durationMs / 1000).toFixed(1)}s`;
    }, []);

    const formatXpGain = useCallback((value: number): string => {
        if (!Number.isFinite(value)) {
            return "0";
        }
        return Number.isInteger(value) ? String(value) : value.toFixed(1);
    }, []);

    const getActionIntervalLabel = useCallback((
        skill: SkillState | null,
        actionDef: ActionDefinition | null
    ): string => {
        if (!skill || !actionDef) {
            return "None";
        }
        const agility = effectiveStats.Agility ?? 0;
        const intervalMultiplier = 1 - agility * STAT_PERCENT_PER_POINT;
        const baseInterval = Math.ceil(skill.baseInterval * intervalMultiplier);
        const interval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        return formatActionDuration(interval);
    }, [effectiveStats.Agility, formatActionDuration]);

    const getActionXpLabel = useCallback((actionDef: ActionDefinition | null): string => {
        if (!actionDef) {
            return "None";
        }
        const intellect = effectiveStats.Intellect ?? 0;
        const xpMultiplier = INTELLECT_SKILLS.has(actionDef.skillId)
            ? 1 + intellect * STAT_PERCENT_PER_POINT
            : 1;
        const skillXp = actionDef.xpSkill * xpMultiplier;
        const recipeXp = actionDef.xpRecipe * xpMultiplier;
        return `Skill +${formatXpGain(skillXp)} / Recipe +${formatXpGain(recipeXp)}`;
    }, [effectiveStats.Intellect, formatXpGain]);

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            hasInitialized.current = false;
            return;
        }

        if (hasInitialized.current) {
            return;
        }
        hasInitialized.current = true;

        const state = gameStore.getState();
        const playerId = state.activePlayerId;
        const player = playerId ? state.players[playerId] : null;
        if (!player) {
            setPendingSkillId("");
            setPendingRecipeId("");
            return;
        }

        const skillId = player.selectedActionId ?? "";
        const skill = skillId ? player.skills[skillId] : null;
        const selectedRecipeId = skill?.selectedRecipeId ?? "";
        const selectedRecipeDef = selectedRecipeId && skillId
            ? getRecipeDefinition(skillId as SkillId, selectedRecipeId)
            : null;
        const selectedRecipeUnlocked = Boolean(selectedRecipeDef && skill && isRecipeUnlocked(selectedRecipeDef, skill.level));
        const recipeId = skill && skillId
            ? selectedRecipeUnlocked && selectedRecipeId
                ? selectedRecipeId
                : getFirstUnlockedRecipeId(skillId as SkillId, skill.level)
            : "";
        setPendingSkillId(skillId as SkillId | "");
        setPendingRecipeId(recipeId);
    }, [isOpen]);

    const handleSkillChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        if (!activePlayer) {
            return;
        }
        const nextSkillId = event.target.value as SkillId | "";
        setPendingSkillId(nextSkillId);
        if (!nextSkillId) {
            setPendingRecipeId("");
            return;
        }
        const nextSkill = activePlayer.skills[nextSkillId];
        if (!nextSkill) {
            setPendingRecipeId("");
            return;
        }
        const selectedRecipeId = nextSkill.selectedRecipeId ?? "";
        const selectedRecipeDef = selectedRecipeId
            ? getRecipeDefinition(nextSkillId as SkillId, selectedRecipeId)
            : null;
        const selectedRecipeUnlocked = Boolean(
            selectedRecipeDef && isRecipeUnlocked(selectedRecipeDef, nextSkill.level)
        );
        const nextRecipeId = selectedRecipeUnlocked && selectedRecipeId
            ? selectedRecipeId
            : getFirstUnlockedRecipeId(nextSkillId as SkillId, nextSkill.level);
        setPendingRecipeId(nextRecipeId);
    }, [activePlayer]);

    const handleRecipeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const nextRecipeId = event.target.value ?? "";
        setPendingRecipeId(nextRecipeId);
    }, []);

    const handleStopAction = useCallback(() => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({
            type: "selectAction",
            playerId: activePlayer.id,
            actionId: null
        });
    }, [activePlayer]);

    const handleStartAction = useCallback(() => {
        if (!activePlayer || !pendingSkillId || !pendingRecipeId) {
            return;
        }
        gameStore.dispatch({
            type: "selectAction",
            playerId: activePlayer.id,
            actionId: pendingSkillId as SkillId
        });
        gameStore.dispatch({
            type: "selectRecipe",
            playerId: activePlayer.id,
            skillId: pendingSkillId as SkillId,
            recipeId: pendingRecipeId
        });
    }, [activePlayer, pendingRecipeId, pendingSkillId]);

    const {
        pendingSkill,
        pendingItemCosts,
        pendingRewardsWithGold,
        missingItems,
        canStartAction
    } = usePendingActionSelection({
        activePlayer,
        pendingSkillId,
        pendingRecipeId,
        inventoryItems
    });

    const pendingSkillLabel = pendingSkillId ? getSkillLabel(pendingSkillId as SkillId) : "None";
    const pendingRecipeLabel = pendingSkillId && pendingRecipeId
        ? getRecipeDefinition(pendingSkillId as SkillId, pendingRecipeId)?.name ?? pendingRecipeId
        : "None";
    const hasPendingSelection = Boolean(pendingSkillId && pendingRecipeId);
    const pendingConsumptionEntries = getItemListEntries(ITEM_DEFINITIONS, pendingItemCosts);
    const pendingProductionEntries = getItemListEntries(ITEM_DEFINITIONS, pendingRewardsWithGold);
    const pendingConsumptionLabel = hasPendingSelection
        ? (pendingConsumptionEntries.length > 0 ? formatItemListEntries(pendingConsumptionEntries) : "None")
        : "None";
    const pendingProductionLabel = hasPendingSelection
        ? (pendingProductionEntries.length > 0 ? formatItemListEntries(pendingProductionEntries) : "None")
        : "None";

    const pendingActionDef: ActionDefinition | null = pendingSkillId ? getActionDefinition(pendingSkillId as SkillId) : null;
    const pendingActionDurationLabel = getActionIntervalLabel(pendingSkill, pendingActionDef);
    const pendingActionXpLabel = getActionXpLabel(pendingActionDef);

    const missingItemsLabel = missingItems.length > 0
        ? `Missing: ${missingItems.map((entry) => `${itemNameById[entry.itemId] ?? entry.itemId} x${entry.needed}`).join(", ")}`
        : "";

    if (!isOpen || !activePlayer) {
        return null;
    }

    return (
        <LoadoutModal
            activePlayer={activePlayer}
            skills={SKILL_DEFINITIONS}
            pendingSkillId={pendingSkillId}
            pendingRecipeId={pendingRecipeId}
            pendingSkill={pendingSkill as SkillState | null}
            pendingSkillLabel={pendingSkillLabel}
            pendingRecipeLabel={pendingRecipeLabel}
            pendingConsumptionLabel={pendingConsumptionLabel}
            pendingProductionLabel={pendingProductionLabel}
            pendingActionDurationLabel={pendingActionDurationLabel}
            pendingActionXpLabel={pendingActionXpLabel}
            missingItemsLabel={missingItemsLabel}
            canStartAction={canStartAction}
            canStopAction={Boolean(activePlayer.selectedActionId)}
            onSkillChange={handleSkillChange}
            onRecipeChange={handleRecipeChange}
            onStartAction={handleStartAction}
            onStopAction={handleStopAction}
            onClose={onClose}
        />
    );
};
