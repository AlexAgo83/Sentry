import { CSSProperties, ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
    ITEM_DEFINITIONS,
    SKILL_DEFINITIONS,
    getActionDefinition,
    getRecipeDefinition,
    getRecipeUnlockLevel,
    getRecipesForSkill,
    isRecipeUnlocked
} from "../data/definitions";
import { SkillId } from "../core/types";
import { gameRuntime, gameStore } from "./game";
import { useGameStore } from "./hooks/useGameStore";
import { ActionStatusPanel } from "./components/ActionStatusPanel";
import { CharacterStatsPanel } from "./components/CharacterStatsPanel";
import { InventoryPanel, type InventoryEntry, type InventorySort } from "./components/InventoryPanel";
import { RosterPanel } from "./components/RosterPanel";
import { getInventoryMeta } from "./ui/inventoryMeta";
import { InventoryIconSprite } from "./ui/inventoryIcons";
import { ITEM_USAGE_MAP } from "./ui/itemUsage";
import "./styles/app.css";

export const App = () => {
    useEffect(() => {
        gameRuntime.start();
        return () => gameRuntime.stop();
    }, []);

    const state = useGameStore((gameState) => gameState);
    const activePlayer = state.activePlayerId ? state.players[state.activePlayerId] : null;
    const activeSkillId = activePlayer?.selectedActionId ?? "";
    const activeSkill = activeSkillId ? activePlayer?.skills[activeSkillId] : null;
    const activeRecipeId = activeSkill?.selectedRecipeId ?? "";
    const activeRecipe = activeRecipeId ? activeSkill?.recipes[activeRecipeId] : null;
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
    const [isRosterCollapsed, setRosterCollapsed] = useState(false);
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isInventoryCollapsed, setInventoryCollapsed] = useState(false);
    const [isStatsCollapsed, setStatsCollapsed] = useState(false);
    const [activeSidePanel, setActiveSidePanel] = useState<"status" | "inventory">("status");
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const [inventorySort, setInventorySort] = useState<InventorySort>("Name");
    const [inventorySearch, setInventorySearch] = useState("");
    const [inventoryPage, setInventoryPage] = useState(1);
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
        if (!isLoadoutOpen && !isRecruitOpen && !isRenameOpen && !isSystemOpen && !offlineSummary) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setLoadoutOpen(false);
                setRecruitOpen(false);
                setRenameOpen(false);
                setSystemOpen(false);
                handleCloseOfflineSummary();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoadoutOpen, isRecruitOpen, isRenameOpen, isSystemOpen, offlineSummary]);

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

    const handleOpenInventory = () => {
        setInventoryCollapsed(false);
        setActiveSidePanel("inventory");
    };

    const handleOpenSystem = () => {
        setSystemOpen(true);
    };

    const handleSetActivePlayer = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setActiveSidePanel("status");
    };

    const handleOpenLoadout = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setActiveSidePanel("status");
        setRecruitOpen(false);
        setRenameOpen(false);
        setLoadoutOpen(true);
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

    const pendingSkill = pendingSkillId && activePlayer
        ? activePlayer.skills[pendingSkillId as SkillId]
        : null;
    const pendingSkillLabel = pendingSkillId ? getSkillLabel(pendingSkillId as SkillId) : "None";
    const pendingRecipeLabel = pendingSkillId && pendingRecipeId
        ? getRecipeDefinition(pendingSkillId as SkillId, pendingRecipeId)?.name ?? pendingRecipeId
        : "None";
    const pendingRecipeDef = pendingSkillId && pendingRecipeId
        ? getRecipeDefinition(pendingSkillId as SkillId, pendingRecipeId)
        : null;
    const pendingRecipeUnlocked = Boolean(
        pendingRecipeDef && pendingSkill && isRecipeUnlocked(pendingRecipeDef, pendingSkill.level)
    );
    const inventoryItems = state.inventory.items;
    const inventoryEntries = useMemo<InventoryEntry[]>(() => ITEM_DEFINITIONS.map((item) => ({
        ...item,
        count: inventoryItems[item.id] ?? 0,
        ...getInventoryMeta(item.id),
        ...ITEM_USAGE_MAP[item.id]
    })), [inventoryItems]);
    const inventoryVisibleEntries = useMemo(
        () => inventoryEntries.filter((item) => item.count > 0),
        [inventoryEntries]
    );
    const normalizedInventorySearch = inventorySearch.trim().toLowerCase();
    const inventoryFilteredEntries = useMemo(
        () => inventoryVisibleEntries.filter((item) => (
            normalizedInventorySearch.length === 0
            || item.name.toLowerCase().includes(normalizedInventorySearch)
        )),
        [inventoryVisibleEntries, normalizedInventorySearch]
    );
    const inventorySortedEntries = useMemo(() => {
        const sorted = [...inventoryFilteredEntries];
        if (inventorySort === "Count") {
            sorted.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.name.localeCompare(b.name);
            });
            return sorted;
        }
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        return sorted;
    }, [inventoryFilteredEntries, inventorySort]);
    const inventoryPageSize = 36;
    const inventoryPageCount = Math.max(1, Math.ceil(inventorySortedEntries.length / inventoryPageSize));
    const safeInventoryPage = Math.min(inventoryPage, inventoryPageCount);
    const inventoryPageEntries = useMemo(
        () => inventorySortedEntries.slice(
            (safeInventoryPage - 1) * inventoryPageSize,
            safeInventoryPage * inventoryPageSize
        ),
        [inventorySortedEntries, safeInventoryPage]
    );
    const selectedInventoryItem = selectedInventoryItemId
        ? inventoryEntries.find((item) => item.id === selectedInventoryItemId) ?? null
        : null;
    const selectedItemIndex = selectedInventoryItemId
        ? inventorySortedEntries.findIndex((item) => item.id === selectedInventoryItemId)
        : -1;
    const selectedItemPage = selectedItemIndex >= 0
        ? Math.floor(selectedItemIndex / inventoryPageSize) + 1
        : null;
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
        setInventoryPage(1);
    }, [inventorySort, inventorySearch]);

    useEffect(() => {
        if (inventoryPage !== safeInventoryPage) {
            setInventoryPage(safeInventoryPage);
        }
    }, [inventoryPage, safeInventoryPage]);
    const formatItemDeltas = (deltas: Record<string, number>): string => {
        const entries = ITEM_DEFINITIONS
            .map((item) => ({
                name: item.name,
                amount: deltas[item.id] ?? 0
            }))
            .filter((entry) => entry.amount !== 0);
        if (entries.length === 0) {
            return "None";
        }
        return entries
            .map((entry) => `${entry.amount > 0 ? "+" : ""}${entry.amount} ${entry.name}`)
            .join(", ");
    };
    const formatItemList = (items?: Record<string, number>): string => {
        if (!items) {
            return "None";
        }
        const entries = ITEM_DEFINITIONS
            .map((item) => ({
                name: item.name,
                amount: items[item.id] ?? 0
            }))
            .filter((entry) => entry.amount > 0);
        if (entries.length === 0) {
            return "None";
        }
        return entries.map((entry) => `${entry.amount} ${entry.name}`).join(", ");
    };
    const pendingActionDef = pendingSkillId ? getActionDefinition(pendingSkillId as SkillId) : null;
    const pendingItemCosts = pendingRecipeDef?.itemCosts ?? pendingActionDef?.itemCosts;
    const pendingItemRewards = pendingRecipeDef?.itemRewards ?? pendingActionDef?.itemRewards;
    const pendingGoldReward = pendingRecipeDef?.goldReward ?? pendingActionDef?.goldReward ?? 0;
    const pendingRewardsWithGold = pendingItemRewards
        ? { ...pendingItemRewards, ...(pendingGoldReward ? { gold: pendingGoldReward } : {}) }
        : pendingGoldReward
            ? { gold: pendingGoldReward }
            : undefined;
    const hasPendingSelection = Boolean(pendingSkillId && pendingRecipeId);
    const pendingConsumptionLabel = hasPendingSelection ? formatItemList(pendingItemCosts) : "None";
    const pendingProductionLabel = hasPendingSelection ? formatItemList(pendingRewardsWithGold) : "None";
    const missingItems = pendingItemCosts
        ? Object.entries(pendingItemCosts)
            .map(([itemId, amount]) => {
                const available = inventoryItems[itemId] ?? 0;
                const needed = amount - available;
                return needed > 0 ? { itemId, needed } : null;
            })
            .filter((entry): entry is { itemId: string; needed: number } => entry !== null)
        : [];
    const missingItemsLabel = missingItems.length > 0
        ? `Missing: ${missingItems.map((entry) => `${itemNameById[entry.itemId] ?? entry.itemId} x${entry.needed}`).join(", ")}`
        : "";
    const isRunningSelection = Boolean(activePlayer?.selectedActionId)
        && pendingSkillId === activeSkillId
        && pendingRecipeId === activeRecipeId;
    const canStartAction = Boolean(
        activePlayer
        && pendingSkillId
        && pendingRecipeId
        && pendingRecipeUnlocked
        && !isRunningSelection
        && missingItems.length === 0
    );
    const activeActionDef = activeSkillId ? getActionDefinition(activeSkillId as SkillId) : null;
    const activeRecipeDef = activeSkillId && activeRecipeId
        ? getRecipeDefinition(activeSkillId as SkillId, activeRecipeId)
        : null;
    const activeCosts = activeRecipeDef?.itemCosts ?? activeActionDef?.itemCosts;
    const activeRewards = activeRecipeDef?.itemRewards ?? activeActionDef?.itemRewards;
    const activeGoldReward = activeRecipeDef?.goldReward ?? activeActionDef?.goldReward ?? 0;
    const activeRewardsWithGold = activeRewards
        ? { ...activeRewards, ...(activeGoldReward ? { gold: activeGoldReward } : {}) }
        : activeGoldReward
            ? { gold: activeGoldReward }
            : undefined;
    const hasActiveRecipeSelection = Boolean(activeSkillId && activeRecipeId);
    const activeRecipeLabel = hasActiveRecipeSelection && activeSkillId
        ? getRecipeLabel(activeSkillId as SkillId, activeRecipeId)
        : "None";
    const activeConsumptionLabel = hasActiveRecipeSelection ? formatItemList(activeCosts) : "None";
    const activeProductionLabel = hasActiveRecipeSelection ? formatItemList(activeRewardsWithGold) : "None";
    const resourceHint = hasActiveRecipeSelection ? null : "Select a recipe to see resource flow.";

    const progressPercent = activePlayer?.actionProgress.progressPercent ?? 0;
    const progressStyle = { "--progress": `${progressPercent}%` } as CSSProperties;
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
    const offlineSeconds = offlineSummary ? Math.round(offlineSummary.durationMs / 1000) : 0;
    const offlinePlayers = offlineSummary?.players ?? [];
    const activeSkillName = activeSkillId ? getSkillLabel(activeSkillId as SkillId) : "None";
    const skillIconMap: Record<string, string> = {
        Combat: "#f2c14e",
        Hunting: "#5dd9c1",
        Cooking: "#f07f4f",
        Excavation: "#9aa7c3",
        MetalWork: "#c68130",
        Alchemy: "#7fd1b9",
        Herbalism: "#8ac926",
        Tailoring: "#f4d35e",
        Fishing: "#4cc9f0",
        Carpentry: "#c97c5d",
        Leatherworking: "#a26769"
    };
    const skillIconColor = activeSkillId ? skillIconMap[activeSkillId] ?? "#f2c14e" : "#5d6a82";
    const activeSkillLevels = useMemo(() => SKILL_DEFINITIONS.reduce<Partial<Record<SkillId, number>>>((acc, skill) => {
        acc[skill.id] = activePlayer?.skills[skill.id]?.level ?? 0;
        return acc;
    }, {}), [activePlayer]);

    return (
        <div className="app-shell">
            <InventoryIconSprite />
            <header className="app-header">
                <div className="app-title-block">
                    <p className="app-kicker">Rewrite Initiative</p>
                    <h1 className="app-title">Sentry Idle</h1>
                    <p className="app-subtitle">Forge, hunt, and master your path.</p>
                </div>
                <div className="app-version-tag">{state.version}</div>
            </header>
            <main className="app-layout generic-global ts-layout">
                <RosterPanel
                    players={players}
                    activePlayerId={state.activePlayerId}
                    isCollapsed={isRosterCollapsed}
                    onToggleCollapsed={() => setRosterCollapsed((value) => !value)}
                    onSetActivePlayer={handleSetActivePlayer}
                    onOpenLoadout={handleOpenLoadout}
                    onOpenRename={handleOpenRename}
                    onAddPlayer={handleAddPlayer}
                    onOpenInventory={handleOpenInventory}
                    onOpenSystem={handleOpenSystem}
                    getSkillLabel={getSkillLabel}
                    getRecipeLabel={getRecipeLabel}
                />
                {activeSidePanel === "status" ? (
                    <>
                        <ActionStatusPanel
                            activeSkillId={activeSkillId as SkillId | ""}
                            activeSkillName={activeSkillName}
                            activeRecipeLabel={activeRecipeLabel}
                            activeConsumptionLabel={activeConsumptionLabel}
                            activeProductionLabel={activeProductionLabel}
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
                        />
                        <CharacterStatsPanel
                            skills={SKILL_DEFINITIONS}
                            skillLevels={activeSkillLevels}
                            isCollapsed={isStatsCollapsed}
                            onToggleCollapsed={() => setStatsCollapsed((value) => !value)}
                        />
                    </>
                ) : null}
                {activeSidePanel === "inventory" ? (
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
                        onSortChange={setInventorySort}
                        search={inventorySearch}
                        onSearchChange={setInventorySearch}
                        page={safeInventoryPage}
                        pageCount={inventoryPageCount}
                        onPageChange={setInventoryPage}
                        totalItems={inventoryVisibleEntries.length}
                        emptyState={inventoryEmptyState}
                        selectionHint={selectionHint}
                    />
                ) : null}
            </main>
            {isLoadoutOpen && activePlayer ? (
                <div className="ts-modal-backdrop" role="dialog" aria-modal="true" onClick={handleCloseLoadout}>
                    <div className="ts-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="ts-modal-header">
                            <div>
                                <p className="ts-modal-kicker">Loadout</p>
                                <h2 className="ts-modal-title">{activePlayer.name}</h2>
                            </div>
                            <button type="button" className="ts-modal-close ts-focusable" onClick={handleCloseLoadout}>
                                Close
                            </button>
                        </div>
                        <div className="ts-field-group">
                            <label className="ts-field-label" htmlFor="skill-select">Select skill</label>
                            <select
                                id="skill-select"
                                className="generic-field select ts-focusable"
                                value={pendingSkillId}
                                onChange={handleSkillChange}
                            >
                                <option value="">Choose a path</option>
                                {SKILL_DEFINITIONS.map((skill) => (
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
                                onChange={handleRecipeChange}
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
                                    <span className="ts-action-summary-label">Action</span>
                                    <span className="ts-action-summary-value">{pendingSkillLabel}</span>
                                </div>
                                <div className="ts-action-summary-row">
                                    <span className="ts-action-summary-label">Recipe</span>
                                    <span className="ts-action-summary-value">{pendingRecipeLabel}</span>
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
                                    onClick={handleStartAction}
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
                                    onClick={handleStopAction}
                                    disabled={!activePlayer.selectedActionId}
                                >
                                    Pause action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
            {isRecruitOpen ? (
                <div className="ts-modal-backdrop" role="dialog" aria-modal="true" onClick={handleCloseRecruit}>
                    <div className="ts-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="ts-modal-header">
                            <div>
                                <p className="ts-modal-kicker">Recruit</p>
                                <h2 className="ts-modal-title">New hero</h2>
                            </div>
                            <button type="button" className="ts-modal-close ts-focusable" onClick={handleCloseRecruit}>
                                Close
                            </button>
                        </div>
                        <div className="ts-field-group">
                            <label className="ts-field-label" htmlFor="hero-name">Hero name</label>
                            <input
                                id="hero-name"
                                className="generic-field input ts-input ts-focusable"
                                value={newHeroName}
                                onChange={(event) => setNewHeroName(event.target.value)}
                                maxLength={20}
                                placeholder="Up to 20 characters"
                            />
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-focusable"
                                    onClick={handleCreateHero}
                                    disabled={newHeroName.trim().length === 0}
                                >
                                    Create hero
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
            {isRenameOpen ? (
                <div className="ts-modal-backdrop" role="dialog" aria-modal="true" onClick={handleCloseRename}>
                    <div className="ts-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="ts-modal-header">
                            <div>
                                <p className="ts-modal-kicker">Set name</p>
                                <h2 className="ts-modal-title">Rename hero</h2>
                            </div>
                            <button type="button" className="ts-modal-close ts-focusable" onClick={handleCloseRename}>
                                Close
                            </button>
                        </div>
                        <div className="ts-field-group">
                            <label className="ts-field-label" htmlFor="hero-rename">Hero name</label>
                            <input
                                id="hero-rename"
                                className="generic-field input ts-input ts-focusable"
                                value={renameHeroName}
                                onChange={(event) => setRenameHeroName(event.target.value)}
                                maxLength={20}
                                placeholder="Up to 20 characters"
                            />
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-focusable"
                                    onClick={handleRenameHero}
                                    disabled={renameHeroName.trim().length === 0}
                                >
                                    Save name
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
            {isSystemOpen ? (
                <div className="ts-modal-backdrop" role="dialog" aria-modal="true" onClick={handleCloseSystem}>
                    <div className="ts-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="ts-modal-header">
                            <div>
                                <p className="ts-modal-kicker">System</p>
                                <h2 className="ts-modal-title">Telemetry</h2>
                            </div>
                            <button type="button" className="ts-modal-close ts-focusable" onClick={handleCloseSystem}>
                                Close
                            </button>
                        </div>
                        <ul className="ts-list">
                            <li>Version: {state.version}</li>
                            <li>Last tick: {state.loop.lastTick ?? "awaiting"}</li>
                            <li>Tick duration: {perf.lastTickDurationMs.toFixed(2)}ms</li>
                            <li>Last delta: {perf.lastDeltaMs}ms (drift {driftLabel}ms)</li>
                            <li>Offline catch-up: {perf.lastOfflineTicks} ticks / {perf.lastOfflineDurationMs}ms</li>
                            <li>Expected tick rate: {tickRate}/s</li>
                            <li>Loop interval: {state.loop.loopInterval}ms</li>
                            <li>Offline interval: {state.loop.offlineInterval}ms</li>
                            <li>
                                Active action: {activePlayer?.selectedActionId
                                    ? getSkillLabel(activePlayer.selectedActionId as SkillId)
                                    : "none"}
                            </li>
                        </ul>
                        <div className="ts-action-row ts-system-actions">
                            <button
                                type="button"
                                className="generic-field button ts-simulate ts-focusable"
                                onClick={handleSimulateOffline}
                            >
                                Simulate +30 min
                            </button>
                        </div>
                        <div className="ts-action-row ts-system-actions">
                            <button
                                type="button"
                                className="generic-field button ts-reset ts-focusable"
                                onClick={handleResetSave}
                            >
                                Reset save
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            {offlineSummary ? (
                <div
                    className="ts-modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={handleCloseOfflineSummary}
                >
                    <div className="ts-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="ts-modal-header">
                            <div>
                                <p className="ts-modal-kicker">Offline recap</p>
                                <h2 className="ts-modal-title">Your party</h2>
                            </div>
                            <button type="button" className="ts-modal-close ts-focusable" onClick={handleCloseOfflineSummary}>
                                Close
                            </button>
                        </div>
                        <ul className="ts-list">
                            <li>Time away: {offlineSeconds}s</li>
                            <li>Ticks processed: {offlineSummary.ticks}</li>
                            <li>Players summarized: {offlinePlayers.length}</li>
                            <li>Inventory changes: {formatItemDeltas(offlineSummary.totalItemDeltas)}</li>
                        </ul>
                        <div className="ts-offline-players">
                            {offlinePlayers.map((player) => {
                                const actionLabel = player.actionId
                                    ? `Action ${getSkillLabel(player.actionId as SkillId)}${player.recipeId ? ` - Recipe ${getRecipeLabel(player.actionId as SkillId, player.recipeId)}` : ""}`
                                    : "No action running";
                                const skillLevelLabel = player.skillLevelGained > 0
                                    ? ` - +${player.skillLevelGained} Lv`
                                    : "";
                                const recipeLevelLabel = player.recipeLevelGained > 0
                                    ? ` - +${player.recipeLevelGained} Lv`
                                    : "";
                                const itemLabel = formatItemDeltas(player.itemDeltas);

                                return (
                                    <div key={player.playerId} className="ts-offline-player">
                                        <div className="ts-offline-name">{player.playerName}</div>
                                        <div className="ts-offline-meta">{actionLabel}</div>
                                        <div className="ts-offline-gains">
                                            Items: {itemLabel}
                                        </div>
                                        <div className="ts-offline-gains">
                                            Skill +{player.skillXpGained} XP{skillLevelLabel} - Recipe +{player.recipeXpGained} XP{recipeLevelLabel}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
