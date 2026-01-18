import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
    getActionDefinition,
    ITEM_DEFINITIONS,
    SKILL_DEFINITIONS,
    getRecipeDefinition,
    getRecipesForSkill,
    isRecipeUnlocked
} from "../data/definitions";
import { MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../core/constants";
import type { ActionDefinition, SkillState } from "../core/types";
import { EquipmentSlotId, SkillId } from "../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../core/stats";
import { createPlayerEquipmentState } from "../core/equipment";
import { gameRuntime, gameStore } from "./game";
import { useGameStore } from "./hooks/useGameStore";
import { ActionStatusPanel } from "./components/ActionStatusPanel";
import { CharacterStatsPanel } from "./components/CharacterStatsPanel";
import { InventoryPanel, type InventorySort } from "./components/InventoryPanel";
import { EquipmentPanel } from "./components/EquipmentPanel";
import { RosterPanel } from "./components/RosterPanel";
import { getInventoryMeta } from "./ui/inventoryMeta";
import { InventoryIconSprite } from "./ui/inventoryIcons";
import { ITEM_USAGE_MAP } from "./ui/itemUsage";
import "./styles/app.css";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { usePersistedCollapse } from "./hooks/usePersistedCollapse";
import { usePersistedInventoryFilters } from "./hooks/usePersistedInventoryFilters";
import { HeroNameModal } from "./components/HeroNameModal";
import { LoadoutModal } from "./components/LoadoutModal";
import { SystemModal } from "./components/SystemModal";
import { OfflineSummaryModal } from "./components/OfflineSummaryModal";
import { ServiceWorkerUpdateModal } from "./components/ServiceWorkerUpdateModal";
import { useInventoryView } from "./hooks/useInventoryView";
import { usePendingActionSelection } from "./hooks/usePendingActionSelection";
import { useActionStatus } from "./hooks/useActionStatus";
import { formatItemListEntries, getItemListEntries } from "./ui/itemFormatters";
import { getSkillIconColor } from "./ui/skillColors";
import { EQUIPMENT_DEFINITIONS, getEquipmentModifiers } from "../data/equipment";
import type { SwUpdateAvailableDetail } from "../pwa/serviceWorker";
import { activateWaitingServiceWorker, listenForSwUpdateAvailable } from "../pwa/serviceWorker";

const INTELLECT_SKILLS = new Set<SkillId>([
    "Cooking",
    "Alchemy",
    "Herbalism",
    "Tailoring",
    "Carpentry"
]);

export const App = () => {
    useEffect(() => {
        gameRuntime.start();
        return () => gameRuntime.stop();
    }, []);

    const [swUpdate, setSwUpdate] = useState<SwUpdateAvailableDetail | null>(null);
    const [ignoredSwVersion, setIgnoredSwVersion] = useState<string | null>(null);
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        return listenForSwUpdateAvailable((detail) => {
            if (ignoredSwVersion === detail.version) {
                return;
            }
            setSwUpdate((prev) => prev ?? detail);
        });
    }, [ignoredSwVersion]);

    const state = useGameStore((gameState) => gameState);
    const activePlayer = state.activePlayerId ? state.players[state.activePlayerId] : null;
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
        staminaPercent,
        skillPercent,
        recipePercent,
        progressStyle,
        staminaStyle,
        skillStyle,
        recipeStyle,
        isStunned
    } = useActionStatus(activePlayer);
    const players = useMemo(
        () => Object.values(state.players).slice().sort((a, b) => Number(a.id) - Number(b.id)),
        [state.players]
    );
    const offlineSummary = state.offlineSummary;
    const perf = state.perf;
    const tickRate = (1000 / state.loop.loopInterval).toFixed(1);
    const hasDelta = perf.lastDeltaMs > 0;
    const driftMs = hasDelta ? perf.lastDeltaMs - state.loop.loopInterval : 0;
    const driftLabel = `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;
    const [isLoadoutOpen, setLoadoutOpen] = useState(false);
    const [isRecruitOpen, setRecruitOpen] = useState(false);
    const [isRenameOpen, setRenameOpen] = useState(false);
    const [renamePlayerId, setRenamePlayerId] = useState<string | null>(null);
    const [newHeroName, setNewHeroName] = useState("");
    const [renameHeroName, setRenameHeroName] = useState("");
    const [pendingSkillId, setPendingSkillId] = useState("");
    const [pendingRecipeId, setPendingRecipeId] = useState("");
    const [isRosterCollapsed, setRosterCollapsed] = usePersistedCollapse("roster", false);
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isInventoryCollapsed, setInventoryCollapsed] = usePersistedCollapse("inventory", false);
    const [isEquipmentCollapsed, setEquipmentCollapsed] = usePersistedCollapse("equipment", false);
    const [isStatsCollapsed, setStatsCollapsed] = usePersistedCollapse("stats", false);
    const [isActionCollapsed, setActionCollapsed] = usePersistedCollapse("actionStatus", false);
    const [inventoryFilters, setInventoryFilters] = usePersistedInventoryFilters({
        sort: "Name",
        search: "",
        page: 1
    });
    const handleSetInventorySort = useCallback((value: InventorySort) => {
        setInventoryFilters((prev) => ({
            ...prev,
            sort: value,
            page: 1
        }));
    }, [setInventoryFilters]);
    const handleSetInventorySearch = useCallback((value: string) => {
        setInventoryFilters((prev) => ({
            ...prev,
            search: value,
            page: 1
        }));
    }, [setInventoryFilters]);
    const handleSetInventoryPage = useCallback((page: number) => {
        setInventoryFilters((prev) => ({
            ...prev,
            page
        }));
    }, [setInventoryFilters]);
    const [activeSidePanel, setActiveSidePanel] = useState<"action" | "stats" | "inventory" | "equipment">("action");
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const inventorySort = inventoryFilters.sort;
    const inventorySearch = inventoryFilters.search;
    const inventoryPage = inventoryFilters.page;
    const skillNameById = useMemo(() => SKILL_DEFINITIONS.reduce<Record<string, string>>((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
    }, {}), []);
    const itemNameById = useMemo(() => ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
    }, {}), []);
    const getSkillLabel = useCallback((skillId: SkillId | ""): string => {
        if (!skillId) {
            return "None";
        }
        return skillNameById[skillId] ?? skillId;
    }, [skillNameById]);
    const getRecipeLabel = useCallback((skillId: SkillId, recipeId: string | null): string => {
        if (!recipeId) {
            return "none";
        }
        const recipeDef = getRecipeDefinition(skillId, recipeId);
        return recipeDef?.name ?? recipeId;
    }, []);
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
    const getFirstUnlockedRecipeId = useCallback((skillId: SkillId, skillLevel: number): string => {
        return getRecipesForSkill(skillId).find((recipe) => isRecipeUnlocked(recipe, skillLevel))?.id ?? "";
    }, []);

    useEffect(() => {
        if (!activePlayer || !activeSkillId) {
            return;
        }
        const skill = activePlayer.skills[activeSkillId];
        if (!skill || skill.selectedRecipeId) {
            return;
        }
        const defaultRecipeId = getFirstUnlockedRecipeId(activeSkillId as SkillId, skill.level);
        if (defaultRecipeId) {
            gameStore.dispatch({
                type: "selectRecipe",
                playerId: activePlayer.id,
                skillId: activeSkillId,
                recipeId: defaultRecipeId
            });
        }
    }, [activePlayer?.id, activeSkillId, getFirstUnlockedRecipeId]);

    useEffect(() => {
        if (!isLoadoutOpen) {
            return;
        }
        if (!activePlayer) {
            setPendingSkillId("");
            setPendingRecipeId("");
            return;
        }
        const skillId = activePlayer.selectedActionId ?? "";
        const skill = skillId ? activePlayer.skills[skillId] : null;
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
        setPendingSkillId(skillId);
        setPendingRecipeId(recipeId);
    }, [isLoadoutOpen, activePlayer?.id, activePlayer?.selectedActionId, getFirstUnlockedRecipeId]);

    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(false);
        setSystemOpen(false);
    }, [offlineSummary]);

    const handleSkillChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
    };

    const handleRecipeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        if (!activePlayer) {
            return;
        }
        const nextRecipeId = event.target.value ?? "";
        setPendingRecipeId(nextRecipeId);
    };

    const handleStopAction = () => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({
            type: "selectAction",
            playerId: activePlayer.id,
            actionId: null
        });
    };

    const handleSimulateOffline = () => {
        gameRuntime.simulateOffline(30 * 60 * 1000);
    };

    const handleStartAction = () => {
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
    };

    const handleAddPlayer = () => {
        setLoadoutOpen(false);
        setRenameOpen(false);
        setRecruitOpen(true);
    };

    const handleOpenSystem = () => {
        setSystemOpen(true);
    };

    const handleSetActivePlayer = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
    };

    const handleOpenLoadout = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setActiveSidePanel("action");
        setRecruitOpen(false);
        setRenameOpen(false);
        setLoadoutOpen(true);
    };

    const handleOpenActiveLoadout = () => {
        if (!activePlayer) {
            return;
        }
        handleOpenLoadout(activePlayer.id);
    };

    const handleCloseLoadout = () => {
        setLoadoutOpen(false);
    };

    const handleCloseSystem = () => {
        setSystemOpen(false);
    };

    const handleToggleInventoryItem = (itemId: string) => {
        setSelectedInventoryItemId((current) => (current === itemId ? null : itemId));
    };

    const handleClearInventorySelection = () => {
        setSelectedInventoryItemId(null);
    };

    const handleEquipItem = useCallback((itemId: string) => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({
            type: "equipItem",
            playerId: activePlayer.id,
            itemId
        });
    }, [activePlayer]);

    const handleUnequipSlot = useCallback((slot: EquipmentSlotId) => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({
            type: "unequipItem",
            playerId: activePlayer.id,
            slot
        });
    }, [activePlayer]);

    const handleCloseRecruit = () => {
        setRecruitOpen(false);
        setNewHeroName("");
    };

    const handleOpenRename = (playerId: string) => {
        const player = state.players[playerId];
        if (!player) {
            return;
        }
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setRenamePlayerId(playerId);
        setRenameHeroName(player.name);
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(true);
    };

    const handleOpenActiveRename = () => {
        if (!activePlayer) {
            return;
        }
        handleOpenRename(activePlayer.id);
    };

    const handleCloseRename = () => {
        setRenameOpen(false);
        setRenamePlayerId(null);
        setRenameHeroName("");
    };

    const handleCreateHero = () => {
        const trimmed = newHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "addPlayer", name: trimmed });
        setRecruitOpen(false);
        setNewHeroName("");
    };

    const handleRenameHero = () => {
        if (!renamePlayerId) {
            return;
        }
        const trimmed = renameHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "renamePlayer", playerId: renamePlayerId, name: trimmed });
        handleCloseRename();
    };

    const handleCloseOfflineSummary = () => {
        gameStore.dispatch({ type: "setOfflineSummary", summary: null });
    };

    const handleCloseSwUpdate = () => {
        if (swUpdate) {
            setIgnoredSwVersion(swUpdate.version);
        }
        setSwUpdate(null);
    };

    const handleReloadSwUpdate = () => {
        if (activateWaitingServiceWorker(swUpdate?.registration ?? null)) {
            setSwUpdate(null);
        }
    };

    const handleResetSave = () => {
        const confirmed = window.confirm("Reset save data? This cannot be undone.");
        if (!confirmed) {
            return;
        }
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(false);
        handleCloseOfflineSummary();
        gameRuntime.reset();
    };

    const inventoryItems = state.inventory.items;
    const {
        pendingSkill,
        pendingItemCosts,
        pendingRewardsWithGold,
        missingItems,
        canStartAction
    } = usePendingActionSelection({
        activePlayer,
        pendingSkillId: pendingSkillId as SkillId | "",
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
    const pendingActionDef = pendingSkillId ? getActionDefinition(pendingSkillId as SkillId) : null;
    const pendingActionDurationLabel = getActionIntervalLabel(pendingSkill, pendingActionDef, false);
    const pendingActionXpLabel = pendingSkillId ? getActionXpLabel(pendingActionDef) : "None";
    const missingItemsLabel = missingItems.length > 0
        ? `Missing: ${missingItems.map((entry) => `${itemNameById[entry.itemId] ?? entry.itemId} x${entry.needed}`).join(", ")}`
        : "";
    const {
        visibleEntries: inventoryVisibleEntries,
        filteredEntries: inventoryFilteredEntries,
        pageCount: inventoryPageCount,
        safePage: safeInventoryPage,
        pageEntries: inventoryPageEntries,
        selectedItem: selectedInventoryItem,
        selectedItemIndex,
        selectedItemPage,
        normalizedSearch: normalizedInventorySearch
    } = useInventoryView({
        items: inventoryItems,
        definitions: ITEM_DEFINITIONS,
        getInventoryMeta,
        usageMap: ITEM_USAGE_MAP,
        sort: inventorySort,
        search: inventorySearch,
        page: inventoryPage,
        selectedItemId: selectedInventoryItemId
    });
    const selectionHint = selectedInventoryItem
        ? selectedItemIndex < 0
            ? normalizedInventorySearch.length > 0
                ? "Selected item is hidden by your search."
                : "Selected item is not visible in the current list."
            : selectedItemPage !== safeInventoryPage
                ? `Selected item is on page ${selectedItemPage}.`
                : null
        : null;
    const inventoryEmptyState = inventoryVisibleEntries.length === 0
        ? "No items collected yet. Start actions to gather resources."
        : inventoryFilteredEntries.length === 0
            ? "No items match your search."
            : "No items on this page.";

    useEffect(() => {
        if (inventoryPage !== safeInventoryPage) {
            handleSetInventoryPage(safeInventoryPage);
        }
    }, [handleSetInventoryPage, inventoryPage, safeInventoryPage]);
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
    const activeActionDef = activeSkillId ? getActionDefinition(activeSkillId as SkillId) : null;
    const actionIntervalLabel = getActionIntervalLabel(activeSkill, activeActionDef, true);
    const actionXpLabel = hasActiveRecipeSelection ? getActionXpLabel(activeActionDef) : "None";

    const offlineSeconds = offlineSummary ? Math.round(offlineSummary.durationMs / 1000) : 0;
    const offlinePlayers = offlineSummary?.players ?? [];
    const activeSkillName = activeSkillId ? getSkillLabel(activeSkillId as SkillId) : "None";
    const skillIconColor = getSkillIconColor(activeSkillId);
    const activeSkillLevels = useMemo(() => SKILL_DEFINITIONS.reduce<Partial<Record<SkillId, number>>>((acc, skill) => {
        acc[skill.id] = activePlayer?.skills[skill.id]?.level ?? 0;
        return acc;
    }, {}), [activePlayer]);

    return (
        <div className="app-shell">
            <InventoryIconSprite />
            <header className="app-header">
                <div className="app-title-block">
                    <h1 className="app-title">Sentry Idle</h1>
                    <p className="app-subtitle">Forge, hunt, and master your path.</p>
                </div>
                <button
                    type="button"
                    className="app-version-tag app-version-button ts-focusable"
                    onClick={handleOpenSystem}
                    aria-label="Open system telemetry"
                >
                    <span className="app-version-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.983 3.5l1.2 1.7a6.9 6.9 0 0 1 2.16.9l1.96-.64 1.5 2.6-1.4 1.46c.2.7.3 1.4.3 2.18s-.1 1.48-.3 2.18l1.4 1.46-1.5 2.6-1.96-.64a6.9 6.9 0 0 1-2.16.9l-1.2 1.7h-3l-1.2-1.7a6.9 6.9 0 0 1-2.16-.9l-1.96.64-1.5-2.6 1.4-1.46a7.6 7.6 0 0 1-.3-2.18c0-.78.1-1.48.3-2.18l-1.4-1.46 1.5-2.6 1.96.64a6.9 6.9 0 0 1 2.16-.9l1.2-1.7h3z"
                            />
                            <circle cx="12" cy="12" r="3.3" />
                        </svg>
                    </span>
                    <span>{state.version}</span>
                </button>
            </header>
            <main className="app-layout generic-global ts-layout">
                <RosterPanel
                    players={players}
                    activePlayerId={state.activePlayerId}
                    isCollapsed={isRosterCollapsed}
                    onToggleCollapsed={() => setRosterCollapsed((value) => !value)}
                    onSetActivePlayer={handleSetActivePlayer}
                    onAddPlayer={handleAddPlayer}
                    getSkillLabel={getSkillLabel}
                    getRecipeLabel={getRecipeLabel}
                />
                <div className="ts-main-stack">
                    <SidePanelSwitcher
                        active={activeSidePanel}
                        onShowAction={() => setActiveSidePanel("action")}
                        onShowStats={() => setActiveSidePanel("stats")}
                        onShowInventory={() => setActiveSidePanel("inventory")}
                        onShowEquipment={() => setActiveSidePanel("equipment")}
                    />
                    {activeSidePanel === "action" ? (
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
                            staminaPercent={staminaPercent}
                            skillPercent={skillPercent}
                            recipePercent={recipePercent}
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
                            isCollapsed={isActionCollapsed}
                            onToggleCollapsed={() => setActionCollapsed((value) => !value)}
                            onChangeAction={handleOpenActiveLoadout}
                            canChangeAction={Boolean(activePlayer)}
                        />
                    ) : null}
                    {activeSidePanel === "stats" ? (
                        <CharacterStatsPanel
                            skills={SKILL_DEFINITIONS}
                            skillLevels={activeSkillLevels}
                            stats={statsState}
                            effectiveStats={effectiveStats}
                            equipmentMods={equipmentModifiers}
                            now={statsNowTime}
                            isCollapsed={isStatsCollapsed}
                            onToggleCollapsed={() => setStatsCollapsed((value) => !value)}
                            onRenameHero={handleOpenActiveRename}
                            canRenameHero={Boolean(activePlayer)}
                        />
                    ) : null}
                    {activeSidePanel === "inventory" ? (
                        <>
                            <InventoryPanel
                                isCollapsed={isInventoryCollapsed}
                                onToggleCollapsed={() => setInventoryCollapsed((value) => !value)}
                                entries={inventoryVisibleEntries}
                                gridEntries={inventoryPageEntries}
                                selectedItem={selectedInventoryItem}
                                selectedItemId={selectedInventoryItemId}
                                onSelectItem={handleToggleInventoryItem}
                                onClearSelection={handleClearInventorySelection}
                                sort={inventorySort}
                                onSortChange={handleSetInventorySort}
                                search={inventorySearch}
                                onSearchChange={handleSetInventorySearch}
                                page={safeInventoryPage}
                                pageCount={inventoryPageCount}
                                onPageChange={handleSetInventoryPage}
                                totalItems={inventoryVisibleEntries.length}
                                emptyState={inventoryEmptyState}
                                selectionHint={selectionHint}
                            />
                        </>
                    ) : null}
                    {activeSidePanel === "equipment" ? (
                        <EquipmentPanel
                            isCollapsed={isEquipmentCollapsed}
                            onToggleCollapsed={() => setEquipmentCollapsed((value) => !value)}
                            equipment={activePlayer?.equipment ?? createPlayerEquipmentState()}
                            inventoryItems={inventoryItems}
                            definitions={EQUIPMENT_DEFINITIONS}
                            onEquipItem={handleEquipItem}
                            onUnequipSlot={handleUnequipSlot}
                        />
                    ) : null}
                </div>
            </main>
            {isLoadoutOpen && activePlayer ? (
                <LoadoutModal
                    activePlayer={activePlayer}
                    skills={SKILL_DEFINITIONS}
                    pendingSkillId={pendingSkillId as SkillId | ""}
                    pendingRecipeId={pendingRecipeId}
                    pendingSkill={pendingSkill}
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
                    onClose={handleCloseLoadout}
                />
            ) : null}
            {isRecruitOpen ? (
                <HeroNameModal
                    kicker="Recruit"
                    title="New hero"
                    name={newHeroName}
                    submitLabel="Create hero"
                    isSubmitDisabled={newHeroName.trim().length === 0}
                    onNameChange={setNewHeroName}
                    onSubmit={handleCreateHero}
                    onClose={handleCloseRecruit}
                />
            ) : null}
            {isRenameOpen ? (
                <HeroNameModal
                    kicker="Set name"
                    title="Rename"
                    name={renameHeroName}
                    submitLabel="Save name"
                    isSubmitDisabled={renameHeroName.trim().length === 0}
                    onNameChange={setRenameHeroName}
                    onSubmit={handleRenameHero}
                    onClose={handleCloseRename}
                />
            ) : null}
            {isSystemOpen ? (
                <SystemModal
                    version={state.version}
                    lastTick={state.loop.lastTick}
                    lastTickDurationMs={perf.lastTickDurationMs}
                    lastDeltaMs={perf.lastDeltaMs}
                    driftLabel={driftLabel}
                    lastOfflineTicks={perf.lastOfflineTicks}
                    lastOfflineDurationMs={perf.lastOfflineDurationMs}
                    tickRate={tickRate}
                    loopInterval={state.loop.loopInterval}
                    offlineInterval={state.loop.offlineInterval}
                    activeActionLabel={activePlayer?.selectedActionId
                        ? getSkillLabel(activePlayer.selectedActionId as SkillId)
                        : "none"}
                    onSimulateOffline={handleSimulateOffline}
                    onResetSave={handleResetSave}
                    onClose={handleCloseSystem}
                />
            ) : null}
            {offlineSummary ? (
                <OfflineSummaryModal
                    summary={offlineSummary}
                    offlineSeconds={offlineSeconds}
                    players={offlinePlayers}
                    onClose={handleCloseOfflineSummary}
                    getSkillLabel={getSkillLabel}
                    getRecipeLabel={getRecipeLabel}
                />
            ) : null}
            {swUpdate ? (
                <ServiceWorkerUpdateModal
                    version={swUpdate.version}
                    onReload={handleReloadSwUpdate}
                    onClose={handleCloseSwUpdate}
                />
            ) : null}
        </div>
    );
};
