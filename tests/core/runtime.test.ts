// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GameRuntime } from "../../src/core/runtime";
import { createInitialGameState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import { toGameSave } from "../../src/core/serialization";

const buildPersistence = (save = null) => ({
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

        (globalThis as { document?: typeof documentStub }).document = documentStub;
        (globalThis as { window?: typeof windowStub }).window = windowStub;
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
        document.visibilityState = "hidden";

        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);
        const intervalSpy = window.setInterval as unknown as ReturnType<typeof vi.fn>;

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
        expect(document.addEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
        expect(window.addEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));

        runtime.stop();
        expect(document.removeEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
        expect(window.removeEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));

        runtime.start();
        // Should rebind only once more after restart
        expect((document.addEventListener as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
        expect((window.addEventListener as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
    });

    it("starts without document present (SSR-safe)", () => {
        delete (globalThis as { document?: unknown }).document;
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        runtimes.push(runtime);

        runtime.start();

        expect(window.addEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));
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
        console.info("[runtime.test] persistence failures - end");
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
        document.visibilityState = "hidden";

        // @ts-expect-error - private access for coverage
        expect(runtime.isDocumentVisible()).toBe(false);
    });
});
