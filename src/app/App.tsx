import { CSSProperties, ChangeEvent, useEffect, useState } from "react";
import { SKILL_DEFINITIONS } from "../data/definitions";
import { SkillId } from "../core/types";
import { gameRuntime, gameStore } from "./game";
import { useGameStore } from "./hooks/useGameStore";
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
    const [newHeroName, setNewHeroName] = useState("");

    useEffect(() => {
        if (!activePlayer || !activeSkillId) {
            return;
        }
        const skill = activePlayer.skills[activeSkillId];
        if (!skill || skill.selectedRecipeId) {
            return;
        }
        const recipeIds = Object.keys(skill.recipes);
        if (recipeIds.length > 0) {
            gameStore.dispatch({
                type: "selectRecipe",
                playerId: activePlayer.id,
                skillId: activeSkillId,
                recipeId: recipeIds[0]
            });
        }
    }, [activePlayer?.id, activeSkillId]);

    useEffect(() => {
        if (!isLoadoutOpen && !isRecruitOpen && !offlineSummary) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setLoadoutOpen(false);
                setRecruitOpen(false);
                handleCloseOfflineSummary();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoadoutOpen, isRecruitOpen, offlineSummary]);

    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        setLoadoutOpen(false);
        setRecruitOpen(false);
    }, [offlineSummary]);

    const handleSkillChange = (event: ChangeEvent<HTMLSelectElement>) => {
        if (!activePlayer) {
            return;
        }
        const nextSkillId = event.target.value as SkillId;
        if (!nextSkillId) {
            gameStore.dispatch({
                type: "selectAction",
                playerId: activePlayer.id,
                actionId: null
            });
            return;
        }
        gameStore.dispatch({
            type: "selectAction",
            playerId: activePlayer.id,
            actionId: nextSkillId
        });
        const nextSkill = activePlayer.skills[nextSkillId];
        if (!nextSkill) {
            return;
        }
        const nextRecipeId = nextSkill.selectedRecipeId ?? Object.keys(nextSkill.recipes)[0];
        if (nextRecipeId) {
            gameStore.dispatch({
                type: "selectRecipe",
                playerId: activePlayer.id,
                skillId: nextSkillId,
                recipeId: nextRecipeId
            });
        }
    };

    const handleRecipeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        if (!activePlayer || !activeSkill) {
            return;
        }
        const nextRecipeId = event.target.value || null;
        gameStore.dispatch({
            type: "selectRecipe",
            playerId: activePlayer.id,
            skillId: activeSkill.id,
            recipeId: nextRecipeId
        });
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

    const handleAddPlayer = () => {
        setLoadoutOpen(false);
        setRecruitOpen(true);
    };

    const handleSetActivePlayer = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
    };

    const handleOpenLoadout = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
        setRecruitOpen(false);
        setLoadoutOpen(true);
    };

    const handleCloseLoadout = () => {
        setLoadoutOpen(false);
    };

    const handleCloseRecruit = () => {
        setRecruitOpen(false);
        setNewHeroName("");
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
        handleCloseOfflineSummary();
        gameRuntime.reset();
    };

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
                    </div>
                    <div className="ts-player-list">
                        {players.map((player) => {
                            const currentAction = player.selectedActionId;
                            const currentSkill = currentAction ? player.skills[currentAction] : null;
                            const currentRecipe = currentSkill?.selectedRecipeId ?? null;
                            const metaLabel = currentAction
                                ? `Action ${currentAction}${currentRecipe ? ` · Recipe ${currentRecipe}` : " · Recipe none"}`
                                : "No action selected";

                            return (
                                <div
                                    key={player.id}
                                    className={`ts-player-card ${player.id === state.activePlayerId ? "is-active" : ""}`}
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
                                            onClick={() => handleSetActivePlayer(player.id)}
                                            aria-label={`Select ${player.name}`}
                                            title="Select player"
                                        >
                                            Sel
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button type="button" className="generic-field button ts-add-player" onClick={handleAddPlayer}>
                        Recruit new hero
                    </button>
                </section>
                <section className="generic-panel ts-panel">
                    <div className="ts-panel-header">
                        <h2 className="ts-panel-title">Action status</h2>
                        <span className="ts-panel-meta">Live loop</span>
                    </div>
                    <div className="ts-stat-grid">
                        <div className="ts-stat">
                            <div className="ts-stat-label">Gold</div>
                            <div className="ts-stat-value">{activePlayer?.storage.gold ?? 0}</div>
                        </div>
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
                            Skill Lv {activeSkill?.level ?? 0} · XP {activeSkill?.xp ?? 0}/{activeSkill?.xpNext ?? 0}
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
                            Recipe Lv {activeRecipe?.level ?? 0} · XP {activeRecipe?.xp ?? 0}/{activeRecipe?.xpNext ?? 0}
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
                        <h2 className="ts-panel-title">System</h2>
                        <span className="ts-panel-meta">Telemetry</span>
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
                        <li>Active action: {activePlayer?.selectedActionId ?? "none"}</li>
                    </ul>
                    <div className="ts-action-row ts-system-actions">
                        <button
                            type="button"
                            className="generic-field button ts-reset"
                            onClick={handleResetSave}
                        >
                            Reset save
                        </button>
                    </div>
                </section>
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
                                value={activeSkillId}
                                onChange={handleSkillChange}
                            >
                                <option value="">Choose a path</option>
                                {SKILL_DEFINITIONS.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </select>
                            <label className="ts-field-label" htmlFor="recipe-select">Select recipe</label>
                            <select
                                id="recipe-select"
                                className="generic-field select"
                                value={activeRecipeId}
                                onChange={handleRecipeChange}
                                disabled={!activeSkill}
                            >
                                <option value="">Choose a recipe</option>
                                {activeSkill
                                    ? Object.values(activeSkill.recipes).map((recipe) => (
                                        <option key={recipe.id} value={recipe.id}>
                                            {recipe.id} · Lv {recipe.level}
                                        </option>
                                    ))
                                    : null}
                            </select>
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
                                <h2 className="ts-modal-title">{offlineSummary.playerName}</h2>
                            </div>
                            <button type="button" className="ts-modal-close" onClick={handleCloseOfflineSummary}>
                                Close
                            </button>
                        </div>
                        <ul className="ts-list">
                            <li>Time away: {offlineSeconds}s</li>
                            <li>Ticks processed: {offlineSummary.ticks}</li>
                            <li>Gold gained: {offlineSummary.goldGained}</li>
                            {offlineSummary.actionId ? (
                                <li>Action: {offlineSummary.actionId}</li>
                            ) : (
                                <li>No action was running.</li>
                            )}
                            {offlineSummary.recipeId ? (
                                <li>Recipe: {offlineSummary.recipeId}</li>
                            ) : null}
                            <li>
                                Skill gains: +{offlineSummary.skillXpGained} XP
                                {offlineSummary.skillLevelGained > 0
                                    ? ` · +${offlineSummary.skillLevelGained} Lv`
                                    : ""}
                            </li>
                            <li>
                                Recipe gains: +{offlineSummary.recipeXpGained} XP
                                {offlineSummary.recipeLevelGained > 0
                                    ? ` · +${offlineSummary.recipeLevelGained} Lv`
                                    : ""}
                            </li>
                        </ul>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
