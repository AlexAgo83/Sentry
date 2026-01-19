import { useCallback, useMemo } from "react";
import { getActionDefinition, ITEM_DEFINITIONS } from "../../data/definitions";
import { getEquipmentModifiers } from "../../data/equipment";
import { MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../../core/constants";
import type { ActionDefinition, SkillId, SkillState } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { useActionStatus } from "../hooks/useActionStatus";
import { formatItemListEntries, getItemListEntries } from "../ui/itemFormatters";
import { ActionStatusPanel } from "../components/ActionStatusPanel";
import { getSkillIconColor } from "../ui/skillColors";
import { gameStore } from "../game";

type ActionPanelContainerProps = {
    onChangeAction: () => void;
    getSkillLabel: (skillId: SkillId) => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
};

const INTELLECT_SKILLS = new Set<SkillId>([
    "Cooking",
    "Alchemy",
    "Herbalism",
    "Tailoring",
    "Carpentry"
]);

export const ActionPanelContainer = ({
    onChangeAction,
    getSkillLabel,
    getRecipeLabel
}: ActionPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const [isCollapsed, setCollapsed] = usePersistedCollapse("actionStatus", false);
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

    const {
        activeSkillId,
        activeSkill,
        activeRecipeId,
        activeRecipe,
        activeCosts,
        activeRewardsWithGold,
        hasActiveRecipeSelection,
        progressPercent,
        progressStyle,
        staminaStyle,
        skillStyle,
        recipeStyle,
        isStunned
    } = useActionStatus(activePlayer);

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
        actionDef: ActionDefinition | null,
        includeStun: boolean
    ): string => {
        if (!skill || !actionDef) {
            return "None";
        }
        const agility = effectiveStats.Agility ?? 0;
        const intervalMultiplier = 1 - agility * STAT_PERCENT_PER_POINT;
        const baseInterval = Math.ceil(skill.baseInterval * intervalMultiplier);
        const stunDelay = includeStun && isStunned ? actionDef.stunTime : 0;
        const interval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval) + stunDelay;
        return formatActionDuration(interval);
    }, [effectiveStats.Agility, formatActionDuration, isStunned]);

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

    const activeRecipeLabel = hasActiveRecipeSelection && activeSkillId
        ? getRecipeLabel(activeSkillId as SkillId, activeRecipeId)
        : "None";
    const activeConsumptionEntries = getItemListEntries(ITEM_DEFINITIONS, activeCosts);
    const activeProductionEntries = getItemListEntries(ITEM_DEFINITIONS, activeRewardsWithGold);
    const activeConsumptionLabel = hasActiveRecipeSelection
        ? (activeConsumptionEntries.length > 0 ? formatItemListEntries(activeConsumptionEntries) : "None")
        : "None";
    const activeProductionLabel = hasActiveRecipeSelection
        ? (activeProductionEntries.length > 0 ? formatItemListEntries(activeProductionEntries) : "None")
        : "None";
    const resourceHint = hasActiveRecipeSelection ? null : "Select a recipe to see resource flow.";
    const activeActionDef = activeSkillId ? (getActionDefinition(activeSkillId as SkillId) ?? null) : null;
    const actionIntervalLabel = getActionIntervalLabel(activeSkill, activeActionDef, true);
    const actionXpLabel = hasActiveRecipeSelection ? getActionXpLabel(activeActionDef) : "None";
    const activeSkillName = activeSkillId ? getSkillLabel(activeSkillId as SkillId) : "None";
    const skillIconColor = getSkillIconColor(activeSkillId);
    const canInterruptAction = Boolean(activePlayer?.selectedActionId);
    const handleInterruptAction = useCallback(() => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({ type: "selectAction", playerId: activePlayer.id, actionId: null });
    }, [activePlayer]);

    return (
        <ActionStatusPanel
            activeSkillId={activeSkillId as SkillId | ""}
            activeSkillName={activeSkillName}
            activeRecipeLabel={activeRecipeLabel}
            activeConsumptionLabel={activeConsumptionLabel}
            activeProductionLabel={activeProductionLabel}
            actionDurationLabel={actionIntervalLabel}
            actionXpLabel={actionXpLabel}
            resourceHint={resourceHint}
            progressPercent={progressPercent}
            progressStyle={progressStyle}
            staminaStyle={staminaStyle}
            skillStyle={skillStyle}
            recipeStyle={recipeStyle}
            staminaCurrent={activePlayer?.stamina ?? 0}
            staminaMax={activePlayer?.staminaMax ?? 0}
            activeSkillLevel={activeSkill?.level ?? 0}
            activeSkillXp={activeSkill?.xp ?? 0}
            activeSkillXpNext={activeSkill?.xpNext ?? 0}
            activeRecipeLevel={activeRecipe?.level ?? 0}
            activeRecipeXp={activeRecipe?.xp ?? 0}
            activeRecipeXpNext={activeRecipe?.xpNext ?? 0}
            isStunned={isStunned}
            skillIconColor={skillIconColor}
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            onChangeAction={onChangeAction}
            canChangeAction={Boolean(activePlayer)}
            onInterruptAction={handleInterruptAction}
            canInterruptAction={canInterruptAction}
        />
    );
};
