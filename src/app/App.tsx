import { CSSProperties, ChangeEvent, useEffect } from "react";
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
        gameStore.dispatch({ type: "addPlayer" });
    };

    const handleSetActivePlayer = (playerId: string) => {
        gameStore.dispatch({ type: "setActivePlayer", playerId });
    };

    const progressPercent = activePlayer?.actionProgress.progressPercent ?? 0;
    const progressStyle = { "--progress": `${progressPercent}%` } as CSSProperties;

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
                        {players.map((player) => (
                            <button
                                key={player.id}
                                type="button"
                                className={`ts-player-button ${player.id === state.activePlayerId ? "is-active" : ""}`}
                                onClick={() => handleSetActivePlayer(player.id)}
                            >
                                <span className="ts-player-name">{player.name}</span>
                                <span className="ts-player-meta">
                                    HP {player.hp}/{player.hpMax} · Stamina {player.stamina}/{player.staminaMax}
                                </span>
                            </button>
                        ))}
                    </div>
                    <button type="button" className="generic-field button ts-add-player" onClick={handleAddPlayer}>
                        Recruit new hero
                    </button>
                </section>
                <section className="generic-panel ts-panel">
                    <div className="ts-panel-header">
                        <h2 className="ts-panel-title">Loadout</h2>
                        <span className="ts-panel-meta">Actions</span>
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
                                disabled={!activePlayer?.selectedActionId}
                            >
                                Pause action
                            </button>
                        </div>
                    </div>
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
                        <div className="ts-stat">
                            <div className="ts-stat-label">Stamina</div>
                            <div className="ts-stat-value">{activePlayer?.stamina ?? 0}</div>
                        </div>
                        <div className="ts-stat">
                            <div className="ts-stat-label">Skill XP</div>
                            <div className="ts-stat-value">{activeSkill?.xp ?? 0}</div>
                        </div>
                        <div className="ts-stat">
                            <div className="ts-stat-label">Recipe XP</div>
                            <div className="ts-stat-value">{activeRecipe?.xp ?? 0}</div>
                        </div>
                    </div>
                    <div className="generic-field panel progress-row ts-progress-row" style={progressStyle}>
                        <span className="ts-progress-label">
                            Progress {progressPercent.toFixed(1)}%
                        </span>
                    </div>
                    <progress className="generic-field progress" max={100} value={progressPercent} />
                </section>
                <section className="generic-panel ts-panel">
                    <div className="ts-panel-header">
                        <h2 className="ts-panel-title">System</h2>
                        <span className="ts-panel-meta">Telemetry</span>
                    </div>
                    <ul className="ts-list">
                        <li>Version: {state.version}</li>
                        <li>Last tick: {state.loop.lastTick ?? "awaiting"}</li>
                        <li>Loop interval: {state.loop.loopInterval}ms</li>
                        <li>Offline interval: {state.loop.offlineInterval}ms</li>
                        <li>Active action: {activePlayer?.selectedActionId ?? "none"}</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};
