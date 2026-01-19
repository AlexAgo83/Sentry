import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
    getActionDefinition,
    getRecipeDefinition,
    getRecipesForSkill,
    isRecipeUnlocked,
    ITEM_DEFINITIONS,
    SKILL_DEFINITIONS
} from "../data/definitions";
import { MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../core/constants";
import type { ActionDefinition, SkillState } from "../core/types";
import { EquipmentSlotId, SkillId } from "../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../core/stats";
import { getEquipmentModifiers } from "../data/equipment";
import { gameRuntime, gameStore } from "./game";
import { useGameStore } from "./hooks/useGameStore";
import { usePersistedCollapse } from "./hooks/usePersistedCollapse";
import { usePersistedInventoryFilters } from "./hooks/usePersistedInventoryFilters";
import { useInventoryView } from "./hooks/useInventoryView";
import { usePendingActionSelection } from "./hooks/usePendingActionSelection";
import { useActionStatus } from "./hooks/useActionStatus";
import { formatItemListEntries, getItemListEntries } from "./ui/itemFormatters";
import { getInventoryMeta } from "./ui/inventoryMeta";
import { ITEM_USAGE_MAP } from "./ui/itemUsage";
import { AppView, type AppActiveSidePanel } from "./AppView";
import { InventoryIconSprite } from "./ui/inventoryIcons";
import { HeroNameModal } from "./components/HeroNameModal";
import { LoadoutModal } from "./components/LoadoutModal";
import { OfflineSummaryModal } from "./components/OfflineSummaryModal";
import { SafeModeModal } from "./components/SafeModeModal";
import { ServiceWorkerUpdateModal } from "./components/ServiceWorkerUpdateModal";
import { SystemModal } from "./components/SystemModal";
import type { InventorySort } from "./components/InventoryPanel";
import { useCrashReportsState } from "./hooks/useCrashReportsState";
import { useSafeModeState } from "./hooks/useSafeModeState";
import { useServiceWorkerUpdatePrompt } from "./hooks/useServiceWorkerUpdatePrompt";
import { selectActivePlayerFromPlayers, selectPlayersSortedFromPlayers } from "./selectors/gameSelectors";
import { toGameSave } from "../core/serialization";
import { createSaveEnvelopeV2, parseSaveEnvelopeOrLegacy } from "../adapters/persistence/saveEnvelope";

const INTELLECT_SKILLS = new Set<SkillId>([
    "Cooking",
    "Alchemy",
    "Herbalism",
    "Tailoring",
    "Carpentry"
]);

export const AppContainer = () => {
    const { loadReport, isSafeModeOpen, refreshLoadReport, closeSafeMode } = useSafeModeState();
    useEffect(() => {
        gameRuntime.start();
        refreshLoadReport();
        return () => gameRuntime.stop();
    }, [refreshLoadReport]);

    const { crashReports, clearCrashReports } = useCrashReportsState();
    const { swUpdate, closeSwUpdate, reloadSwUpdate } = useServiceWorkerUpdatePrompt();

    const version = useGameStore((state) => state.version);
    const activePlayerId = useGameStore((state) => state.activePlayerId);
    const playersById = useGameStore((state) => state.players);
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const offlineSummary = useGameStore((state) => state.offlineSummary);

    const activePlayer = useMemo(
        () => selectActivePlayerFromPlayers(playersById, activePlayerId),
        [activePlayerId, playersById]
    );
    const players = useMemo(() => selectPlayersSortedFromPlayers(playersById), [playersById]);

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

    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
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
    }, [activePlayer, getFirstUnlockedRecipeId]);

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

    const handleSimulateOffline = useCallback(() => {
        gameRuntime.simulateOffline(30 * 60 * 1000);
    }, []);

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

    const handleAddPlayer = useCallback(() => {
        setLoadoutOpen(false);
        setRenameOpen(false);
        setRecruitOpen(true);
    }, []);

    const handleOpenSystem = useCallback(() => {
        setSystemOpen(true);
    }, []);

    const handleSetActivePlayer = useCallback((playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
    }, []);

    const handleOpenLoadout = useCallback((playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setActiveSidePanel("action");
        setRecruitOpen(false);
        setRenameOpen(false);
        setLoadoutOpen(true);
    }, []);

    const handleOpenActiveLoadout = useCallback(() => {
        if (!activePlayer) {
            return;
        }
        handleOpenLoadout(activePlayer.id);
    }, [activePlayer, handleOpenLoadout]);

    const handleCloseLoadout = useCallback(() => {
        setLoadoutOpen(false);
    }, []);

    const handleCloseSystem = useCallback(() => {
        setSystemOpen(false);
    }, []);

    const handleToggleInventoryItem = useCallback((itemId: string) => {
        setSelectedInventoryItemId((current) => (current === itemId ? null : itemId));
    }, []);

    const handleClearInventorySelection = useCallback(() => {
        setSelectedInventoryItemId(null);
    }, []);

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

    const handleCloseRecruit = useCallback(() => {
        setRecruitOpen(false);
        setNewHeroName("");
    }, []);

    const handleOpenRename = useCallback((playerId: string) => {
        const player = gameStore.getState().players[playerId];
        if (!player) {
            return;
        }
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setRenamePlayerId(playerId);
        setRenameHeroName(player.name);
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(true);
    }, []);

    const handleOpenActiveRename = useCallback(() => {
        if (!activePlayer) {
            return;
        }
        handleOpenRename(activePlayer.id);
    }, [activePlayer, handleOpenRename]);

    const handleCloseRename = useCallback(() => {
        setRenameOpen(false);
        setRenamePlayerId(null);
        setRenameHeroName("");
    }, []);

    const handleCreateHero = useCallback(() => {
        const trimmed = newHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "addPlayer", name: trimmed });
        setRecruitOpen(false);
        setNewHeroName("");
    }, [newHeroName]);

    const handleRenameHero = useCallback(() => {
        if (!renamePlayerId) {
            return;
        }
        const trimmed = renameHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "renamePlayer", playerId: renamePlayerId, name: trimmed });
        handleCloseRename();
    }, [handleCloseRename, renameHeroName, renamePlayerId]);

    const handleCloseOfflineSummary = useCallback(() => {
        gameStore.dispatch({ type: "setOfflineSummary", summary: null });
    }, []);

    const handleResetSave = useCallback(() => {
        const confirmed = window.confirm("Reset save data? This cannot be undone.");
        if (!confirmed) {
            return;
        }
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(false);
        handleCloseOfflineSummary();
        gameRuntime.reset();
        closeSafeMode();
        refreshLoadReport();
    }, [closeSafeMode, handleCloseOfflineSummary, refreshLoadReport]);

    const handleExportSave = useCallback(() => {
        const save = toGameSave(gameStore.getState());
        const envelope = createSaveEnvelopeV2(save);
        const raw = JSON.stringify(envelope);
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(raw).catch(() => {
                window.prompt("Copy your save data:", raw);
            });
            return;
        }
        window.prompt("Copy your save data:", raw);
    }, []);

    const handleImportSave = useCallback(() => {
        const raw = window.prompt("Paste save data (JSON):", "");
        if (!raw) {
            return;
        }
        const parsed = parseSaveEnvelopeOrLegacy(raw);
        if (parsed.status === "ok" || parsed.status === "migrated" || parsed.status === "recovered_last_good") {
            gameRuntime.importSave(parsed.save);
            refreshLoadReport();
            return;
        }
        window.alert("Invalid save data.");
    }, [refreshLoadReport]);

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

    const inventoryView = useInventoryView({
        items: inventoryItems,
        definitions: ITEM_DEFINITIONS,
        getInventoryMeta,
        usageMap: ITEM_USAGE_MAP,
        sort: inventorySort,
        search: inventorySearch,
        page: inventoryPage,
        selectedItemId: selectedInventoryItemId
    });

    const selectionHint = inventoryView.selectedItem
        ? inventoryView.selectedItemIndex < 0
            ? inventoryView.normalizedSearch.length > 0
                ? "Selected item is hidden by your search."
                : "Selected item is not visible in the current list."
            : inventoryView.selectedItemPage !== inventoryView.safePage
                ? `Selected item is on page ${inventoryView.selectedItemPage}.`
                : null
        : null;
    const inventoryEmptyState = inventoryView.visibleEntries.length === 0
        ? "No items collected yet. Start actions to gather resources."
        : inventoryView.filteredEntries.length === 0
            ? "No items match your search."
            : "No items on this page.";

    useEffect(() => {
        if (inventoryPage !== inventoryView.safePage) {
            handleSetInventoryPage(inventoryView.safePage);
        }
    }, [handleSetInventoryPage, inventoryPage, inventoryView.safePage]);

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
    const activeSkillLevels = useMemo(() => SKILL_DEFINITIONS.reduce<Partial<Record<SkillId, number>>>((acc, skill) => {
        acc[skill.id] = activePlayer?.skills[skill.id]?.level ?? 0;
        return acc;
    }, {}), [activePlayer]);

    const toggleRosterCollapsed = useCallback(() => {
        setRosterCollapsed((value) => !value);
    }, [setRosterCollapsed]);
    const toggleActionCollapsed = useCallback(() => {
        setActionCollapsed((value) => !value);
    }, [setActionCollapsed]);
    const toggleStatsCollapsed = useCallback(() => {
        setStatsCollapsed((value) => !value);
    }, [setStatsCollapsed]);
    const toggleInventoryCollapsed = useCallback(() => {
        setInventoryCollapsed((value) => !value);
    }, [setInventoryCollapsed]);
    const toggleEquipmentCollapsed = useCallback(() => {
        setEquipmentCollapsed((value) => !value);
    }, [setEquipmentCollapsed]);
    const showActionPanel = useCallback(() => setActiveSidePanel("action"), []);
    const showStatsPanel = useCallback(() => setActiveSidePanel("stats"), []);
    const showInventoryPanel = useCallback(() => setActiveSidePanel("inventory"), []);
    const showEquipmentPanel = useCallback(() => setActiveSidePanel("equipment"), []);

    return (
        <div className="app-shell">
            <InventoryIconSprite />
            <AppView
                version={version}
                players={players}
                activePlayerId={activePlayerId}
                activePlayer={activePlayer}
                getSkillLabel={getSkillLabel}
                getRecipeLabel={getRecipeLabel}
                isRosterCollapsed={isRosterCollapsed}
                onToggleRosterCollapsed={toggleRosterCollapsed}
                onSetActivePlayer={handleSetActivePlayer}
                onAddPlayer={handleAddPlayer}
                onOpenSystem={handleOpenSystem}
                activeSidePanel={activeSidePanel}
                onShowAction={showActionPanel}
                onShowStats={showStatsPanel}
                onShowInventory={showInventoryPanel}
                onShowEquipment={showEquipmentPanel}
                actionPanel={{
                    activeSkillId: activeSkillId as SkillId | "",
                    activeSkillName,
                    activeRecipeLabel,
                    activeConsumptionLabel,
                    activeProductionLabel,
                    actionDurationLabel: actionIntervalLabel,
                    actionXpLabel,
                    resourceHint,
                    progressPercent,
                    styles: { progressStyle, staminaStyle, skillStyle, recipeStyle },
                    staminaPercent,
                    skillPercent,
                    recipePercent,
                    staminaCurrent: activePlayer?.stamina ?? 0,
                    staminaMax: activePlayer?.staminaMax ?? 0,
                    activeSkill: activeSkill ?? null,
                    activeRecipe: activeRecipe ?? null,
                    isStunned,
                    isCollapsed: isActionCollapsed,
                    onToggleCollapsed: toggleActionCollapsed,
                    onChangeAction: handleOpenActiveLoadout,
                    canChangeAction: Boolean(activePlayer),
                }}
                statsPanel={{
                    skillLevels: activeSkillLevels,
                    stats: statsState,
                    effectiveStats,
                    equipmentMods: equipmentModifiers,
                    now: statsNowTime,
                    isCollapsed: isStatsCollapsed,
                    onToggleCollapsed: toggleStatsCollapsed,
                    onRenameHero: handleOpenActiveRename,
                    canRenameHero: Boolean(activePlayer),
                }}
                inventoryPanel={{
                    view: inventoryView,
                    selectedItemId: selectedInventoryItemId,
                    isCollapsed: isInventoryCollapsed,
                    onToggleCollapsed: toggleInventoryCollapsed,
                    sort: inventorySort,
                    search: inventorySearch,
                    page: inventoryView.safePage,
                    onSelectItem: handleToggleInventoryItem,
                    onClearSelection: handleClearInventorySelection,
                    onSortChange: handleSetInventorySort,
                    onSearchChange: handleSetInventorySearch,
                    onPageChange: handleSetInventoryPage,
                    emptyState: inventoryEmptyState,
                    selectionHint,
                }}
                equipmentPanel={{
                    inventoryItems,
                    isCollapsed: isEquipmentCollapsed,
                    onToggleCollapsed: toggleEquipmentCollapsed,
                    onEquipItem: handleEquipItem,
                    onUnequipSlot: handleUnequipSlot,
                }}
            />
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
                <SystemModalContainer
                    version={version}
                    activePlayer={activePlayer}
                    getSkillLabel={getSkillLabel}
                    crashReports={crashReports}
                    onClearCrashReports={clearCrashReports}
                    onExportSave={handleExportSave}
                    onImportSave={handleImportSave}
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
                    onReload={reloadSwUpdate}
                    onClose={closeSwUpdate}
                />
            ) : null}
            {isSafeModeOpen ? (
                <SafeModeModal
                    report={loadReport}
                    onResetSave={handleResetSave}
                    onClose={closeSafeMode}
                />
            ) : null}
        </div>
    );
};

