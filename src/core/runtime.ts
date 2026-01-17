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
        this.startLoop();
        this.bindVisibility();
    };

    stop = () => {
        this.pauseLoop();
        this.hasStarted = false;
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
        const state = this.store.getState();
        const now = Date.now();
        const lastTick = state.loop.lastTick;

        if (!lastTick) {
            this.store.dispatch({ type: "tick", deltaMs: 0, timestamp: now });
            this.persist();
            return;
        }

        const diff = now - lastTick;
        const threshold = state.loop.loopInterval * state.loop.offlineThreshold;

        if (diff > threshold) {
            this.runOfflineTicks(lastTick, now, state.loop.offlineInterval);
        } else {
            this.store.dispatch({ type: "tick", deltaMs: state.loop.loopInterval, timestamp: now });
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
            if (document.hidden) {
                this.hiddenAt = Date.now();
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: this.hiddenAt });
                this.pauseLoop();
                return;
            }

            const resumeAt = Date.now();
            const hiddenAt = this.hiddenAt ?? this.store.getState().loop.lastHiddenAt;
            if (hiddenAt) {
                this.runOfflineTicks(hiddenAt, resumeAt, this.store.getState().loop.offlineInterval);
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: null });
                this.persist();
            }
            this.hiddenAt = null;
            this.startLoop();
        });
    };
}
