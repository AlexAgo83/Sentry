import { GameState, OfflinePlayerSummary, OfflineSummaryState, PerformanceState } from "./types";
import { createInitialGameState } from "./state";
import { toGameSave } from "./serialization";
import { GameStore } from "../store/gameStore";
import { PersistenceAdapter } from "../adapters/persistence/types";

export class GameRuntime {
    private intervalId: number | null = null;
    private hiddenAt: number | null = null;
    private hasStarted = false;

    constructor(
        private readonly store: GameStore,
        private readonly persistence: PersistenceAdapter,
        private readonly version: string
    ) {}

    start = () => {
        if (this.hasStarted) {
            return;
        }
        this.hasStarted = true;
        const save = this.persistence.load();
        this.store.dispatch({ type: "hydrate", save, version: this.version });
        this.bindVisibility();
        if (!this.isDocumentVisible()) {
            const lastTick = this.store.getState().loop.lastTick;
            const hiddenAt = lastTick ?? Date.now();
            this.hiddenAt = hiddenAt;
            this.store.dispatch({ type: "setHiddenAt", hiddenAt });
            return;
        }
        this.runStartupOfflineCatchUp();
        this.startLoop();
    };

    stop = () => {
        this.pauseLoop();
        this.hasStarted = false;
    };

    reset = () => {
        const initialState = createInitialGameState(this.version);
        const save = toGameSave(initialState);
        this.persistence.save(save);
        this.store.dispatch({ type: "hydrate", save, version: this.version });
    };

    private startLoop = () => {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
        const { loopInterval } = this.store.getState().loop;
        this.intervalId = window.setInterval(this.tick, loopInterval);
    };

    private pauseLoop = () => {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    };

    private tick = () => {
        const perfStart = this.getPerfTimestamp();
        const state = this.store.getState();
        const now = Date.now();
        const lastTick = state.loop.lastTick;

        if (!lastTick) {
            this.store.dispatch({ type: "tick", deltaMs: 0, timestamp: now });
            this.updatePerf(perfStart, {
                lastDeltaMs: 0,
                lastOfflineTicks: 0,
                lastOfflineDurationMs: 0
            });
            this.persist();
            return;
        }

        const diff = now - lastTick;
        const threshold = state.loop.loopInterval * state.loop.offlineThreshold;

        if (diff > threshold) {
            const result = this.runOfflineTicks(lastTick, now, state.loop.offlineInterval);
            this.updatePerf(perfStart, {
                lastDeltaMs: diff,
                lastOfflineTicks: result.ticks,
                lastOfflineDurationMs: diff
            });
        } else {
            this.store.dispatch({ type: "tick", deltaMs: state.loop.loopInterval, timestamp: now });
            this.updatePerf(perfStart, {
                lastDeltaMs: state.loop.loopInterval,
                lastOfflineTicks: 0,
                lastOfflineDurationMs: 0
            });
        }
        this.persist();
    };

    private runOfflineTicks = (lastTick: number, now: number, interval: number) => {
        const diff = Math.max(0, now - lastTick);
        const totalTicks = Math.floor(diff / interval);
        let tickTime = lastTick;

        for (let i = 0; i < totalTicks; i += 1) {
            tickTime += interval;
            this.store.dispatch({ type: "tick", deltaMs: interval, timestamp: tickTime });
        }

        const remainder = diff - totalTicks * interval;
        if (remainder > 0) {
            tickTime += remainder;
            this.store.dispatch({ type: "tick", deltaMs: remainder, timestamp: tickTime });
        }
        return {
            ticks: totalTicks + (remainder > 0 ? 1 : 0),
            diff
        };
    };

    private persist = () => {
        const save = toGameSave(this.store.getState());
        this.persistence.save(save);
    };