interface SystemModalContainerProps {
    version: string;
    activePlayer: ReturnType<typeof selectActivePlayerFromPlayers>;
    getSkillLabel: (skillId: SkillId | "") => string;
    crashReports: ReturnType<typeof useCrashReportsState>["crashReports"];
    onClearCrashReports: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onSimulateOffline: () => void;
    onResetSave: () => void;
    onClose: () => void;
}

const SystemModalContainer = (props: SystemModalContainerProps) => {
    const perf = useGameStore((state) => state.perf);
    const loop = useGameStore((state) => state.loop);

    const tickRate = (1000 / loop.loopInterval).toFixed(1);
    const hasDelta = perf.lastDeltaMs > 0;
    const driftMs = hasDelta ? perf.lastDeltaMs - loop.loopInterval : 0;
    const driftLabel = `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;

    return (
        <SystemModal
            version={props.version}
            lastTick={loop.lastTick}
            lastTickDurationMs={perf.lastTickDurationMs}
            lastDeltaMs={perf.lastDeltaMs}
            driftLabel={driftLabel}
            lastOfflineTicks={perf.lastOfflineTicks}
            lastOfflineDurationMs={perf.lastOfflineDurationMs}
            tickRate={tickRate}
            loopInterval={loop.loopInterval}
            offlineInterval={loop.offlineInterval}
            activeActionLabel={props.activePlayer?.selectedActionId
                ? props.getSkillLabel(props.activePlayer.selectedActionId as SkillId)
                : "none"}
            crashReports={props.crashReports}
            onClearCrashReports={props.onClearCrashReports}
            onExportSave={props.onExportSave}
            onImportSave={props.onImportSave}
            onSimulateOffline={props.onSimulateOffline}
            onResetSave={props.onResetSave}
            onClose={props.onClose}
        />
    );
};
