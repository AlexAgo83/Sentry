import { CSSProperties, ChangeEvent, useEffect, useState } from "react";
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
import { getInventoryMeta } from "./inventoryMeta";
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
    const players = Object.values(state.players).slice().sort((a, b) => Number(a.id) - Number(b.id));
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
    const [activeSidePanel, setActiveSidePanel] = useState<"status" | "inventory">("status");
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const skillNameById = SKILL_DEFINITIONS.reduce<Record<string, string>>((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
    }, {});
    const getSkillLabel = (skillId: SkillId | ""): string => {
        if (!skillId) {
            return "None";
        }
        return skillNameById[skillId] ?? skillId;
    };
    const getRecipeLabel = (skillId: SkillId, recipeId: string | null): string => {
        if (!recipeId) {
            return "none";
        }
        const recipeDef = getRecipeDefinition(skillId, recipeId);
        return recipeDef?.name ?? recipeId;
    };
    const getFirstUnlockedRecipeId = (skillId: SkillId, skillLevel: number): string => {
        return getRecipesForSkill(skillId).find((recipe) => isRecipeUnlocked(recipe, skillLevel))?.id ?? "";
    };

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
    }, [activePlayer?.id, activeSkillId]);

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
    }, [isLoadoutOpen, activePlayer?.id, activePlayer?.selectedActionId]);

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
    const itemNameById = ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
    }, {});
    const inventoryEntries = ITEM_DEFINITIONS.map((item) => ({
        ...item,
        count: inventoryItems[item.id] ?? 0,
        ...getInventoryMeta(item.id)
    }));
    const inventoryGridEntries = inventoryEntries.filter((item) => item.count > 0);
    const selectedInventoryItem = selectedInventoryItemId
        ? inventoryEntries.find((item) => item.id === selectedInventoryItemId) ?? null
        : null;
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
    const skillIconLabel = activeSkillId ? activeSkillName.slice(0, 2).toUpperCase() : "--";
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

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="app-title-block">
                    <p className="app-kicker">Rewrite Initiative</p>
                    <h1 className="app-title">Sentry Idle</h1>
                    <p className="app-subtitle">Forge, hunt, and master your path.</p>
                </div>
                <div className="app-version-tag">{state.version}</div>
            </header>
            <main className="app-layout generic-global ts-layout">
                <section className="generic-panel ts-panel">
                    <div className="ts-panel-header">
                        <h2 className="ts-panel-title">Roster</h2>
                        <span className="ts-panel-meta">{players.length} heroes</span>
                        <button
                            type="button"
                            className="ts-collapse-button"
                            onClick={() => setRosterCollapsed((value) => !value)}
                        >
                            {isRosterCollapsed ? "Expand" : "Collapse"}
                        </button>
                    </div>
                    {!isRosterCollapsed ? (
                        <>
                            <div className="ts-player-list">
                                {players.map((player) => {
                                    const currentAction = player.selectedActionId;
                                    const currentSkill = currentAction ? player.skills[currentAction] : null;
                                    const currentRecipe = currentSkill?.selectedRecipeId ?? null;
                                    const actionLabel = currentAction ? getSkillLabel(currentAction) : "";
                                    const recipeLabel = currentAction && currentRecipe
                                        ? getRecipeLabel(currentAction, currentRecipe)
                                        : null;
                                    const metaLabel = currentAction
                                        ? `Action ${actionLabel}${recipeLabel ? ` - Recipe ${recipeLabel}` : " - Recipe none"}`
                                        : "No action selected";

                                    return (
                                        <div
                                            key={player.id}
                                            className={`ts-player-card ${player.id === state.activePlayerId ? "is-active" : ""}`}
                                            onClick={() => handleSetActivePlayer(player.id)}
                                        >
                                            <div className="ts-player-info">
                                                <span className="ts-player-name">{player.name}</span>
                                                <span className="ts-player-meta">{metaLabel}</span>
                                            </div>
                                            <div className="ts-player-actions">
                                                <button
                                                    type="button"
                                                    className="ts-icon-button is-action"
                                                    onClick={() => handleOpenLoadout(player.id)}
                                                    aria-label={`Manage actions for ${player.name}`}
                                                    title="Manage actions"
                                                >
                                                    Act
                                                </button>
                                                <button
                                                    type="button"
                                                    className="ts-icon-button"
                                                    onClick={() => handleOpenRename(player.id)}
                                                    aria-label={`Set name for ${player.name}`}
                                                    title="Set name"
                                                >
                                                    Set
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button type="button" className="generic-field button ts-add-player" onClick={handleAddPlayer}>
                                Recruit new hero
                            </button>
                            <button
                                type="button"
                                className="generic-field button ts-add-player ts-inventory-toggle"
                                onClick={() => {
                                    setInventoryCollapsed(false);
                                    setActiveSidePanel("inventory");
                                }}
                            >
                                Inventory
                            </button>
                            <button
                                type="button"
                                className="generic-field button ts-add-player ts-system-toggle"
                                onClick={() => setSystemOpen(true)}
                            >
                                System
                            </button>
                        </>
                    ) : null}
                </section>
                {activeSidePanel === "status" ? (
                    <>
                        <section className="generic-panel ts-panel">
                        <div className="ts-panel-header">
                            <h2 className="ts-panel-title">Action status</h2>
                            <span className="ts-panel-meta">Live loop</span>
                        </div>
                        <div className="ts-skill-card">
                            <div className="ts-skill-icon" style={{ borderColor: skillIconColor }} aria-hidden="true">
                                <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
                                    <rect x="6" y="6" width="52" height="52" rx="12" fill="none" stroke={skillIconColor} strokeWidth="4" />
                                    <path d="M18 38 L32 14 L46 38 Z" fill={skillIconColor} opacity="0.5" />
                                    <circle cx="32" cy="38" r="10" fill={skillIconColor} opacity="0.85" />
                                    <text
                                        x="32"
                                        y="42"
                                        textAnchor="middle"
                                        fontSize="12"
                                        fill="#0b0f1d"
                                        fontFamily="var(--display-font)"
                                    >
                                        {skillIconLabel}
                                    </text>
                                </svg>
                            </div>
                            <div className="ts-skill-copy">
                                <div className="ts-skill-label">Selected skill</div>
                                <div className="ts-skill-name">{activeSkillName}</div>
                            </div>
                        </div>
                        <div className="ts-resource-card">
                            <div className="ts-resource-row">
                                <span className="ts-resource-label">Recipe</span>
                                <span className="ts-resource-value">{activeRecipeLabel}</span>
                            </div>
                            <div className="ts-resource-row">
                                <span className="ts-resource-label">Consumes</span>
                                <span className="ts-resource-value">{activeConsumptionLabel}</span>
                            </div>
                            <div className="ts-resource-row">
                                <span className="ts-resource-label">Produces</span>
                                <span className="ts-resource-value">{activeProductionLabel}</span>
                            </div>
                            {resourceHint ? (
                                <div className="ts-resource-hint">{resourceHint}</div>
                            ) : null}
                        </div>
                        <div
                            className={`generic-field panel progress-row ts-progress-row ts-progress-action${isStunned ? " is-stunned" : ""}`}
                            style={progressStyle}
                        >
                            <span className="ts-progress-label">
                                Progress {progressPercent.toFixed(1)}%
                            </span>
                        </div>
                        <progress
                            className={`generic-field progress ts-progress-action${isStunned ? " is-stunned" : ""}`}
                            max={100}
                            value={progressPercent}
                        />
                        <div
                            className="generic-field panel progress-row ts-progress-row ts-progress-stamina"
                            style={staminaStyle}
                        >
                            <span className="ts-progress-label">
                                Stamina {activePlayer?.stamina ?? 0}/{activePlayer?.staminaMax ?? 0}
                            </span>
                        </div>
                        <progress
                            className="generic-field progress ts-progress-stamina"
                            max={100}
                            value={staminaPercent}
                        />
                        <div
                            className="generic-field panel progress-row ts-progress-row ts-progress-skill"
                            style={skillStyle}
                        >
                            <span className="ts-progress-label">
                                Skill Lv {activeSkill?.level ?? 0} - XP {activeSkill?.xp ?? 0}/{activeSkill?.xpNext ?? 0}
                            </span>
                        </div>
                        <progress
                            className="generic-field progress ts-progress-skill"
                            max={100}
                            value={skillPercent}
                        />
                        <div
                            className="generic-field panel progress-row ts-progress-row ts-progress-recipe"
                            style={recipeStyle}
                        >
                            <span className="ts-progress-label">
                                Recipe Lv {activeRecipe?.level ?? 0} - XP {activeRecipe?.xp ?? 0}/{activeRecipe?.xpNext ?? 0}
                            </span>
                        </div>
                        <progress
                            className="generic-field progress ts-progress-recipe"
                            max={100}
                            value={recipePercent}
                        />
                        </section>
                        <section className="generic-panel ts-panel">
                            <div className="ts-panel-header">
                                <h2 className="ts-panel-title">Character stats</h2>
                                <span className="ts-panel-meta">Focused hero</span>
                            </div>
                            <div className="ts-stat-grid">
                                {SKILL_DEFINITIONS.map((skill) => {
                                    const level = activePlayer?.skills[skill.id]?.level ?? 0;
                                    return (
                                        <div key={skill.id} className="ts-stat">
                                            <div className="ts-stat-label">{skill.name}</div>
                                            <div className="ts-stat-value">Lv {level}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="ts-stat-placeholder">Statistics overview coming soon.</div>
                        </section>
                    </>
                ) : null}
                {activeSidePanel === "inventory" ? (
                    <section className="generic-panel ts-panel ts-inventory-panel">
                        <div className="ts-panel-header">
                            <h2 className="ts-panel-title">Inventory</h2>
                            <span className="ts-panel-meta">Shared stash</span>
                            <button
                                type="button"
                                className="ts-collapse-button"
                                onClick={() => setInventoryCollapsed((value) => !value)}
                            >
                                {isInventoryCollapsed ? "Expand" : "Collapse"}
                            </button>
                        </div>
                        {!isInventoryCollapsed ? (
                            <div className="ts-inventory-layout">
                                <div className="ts-inventory-grid">
                                    {inventoryGridEntries.length > 0 ? (
                                        inventoryGridEntries.map((item) => {
                                            const isSelected = item.id === selectedInventoryItemId;
                                            const slotClassName = isSelected
                                                ? "ts-inventory-slot is-selected"
                                                : "ts-inventory-slot";
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    className={slotClassName}
                                                    aria-pressed={isSelected}
                                                    aria-label={`${item.name} x${item.count}`}
                                                    title={`${item.name} x${item.count}`}
                                                    onClick={() => handleToggleInventoryItem(item.id)}
                                                >
                                                    {item.icon}
                                                    <span className="ts-inventory-count">{item.count}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="ts-inventory-empty">No items yet.</div>
                                    )}
                                </div>
                                <div className="ts-inventory-focus">
                                    <div className="ts-inventory-focus-header">
                                        <h3 className="ts-inventory-focus-title">
                                            {selectedInventoryItem ? selectedInventoryItem.name : "No item selected"}
                                        </h3>
                                        {selectedInventoryItem ? (
                                            <button
                                                type="button"
                                                className="generic-field button ts-inventory-clear"
                                                onClick={handleClearInventorySelection}
                                            >
                                                Clear
                                            </button>
                                        ) : null}
                                    </div>
                                    <div className="ts-inventory-focus-count">
                                        Count: {selectedInventoryItem ? selectedInventoryItem.count : "--"}
                                    </div>
                                    <p className="ts-inventory-focus-copy">
                                        {selectedInventoryItem
                                            ? selectedInventoryItem.description
                                            : "Select an item to view details."}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </section>
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
                            <button type="button" className="ts-modal-close" onClick={handleCloseLoadout}>
                                Close
                            </button>
                        </div>
                        <div className="ts-field-group">
                            <label className="ts-field-label" htmlFor="skill-select">Select skill</label>
                            <select
                                id="skill-select"
                                className="generic-field select"
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
                                className="generic-field select"
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
                                    className="generic-field button"
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
                                    className="generic-field button ts-stop"
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
                            <button type="button" className="ts-modal-close" onClick={handleCloseRecruit}>
                                Close
                            </button>
                        </div>
                        <div className="ts-field-group">
                            <label className="ts-field-label" htmlFor="hero-name">Hero name</label>
                            <input
                                id="hero-name"
                                className="generic-field input ts-input"
                                value={newHeroName}
                                onChange={(event) => setNewHeroName(event.target.value)}
                                maxLength={20}
                                placeholder="Up to 20 characters"
                            />
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button"
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
                            <button type="button" className="ts-modal-close" onClick={handleCloseRename}>
                                Close
                            </button>
                        </div>
                        <div className="ts-field-group">
                            <label className="ts-field-label" htmlFor="hero-rename">Hero name</label>
                            <input
                                id="hero-rename"
                                className="generic-field input ts-input"
                                value={renameHeroName}
                                onChange={(event) => setRenameHeroName(event.target.value)}
                                maxLength={20}
                                placeholder="Up to 20 characters"
                            />
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button"
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
                            <button type="button" className="ts-modal-close" onClick={handleCloseSystem}>
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
                                className="generic-field button ts-simulate"
                                onClick={handleSimulateOffline}
                            >
                                Simulate +30 min
                            </button>
                        </div>
                        <div className="ts-action-row ts-system-actions">
                            <button
                                type="button"
                                className="generic-field button ts-reset"
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
                            <button type="button" className="ts-modal-close" onClick={handleCloseOfflineSummary}>
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