    private bindVisibility = () => {
        if (typeof document === "undefined") {
            return;
        }
        document.addEventListener("visibilitychange", () => {
            if (!this.isDocumentVisible()) {
                this.hiddenAt = Date.now();
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: this.hiddenAt });
                this.pauseLoop();
                return;
            }

            const resumeAt = Date.now();
            const hiddenAt = this.hiddenAt ?? this.store.getState().loop.lastHiddenAt;
            if (hiddenAt) {
                const perfStart = this.getPerfTimestamp();
                const beforeState = this.store.getState();
                const result = this.runOfflineTicks(hiddenAt, resumeAt, this.store.getState().loop.offlineInterval);
                const afterState = this.store.getState();
                const durationMs = resumeAt - hiddenAt;
                if (durationMs >= 5000) {
                    const summary = this.buildOfflineSummary(beforeState, afterState, durationMs, result.ticks);
                    if (summary) {
                        this.store.dispatch({ type: "setOfflineSummary", summary });
                    }
                }
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: null });
                this.updatePerf(perfStart, {
                    lastDeltaMs: durationMs,
                    lastOfflineTicks: result.ticks,
                    lastOfflineDurationMs: durationMs
                });
                this.persist();
            }
            this.hiddenAt = null;
            this.startLoop();
        });
    };

    private getPerfTimestamp = (): number => {
        if (typeof performance !== "undefined" && typeof performance.now === "function") {
            return performance.now();
        }
        return Date.now();
    };

    private isDocumentVisible = (): boolean => {
        if (typeof document === "undefined") {
            return true;
        }
        return document.visibilityState === "visible";
    };

    private updatePerf = (start: number, perf: Partial<PerformanceState>) => {
        const duration = Math.max(0, this.getPerfTimestamp() - start);
        this.store.dispatch({
            type: "setPerf",
            perf: {
                lastTickDurationMs: duration,
                ...perf
            }
        });
    };

    private buildOfflineSummary = (
        beforeState: GameState,
        afterState: GameState,
        durationMs: number,
        ticks: number
    ): OfflineSummaryState | null => {
        const players = Object.keys(beforeState.players).reduce<OfflinePlayerSummary[]>((acc, playerId) => {
            const beforePlayer = beforeState.players[playerId];
            const afterPlayer = afterState.players[playerId];
            if (!beforePlayer || !afterPlayer) {
                return acc;
            }
            const actionId = beforePlayer.selectedActionId;
            const beforeSkill = actionId ? beforePlayer.skills[actionId] : null;
            const afterSkill = actionId ? afterPlayer.skills[actionId] : null;
            const recipeId = beforeSkill?.selectedRecipeId ?? null;
            const beforeRecipe = recipeId && beforeSkill ? beforeSkill.recipes[recipeId] : null;
            const afterRecipe = recipeId && afterSkill ? afterSkill.recipes[recipeId] : null;

            const summary = {
                playerId,
                playerName: beforePlayer.name,
                actionId,
                recipeId,
                goldGained: afterPlayer.storage.gold - beforePlayer.storage.gold,
                skillXpGained: beforeSkill && afterSkill ? afterSkill.xp - beforeSkill.xp : 0,
                recipeXpGained: beforeRecipe && afterRecipe ? afterRecipe.xp - beforeRecipe.xp : 0,
                skillLevelGained: beforeSkill && afterSkill ? afterSkill.level - beforeSkill.level : 0,
                recipeLevelGained: beforeRecipe && afterRecipe ? afterRecipe.level - beforeRecipe.level : 0
            };

            acc.push(summary);

            return acc;
        }, []);

        if (players.length === 0) {
            return null;
        }

        return {
            durationMs,
            ticks,
            players
        };
    };

    private runStartupOfflineCatchUp = () => {
        const state = this.store.getState();
        const lastTick = state.loop.lastTick;
        if (!lastTick) {
            return;
        }

        const now = Date.now();
        const diff = now - lastTick;
        if (diff < 5000) {
            return;
        }

        const perfStart = this.getPerfTimestamp();
        const beforeState = this.store.getState();
        const result = this.runOfflineTicks(lastTick, now, state.loop.offlineInterval);
        const afterState = this.store.getState();

        const summary = this.buildOfflineSummary(beforeState, afterState, diff, result.ticks);
        if (summary) {
            this.store.dispatch({ type: "setOfflineSummary", summary });
        }

        this.updatePerf(perfStart, {
            lastDeltaMs: diff,
            lastOfflineTicks: result.ticks,
            lastOfflineDurationMs: diff
        });
        this.persist();
    };
}
