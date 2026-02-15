// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GameRuntime } from "../../src/core/runtime";
import { createInitialGameState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import { toGameSave } from "../../src/core/serialization";
import type { GameSave } from "../../src/core/types";
import { OFFLINE_CAP_DAYS, RESTED_DURATION_MS, RESTED_THRESHOLD_MS } from "../../src/core/constants";

const buildPersistence = (save: GameSave | null = null) => ({
    load: () => save,
    save: vi.fn()
});

describe("GameRuntime", () => {
    const documentListeners: Record<string, Array<(event?: { type: string }) => void>> = {};
    const runtimes: GameRuntime[] = [];
    beforeEach(() => {
        documentListeners.visibilitychange = [];
        const documentStub = {
            visibilityState: "visible",
            addEventListener: vi.fn((type: string, handler: (event?: { type: string }) => void) => {
                documentListeners[type] = documentListeners[type] ?? [];
                documentListeners[type].push(handler);
            }),
            removeEventListener: vi.fn((type: string, handler: (event?: { type: string }) => void) => {
                documentListeners[type] = (documentListeners[type] ?? []).filter((fn) => fn !== handler);
            }),
            dispatchEvent: (event: { type: string }) => {
                (documentListeners[event.type] ?? []).forEach((handler) => handler(event));
                return true;
            }
        };
        const windowStub = {
            setInterval: vi.fn(() => 0),
            clearInterval: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };

        (globalThis as any).document = documentStub;
        (globalThis as any).window = windowStub;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // Ensure any runtime started during a test is stopped to avoid leaking timers.
        while (runtimes.length) {
            const runtime = runtimes.pop();
            runtime?.stop();
        }
        delete (globalThis as { document?: unknown }).document;
        delete (globalThis as { window?: unknown }).window;
    });

    it("skips the loop when the document is hidden", () => {
        console.info("[runtime.test] skip loop when hidden - start");
        (document as any).visibilityState = "hidden";

        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        const intervalSpy = (window as any).setInterval as ReturnType<typeof vi.fn>;

        runtime.start();

        expect(store.getState().loop.lastHiddenAt).not.toBeNull();
        expect(intervalSpy).not.toHaveBeenCalled();
        console.info("[runtime.test] skip loop when hidden - end");
    });

    it("runs startup offline catch-up when lastTick is old", () => {
        console.info("[runtime.test] startup offline catch-up - start");
        const initial = createInitialGameState("0.4.0");
        const save = toGameSave(initial);
        save.lastTick = 1000;
        const store = createGameStore(initial);
        const persistence = buildPersistence(save);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        vi.spyOn(Date, "now").mockReturnValue(10000);

        runtime.start();

        expect(store.getState().offlineSummary).not.toBeNull();
        runtime.stop();
        console.info("[runtime.test] startup offline catch-up - end");
    });

    it("skips startup recap when away duration is too short", () => {
        const initial = createInitialGameState("0.4.0");
        const save = toGameSave(initial);
        save.lastTick = 9500; // only 500ms away
        const store = createGameStore(initial);
        const persistence = buildPersistence(save);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        vi.spyOn(Date, "now").mockReturnValue(10000);

        runtime.start();

        expect(store.getState().offlineSummary).toBeNull();
        runtime.stop();
    });

    it("cleans up listeners on stop and rebinds once on restart", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        runtime.start();
        expect((document as any).addEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
        expect((window as any).addEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));

        runtime.stop();
        expect((document as any).removeEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
        expect((window as any).removeEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));

        runtime.start();
        // Should rebind only once more after restart
        expect(((document as any).addEventListener as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
        expect(((window as any).addEventListener as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
    });

    it("starts without document present (SSR-safe)", () => {
        delete (globalThis as { document?: unknown }).document;
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        runtime.start();

        expect((window as any).addEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));
        runtime.stop();
    });

    it("creates offline summary on visibility resume", () => {
        console.info("[runtime.test] visibility resume - start");
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        // Pretend the tab was hidden at t=2000 and we are resuming at t=9000.
        store.dispatch({ type: "setHiddenAt", hiddenAt: 2000 });
        vi.spyOn(Date, "now").mockReturnValue(9000);

        // @ts-expect-error - invoke the private helper directly for deterministic timing
        runtime.runStartupOfflineCatchUp();

        expect(store.getState().offlineSummary).not.toBeNull();
        expect(persistence.save).toHaveBeenCalled();
        runtime.stop();
        console.info("[runtime.test] visibility resume - end");
    });

    it("grants and refreshes the Rested buff after long offline simulations", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        const now1 = RESTED_THRESHOLD_MS + 1000;
        const now2 = now1 + 60_000;
        let nowValue = now1;
        vi.spyOn(Date, "now").mockImplementation(() => nowValue);

        runtime.simulateOffline(RESTED_THRESHOLD_MS + 1);

        const player1Mods = store.getState().players["1"]?.stats.temporaryMods ?? [];
        const rested1 = player1Mods.find((mod) => mod.stackKey === "rested");
        expect(rested1).toMatchObject({
            id: "rested",
            stat: "Endurance",
            kind: "flat",
            source: "Rested",
            stackKey: "rested",
        });
        expect(rested1?.expiresAt).toBe(now1 + RESTED_DURATION_MS);

        nowValue = now2;
        runtime.simulateOffline(RESTED_THRESHOLD_MS + 1);

        const player1ModsAfter = store.getState().players["1"]?.stats.temporaryMods ?? [];
        const restedMods = player1ModsAfter.filter((mod) => mod.stackKey === "rested");
        expect(restedMods).toHaveLength(1);
        expect(restedMods[0]?.expiresAt).toBe(now2 + RESTED_DURATION_MS);
    });

    it("skips recap when no players exist", () => {
        const base = createInitialGameState("0.4.0");
        const emptyState = { ...base, players: {}, activePlayerId: null };
        const store = createGameStore(emptyState);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        const now = 10000;
        const stateRef = store.getState();
        stateRef.loop.lastTick = now - 7000;
        stateRef.loop.lastHiddenAt = now - 7000;
        vi.spyOn(Date, "now").mockReturnValue(now);

        // @ts-expect-error accessing private helper for coverage
        runtime.runStartupOfflineCatchUp();

        expect(store.getState().offlineSummary).toBeNull();
    });

    it("caps offline catch-up to the configured cap", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        const dayMs = 24 * 60 * 60 * 1000;
        const capMs = OFFLINE_CAP_DAYS * dayMs;
        const now = capMs + dayMs + 1000;
        vi.spyOn(Date, "now").mockReturnValue(now);

        runtime.simulateOffline(capMs + dayMs);

        const summary = store.getState().offlineSummary;
        expect(summary).not.toBeNull();
        if (summary) {
            expect(summary.capped).toBe(true);
            expect(summary.processedMs).toBe(capMs);
            expect(summary.durationMs).toBe(capMs + dayMs);
        }
    });

    it("caps offline stepping size and reports ticks based on actual stepping", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        // Force an oversized offlineInterval to ensure MAX_OFFLINE_STEP_MS is applied as a cap.
        store.getState().loop.offlineInterval = 20000;

        vi.spyOn(Date, "now").mockReturnValue(100000);
        runtime.simulateOffline(60000);

        const summary = store.getState().offlineSummary;
        expect(summary).not.toBeNull();
        if (summary) {
            // With a 60s window and a 5s max step, we should process in 12 steps.
            expect(summary.processedMs).toBe(60000);
            expect(summary.ticks).toBe(12);
        }
    });

    it("persists on the first tick and updates perf", () => {
        console.info("[runtime.test] first tick persistence - start");
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        vi.spyOn(Date, "now").mockReturnValue(1000);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().loop.lastTick).toBe(1000);
        expect(persistence.save).toHaveBeenCalled();
        console.info("[runtime.test] first tick persistence - end");
    });

    it("uses real elapsed delta for regular ticks", () => {
        console.info("[runtime.test] regular tick delta - start");
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });
        vi.spyOn(Date, "now").mockReturnValue(1120);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().perf.lastDeltaMs).toBe(120);
        console.info("[runtime.test] regular tick delta - end");
    });

    it.each([1000, 5000, 20000])("processes delayed ticks (%ims) as offline catch-up", (delayMs) => {
        console.info(`[runtime.test] delayed tick ${delayMs} - start`);
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });
        vi.spyOn(Date, "now").mockReturnValue(1000 + delayMs);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().perf.lastDeltaMs).toBe(delayMs);
        expect(store.getState().perf.lastOfflineTicks).toBeGreaterThan(0);
        console.info(`[runtime.test] delayed tick ${delayMs} - end`);
    });

    it("disables persistence after repeated failures", () => {
        console.info("[runtime.test] persistence failures - start");
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        persistence.save.mockImplementation(() => {
            throw new Error("Quota exceeded");
        });
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });

        let nowValue = 3000;
        vi.spyOn(Date, "now").mockImplementation(() => {
            const next = nowValue;
            nowValue += 2000;
            return next;
        });

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();
        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();
        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();
        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(persistence.save).toHaveBeenCalledTimes(3);
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(store.getState().persistence.disabled).toBe(true);
        console.info("[runtime.test] persistence failures - end");
    });

    it("recovers persistence after a successful retry", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        let callCount = 0;
        persistence.save.mockImplementation(() => {
            callCount += 1;
            if (callCount <= 3) {
                throw new Error("Disk full");
            }
        });
        vi.spyOn(console, "error").mockImplementation(() => {});
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });

        let nowValue = 3000;
        vi.spyOn(Date, "now").mockImplementation(() => {
            const next = nowValue;
            nowValue += 2000;
            return next;
        });

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();
        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();
        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().persistence.disabled).toBe(true);

        runtime.retryPersistence();

        expect(persistence.save).toHaveBeenCalledTimes(4);
        expect(store.getState().persistence.disabled).toBe(false);
        expect(store.getState().persistence.error).toBeNull();
    });

    it("handles first tick when lastTick is null", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        vi.spyOn(Date, "now").mockReturnValue(4242);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().loop.lastTick).toBe(4242);
        expect(persistence.save).toHaveBeenCalledTimes(1);
    });

    it("detects document visibility hidden", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        (document as any).visibilityState = "hidden";

        // @ts-expect-error - private access for coverage
        expect(runtime.isDocumentVisible()).toBe(false);
    });

    it("caps the tick delta but records the real elapsed delta in perf", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const stateRef = store.getState();
        stateRef.loop.loopInterval = 500;
        stateRef.loop.offlineThreshold = 10;
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });
        const dispatchSpy = vi.spyOn(store, "dispatch");
        vi.spyOn(Date, "now").mockReturnValue(1800);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(dispatchSpy).toHaveBeenCalledWith({ type: "tick", deltaMs: 500, timestamp: 1800 });
        expect(store.getState().perf.lastDeltaMs).toBe(800);
        expect(store.getState().perf.lastOfflineTicks).toBe(0);
        expect(store.getState().perf.lastDriftMs).toBe(300);
        expect(store.getState().perf.driftEmaMs).toBe(300);
    });

    it("treats diff equal to offline threshold as a regular tick (not offline recap)", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const stateRef = store.getState();
        stateRef.loop.loopInterval = 500;
        stateRef.loop.offlineThreshold = 2; // threshold = 1000ms
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });
        const dispatchSpy = vi.spyOn(store, "dispatch");
        vi.spyOn(Date, "now").mockReturnValue(2000);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(dispatchSpy).toHaveBeenCalledWith({ type: "tick", deltaMs: 500, timestamp: 2000 });
        expect(store.getState().perf.lastOfflineTicks).toBe(0);
        expect(store.getState().perf.lastDeltaMs).toBe(1000);
    });

    it("does not show an offline summary when resuming quickly, but still processes ticks", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        runtime.start();
        const intervalSpy = (window as any).setInterval as ReturnType<typeof vi.fn>;
        expect(intervalSpy).toHaveBeenCalledTimes(1);

        const nowSpy = vi.spyOn(Date, "now");
        nowSpy
            .mockReturnValueOnce(1000) // persist on hide
            .mockReturnValueOnce(1000) // hiddenAt
            .mockReturnValueOnce(3500) // resumeAt
            .mockReturnValueOnce(3500); // persist on resume

        (document as any).visibilityState = "hidden";
        (document as any).dispatchEvent({ type: "visibilitychange" });
        (document as any).visibilityState = "visible";
        (document as any).dispatchEvent({ type: "visibilitychange" });

        expect(store.getState().offlineSummary).toBeNull();
        expect(store.getState().loop.lastHiddenAt).toBeNull();
        expect(store.getState().perf.lastDeltaMs).toBe(2500);
        expect(store.getState().perf.lastOfflineTicks).toBeGreaterThan(0);
        expect(persistence.save).toHaveBeenCalledTimes(2);
        expect(intervalSpy).toHaveBeenCalledTimes(2);
    });
});
