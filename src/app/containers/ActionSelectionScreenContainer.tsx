import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getActionDefinition,
    getRecipeDefinition,
    getRecipesForSkill,
    isRecipeUnlocked,
    ITEM_DEFINITIONS,
    SKILL_DEFINITIONS
} from "../../data/definitions";
import { MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../../core/constants";
import type { ActionDefinition, SkillId, SkillState } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { getEquipmentModifiers } from "../../data/equipment";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { usePendingActionSelection } from "../hooks/usePendingActionSelection";
import { formatItemListEntries, getItemListEntries } from "../ui/itemFormatters";
import { ActionSelectionScreen } from "../components/ActionSelectionScreen";

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

type ActionSelectionScreenContainerProps = {
    onBack: () => void;
    getSkillLabel: (skillId: SkillId) => string;
};

export const ActionSelectionScreenContainer = ({ onBack, getSkillLabel }: ActionSelectionScreenContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const inventoryItems = useGameStore((state) => state.inventory.items);

    const [pendingSkillId, setPendingSkillId] = useState<SkillId | "">("");
    const [pendingRecipeId, setPendingRecipeId] = useState("");

    const itemNameById = useMemo(() => ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
    }, {}), []);

    const statsNowTime = Date.now();
    const activeEquipment = activePlayer?.equipment ?? null;
    const equipmentModifiers = useMemo(
        () => (activeEquipment ? getEquipmentModifiers(activeEquipment) : []),
        [activeEquipment]
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

    const formatBonusPercent = useCallback((value: number): string => {
        if (!Number.isFinite(value) || value <= 0) {
            return "0";
        }
        const label = value >= 10 ? value.toFixed(0) : value.toFixed(1);
        return `${label}%`;
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

    useEffect(() => {
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
        const selectedRecipeDef = skillId && selectedRecipeId
            ? getRecipeDefinition(skillId as SkillId, selectedRecipeId)
            : null;
        const selectedRecipeUnlocked = Boolean(
            selectedRecipeDef && skill && isRecipeUnlocked(selectedRecipeDef, skill.level)
        );
        const recipeId = selectedRecipeUnlocked && selectedRecipeId
            ? selectedRecipeId
            : skillId && skill
                ? getFirstUnlockedRecipeId(skillId as SkillId, skill.level)
                : "";

        setPendingSkillId(skillId as SkillId | "");
        setPendingRecipeId(recipeId);
    }, [activePlayer?.id]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") {
                return;
            }
            event.preventDefault();
            onBack();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onBack]);

    const handleSkillSelect = useCallback((nextSkillId: SkillId | "") => {
        if (!activePlayer) {
            return;
        }
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

    const handleRecipeSelect = useCallback((nextRecipeId: string) => {
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

    const pendingActionDef: ActionDefinition | null = pendingSkillId
        ? (getActionDefinition(pendingSkillId as SkillId) ?? null)
        : null;
    const pendingActionDurationLabel = getActionIntervalLabel(pendingSkill, pendingActionDef);
    const pendingActionXpLabel = getActionXpLabel(pendingActionDef);
    const pendingSpeedBonusLabel = hasPendingSelection
        ? (() => {
            const speedBonusPercent = (effectiveStats.Agility ?? 0) * STAT_PERCENT_PER_POINT * 100;
            return speedBonusPercent > 0 ? `-${formatBonusPercent(speedBonusPercent)} time` : "None";
        })()
        : "None";
    const pendingXpBonusLabel = hasPendingSelection && pendingActionDef && INTELLECT_SKILLS.has(pendingActionDef.skillId)
        ? (() => {
            const xpBonusPercent = (effectiveStats.Intellect ?? 0) * STAT_PERCENT_PER_POINT * 100;
            return xpBonusPercent > 0 ? `+${formatBonusPercent(xpBonusPercent)} XP` : "None";
        })()
        : "None";

    const missingItemsLabel = missingItems.length > 0
        ? `Missing: ${missingItems.map((entry) => `${itemNameById[entry.itemId] ?? entry.itemId} x${entry.needed}`).join(", ")}`
        : "";

    if (!activePlayer) {
        return null;
    }

    return (
        <ActionSelectionScreen
            activePlayer={activePlayer}
            skills={SKILL_DEFINITIONS}
            pendingSkillId={pendingSkillId}
            pendingRecipeId={pendingRecipeId}
            pendingSkill={pendingSkill as SkillState | null}
            pendingSkillLabel={pendingSkillLabel}
            pendingRecipeLabel={pendingRecipeLabel}
            pendingConsumptionLabel={pendingConsumptionLabel}
            pendingProductionLabel={pendingProductionLabel}
            pendingConsumptionEntries={hasPendingSelection ? pendingConsumptionEntries : []}
            pendingProductionEntries={hasPendingSelection ? pendingProductionEntries : []}
            pendingSpeedBonusLabel={pendingSpeedBonusLabel}
            pendingActionDurationLabel={pendingActionDurationLabel}
            pendingActionXpLabel={pendingActionXpLabel}
            pendingXpBonusLabel={pendingXpBonusLabel}
            missingItemsLabel={missingItemsLabel}
            canStartAction={canStartAction}
            canStopAction={Boolean(activePlayer.selectedActionId)}
            onSkillSelect={handleSkillSelect}
            onRecipeSelect={handleRecipeSelect}
            onStartAction={handleStartAction}
            onStopAction={handleStopAction}
            onBack={onBack}
        />
    );
};
