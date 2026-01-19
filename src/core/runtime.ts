import { GameSave, GameState, ItemDelta, OfflinePlayerSummary, OfflineSummaryState, PerformanceState } from "./types";
import { createInitialGameState } from "./state";
import { toGameSave } from "./serialization";
import { GameStore } from "../store/gameStore";
import { PersistenceAdapter } from "../adapters/persistence/types";

export class GameRuntime {
    private intervalId: number | null = null;
    private hiddenAt: number | null = null;
    private hasStarted = false;
    private lastPersistAt: number | null = null;
    private persistenceFailureCount = 0;
    private persistenceDisabled = false;
    private hasLoggedPersistenceError = false;
    private static readonly MAX_CATCH_UP_MS = 500;
    private static readonly PERSIST_INTERVAL_MS = 1500;
    private static readonly DRIFT_EMA_ALPHA = 0.15;
    private static readonly OFFLINE_DEBUG_ENABLE_KEY = "sentry.debug.offline";
    private visibilityHandler?: () => void;
    private unloadHandler?: () => void;

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
        this.bindUnload();
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
        this.unbindVisibility();
        this.unbindUnload();
    };

    simulateOffline = (durationMs: number) => {
        if (!Number.isFinite(durationMs) || durationMs <= 0) {
            return;
        }
        const now = Date.now();
        const start = Math.max(0, now - durationMs);
        const perfStart = this.getPerfTimestamp();
        const beforeState = this.store.getState();
        const result = this.runOfflineTicks(start, now, this.store.getState().loop.offlineInterval);
        const afterState = this.store.getState();
        const summary = this.buildOfflineSummary(
            beforeState,
            afterState,
            durationMs,
            result.ticks,
            result.playerItemDeltas,
            result.totalItemDeltas
        );
        if (summary) {
            this.store.dispatch({ type: "setOfflineSummary", summary });
        }
        const prevEma = this.store.getState().perf.driftEmaMs;
        const driftMs = 0;
        const driftEmaMs = prevEma === 0
            ? driftMs
            : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
        this.updatePerf(perfStart, {
            lastDeltaMs: durationMs,
            lastDriftMs: driftMs,
            driftEmaMs,
            lastOfflineTicks: result.ticks,
            lastOfflineDurationMs: durationMs
        });
        this.persist({ force: true });
    };

    reset = () => {
        const initialState = createInitialGameState(this.version);
        const save = toGameSave(initialState);
        this.persist({ force: true, save });
        this.store.dispatch({ type: "hydrate", save, version: this.version });
    };

    importSave = (save: GameSave) => {
        this.persist({ force: true, save });
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
            const prevEma = this.store.getState().perf.driftEmaMs;
            const driftMs = 0;
            const driftEmaMs = prevEma === 0
                ? driftMs
                : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            this.updatePerf(perfStart, {
                lastDeltaMs: 0,
                lastDriftMs: driftMs,
                driftEmaMs,
                lastOfflineTicks: 0,
                lastOfflineDurationMs: 0
            });
            this.persist();
            return;
        }

        const rawDiff = now - lastTick;
        const diff = Number.isFinite(rawDiff) ? Math.max(0, rawDiff) : 0;
        const threshold = state.loop.loopInterval * state.loop.offlineThreshold;

        if (diff > threshold) {
            const result = this.runOfflineTicks(lastTick, now, state.loop.offlineInterval);
            const prevEma = state.perf.driftEmaMs;
            const driftMs = 0;
            const driftEmaMs = prevEma === 0
                ? driftMs
                : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            this.updatePerf(perfStart, {
                lastDeltaMs: diff,
                lastDriftMs: driftMs,
                driftEmaMs,
                lastOfflineTicks: result.ticks,
                lastOfflineDurationMs: diff
            });
        } else {
            const deltaMs = Math.min(diff, threshold, GameRuntime.MAX_CATCH_UP_MS);
            this.store.dispatch({ type: "tick", deltaMs, timestamp: now });
            const prevEma = state.perf.driftEmaMs;
            const driftMs = diff > 0 ? diff - state.loop.loopInterval : 0;
            const driftEmaMs = prevEma === 0
                ? driftMs
                : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            this.updatePerf(perfStart, {
                lastDeltaMs: diff,
                lastDriftMs: driftMs,
                driftEmaMs,
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
        const totalItemDeltas: ItemDelta = {};
        const playerItemDeltas: Record<string, ItemDelta> = {};

        for (let i = 0; i < totalTicks; i += 1) {
            tickTime += interval;
            this.store.dispatch({ type: "tick", deltaMs: interval, timestamp: tickTime });
            this.collectTickDeltas(totalItemDeltas, playerItemDeltas);
        }

        const remainder = diff - totalTicks * interval;
        if (remainder > 0) {
            tickTime += remainder;
            this.store.dispatch({ type: "tick", deltaMs: remainder, timestamp: tickTime });
            this.collectTickDeltas(totalItemDeltas, playerItemDeltas);
        }
        return {
            ticks: totalTicks + (remainder > 0 ? 1 : 0),
            diff,
            totalItemDeltas,
            playerItemDeltas
        };
    };

    private persist = (options?: { force?: boolean; save?: GameSave }) => {
        if (this.persistenceDisabled) {
            return;
        }
        const now = Date.now();
        if (!options?.force && this.lastPersistAt && now - this.lastPersistAt < GameRuntime.PERSIST_INTERVAL_MS) {
            return;
        }
        const save = options?.save ?? toGameSave(this.store.getState());
        try {
            this.persistence.save(save);
            this.lastPersistAt = now;
            this.persistenceFailureCount = 0;
            this.hasLoggedPersistenceError = false;
        } catch (error) {
            this.persistenceFailureCount += 1;
            if (!this.hasLoggedPersistenceError) {
                console.error("Failed to persist save data", error);
                this.hasLoggedPersistenceError = true;
            }
            if (this.persistenceFailureCount >= 3) {
                this.persistenceDisabled = true;
            }
        }
    };

    private collectTickDeltas = (total: ItemDelta, perPlayer: Record<string, ItemDelta>) => {
        const summary = this.store.getState().lastTickSummary;
        if (!summary) {
            return;
        }
        Object.entries(summary.totalItemDeltas).forEach(([itemId, amount]) => {
            total[itemId] = (total[itemId] ?? 0) + amount;
        });
        Object.entries(summary.playerItemDeltas).forEach(([playerId, deltas]) => {
            const bucket = perPlayer[playerId] ?? {};
            Object.entries(deltas).forEach(([itemId, amount]) => {
                bucket[itemId] = (bucket[itemId] ?? 0) + amount;
            });
            perPlayer[playerId] = bucket;
        });
    };

    private bindVisibility = () => {
        if (typeof document === "undefined") {
            return;
        }
        if (this.visibilityHandler) {
            return;
        }
        this.visibilityHandler = () => {
            if (!this.isDocumentVisible()) {
                this.persist({ force: true });
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
                    const summary = this.buildOfflineSummary(
                        beforeState,
                        afterState,
                        durationMs,
                        result.ticks,
                        result.playerItemDeltas,
                        result.totalItemDeltas
                    );
                    if (summary) {
                        this.store.dispatch({ type: "setOfflineSummary", summary });
                    }
                }
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: null });
                const prevEma = this.store.getState().perf.driftEmaMs;
                const driftMs = 0;
                const driftEmaMs = prevEma === 0
                    ? driftMs
                    : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
                this.updatePerf(perfStart, {
                    lastDeltaMs: durationMs,
                    lastDriftMs: driftMs,
                    driftEmaMs,
                    lastOfflineTicks: result.ticks,
                    lastOfflineDurationMs: durationMs
                });
                this.persist({ force: true });
            }
            this.hiddenAt = null;
            this.startLoop();
        };
        document.addEventListener("visibilitychange", this.visibilityHandler);
    };

    private unbindVisibility = () => {
        if (typeof document === "undefined" || !this.visibilityHandler) {
            return;
        }
        document.removeEventListener("visibilitychange", this.visibilityHandler);
        this.visibilityHandler = undefined;
    };

    private bindUnload = () => {
        if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
            return;
        }
        if (this.unloadHandler) {
            return;
        }
        this.unloadHandler = () => {
            this.persist({ force: true });
        };
        window.addEventListener("beforeunload", this.unloadHandler);
    };

    private unbindUnload = () => {
        if (typeof window === "undefined" || !this.unloadHandler || typeof window.removeEventListener !== "function") {
            return;
        }
        window.removeEventListener("beforeunload", this.unloadHandler);
        this.unloadHandler = undefined;
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
        ticks: number,
        playerItemDeltas: Record<string, ItemDelta>,
        totalItemDeltas: ItemDelta
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
                skillXpGained: beforeSkill && afterSkill ? afterSkill.xp - beforeSkill.xp : 0,
                recipeXpGained: beforeRecipe && afterRecipe ? afterRecipe.xp - beforeRecipe.xp : 0,
                skillLevelGained: beforeSkill && afterSkill ? afterSkill.level - beforeSkill.level : 0,
                recipeLevelGained: beforeRecipe && afterRecipe ? afterRecipe.level - beforeRecipe.level : 0,
                itemDeltas: playerItemDeltas[playerId] ?? {}
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
            players,
            totalItemDeltas
        };
    };

    private runStartupOfflineCatchUp = () => {
        const state = this.store.getState();
        const startTime = state.loop.lastTick ?? state.loop.lastHiddenAt;
        if (!startTime) {
            return;
        }

        const now = Date.now();
        const diff = now - startTime;
        if (diff < 5000) {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] skipping recap, away too short", { diffMs: diff });
            }
            return;
        }

        const perfStart = this.getPerfTimestamp();
        const beforeState = this.store.getState();
        const result = this.runOfflineTicks(startTime, now, state.loop.offlineInterval);
        const afterState = this.store.getState();

        const summary = this.buildOfflineSummary(
            beforeState,
            afterState,
            diff,
            result.ticks,
            result.playerItemDeltas,
            result.totalItemDeltas
        );
        if (summary) {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] recap generated", { diffMs: diff, ticks: result.ticks });
            }
            this.store.dispatch({ type: "setOfflineSummary", summary });
        } else {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] recap skipped (no players)", { diffMs: diff, ticks: result.ticks });
            }
        }

        this.updatePerf(perfStart, {
            lastDeltaMs: diff,
            lastDriftMs: 0,
            driftEmaMs: (() => {
                const prevEma = this.store.getState().perf.driftEmaMs;
                const driftMs = 0;
                return prevEma === 0
                    ? driftMs
                    : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            })(),
            lastOfflineTicks: result.ticks,
            lastOfflineDurationMs: diff
        });
        this.persist({ force: true });
    };

    private isOfflineDebugEnabled = (): boolean => {
        const isDev = typeof import.meta !== "undefined" && Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
        if (!isDev || typeof window === "undefined") {
            return false;
        }
        try {
            return window.localStorage.getItem(GameRuntime.OFFLINE_DEBUG_ENABLE_KEY) === "1";
        } catch {
            return false;
        }
    };
}
