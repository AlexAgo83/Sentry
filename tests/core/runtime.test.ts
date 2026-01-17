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
    beforeEach(() => {
        documentListeners.visibilitychange = [];
        const documentStub = {
            visibilityState: "visible",
            addEventListener: (type: string, handler: (event?: { type: string }) => void) => {
                documentListeners[type] = documentListeners[type] ?? [];
                documentListeners[type].push(handler);
            },
            dispatchEvent: (event: { type: string }) => {
                (documentListeners[event.type] ?? []).forEach((handler) => handler(event));
                return true;
            }
        };
        const windowStub = {
            setInterval: vi.fn(() => 0),
            clearInterval: vi.fn()
        };

        (globalThis as { document?: typeof documentStub }).document = documentStub;
        (globalThis as { window?: typeof windowStub }).window = windowStub;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete (globalThis as { document?: unknown }).document;
        delete (globalThis as { window?: unknown }).window;
    });

    it("skips the loop when the document is hidden", () => {
        document.visibilityState = "hidden";

        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        const intervalSpy = window.setInterval as unknown as ReturnType<typeof vi.fn>;

        runtime.start();

        expect(store.getState().loop.lastHiddenAt).not.toBeNull();
        expect(intervalSpy).not.toHaveBeenCalled();
    });

    it("runs startup offline catch-up when lastTick is old", () => {
        const initial = createInitialGameState("0.4.0");
        const save = toGameSave(initial);
        save.lastTick = 1000;
        const store = createGameStore(initial);
        const persistence = buildPersistence(save);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        vi.spyOn(Date, "now").mockReturnValue(10000);

        runtime.start();

        expect(store.getState().offlineSummary).not.toBeNull();
        runtime.stop();
    });

    it("creates offline summary on visibility resume", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        const nowSpy = vi.spyOn(Date, "now");
        nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000).mockReturnValueOnce(9000);

        runtime.start();

        document.visibilityState = "hidden";
        document.dispatchEvent({ type: "visibilitychange" });

        document.visibilityState = "visible";
        document.dispatchEvent({ type: "visibilitychange" });

        expect(store.getState().offlineSummary).not.toBeNull();
        expect(persistence.save).toHaveBeenCalled();
        runtime.stop();
    });

    it("persists on the first tick and updates perf", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");
        vi.spyOn(Date, "now").mockReturnValue(1000);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().loop.lastTick).toBe(1000);
        expect(persistence.save).toHaveBeenCalled();
    });

    it("uses real elapsed delta for regular ticks", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });
        vi.spyOn(Date, "now").mockReturnValue(1120);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().perf.lastDeltaMs).toBe(120);
    });

    it.each([1000, 5000, 20000])("processes delayed ticks (%ims) as offline catch-up", (delayMs) => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.4.0");

        store.dispatch({ type: "tick", deltaMs: 0, timestamp: 1000 });
        vi.spyOn(Date, "now").mockReturnValue(1000 + delayMs);

        // @ts-expect-error - accessing private tick for coverage
        runtime.tick();

        expect(store.getState().perf.lastDeltaMs).toBe(delayMs);
        expect(store.getState().perf.lastOfflineTicks).toBeGreaterThan(0);
    });

    it("disables persistence after repeated failures", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = buildPersistence(null);
        persistence.save.mockImplementation(() => {
            throw new Error("Quota exceeded");
        });
        const runtime = new GameRuntime(store, persistence, "0.4.0");
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
    });
});
