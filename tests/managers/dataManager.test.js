import { suite, test, expect } from "vitest";
import { createLocalStorageAdapter } from "../../src/adapters/persistence/localStorageAdapter";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState } from "../../src/core/state";

suite("LocalStorageAdapter", () => {
    test("saves and loads game data", () => {
        const storage = new Map();
        const localStorageMock = {
            getItem: (key) => (storage.has(key) ? storage.get(key) : null),
            setItem: (key, value) => {
                storage.set(key, String(value));
            },
            removeItem: (key) => {
                storage.delete(key);
            },
            clear: () => {
                storage.clear();
            }
        };
        const localStorageBackup = globalThis.localStorage;
        globalThis.localStorage = localStorageMock;

        const adapter = createLocalStorageAdapter("sentry-test-save");
        const state = createInitialGameState("0.4.0");
        state.players[state.activePlayerId ?? "1"].name = "Hero";
        state.players[state.activePlayerId ?? "1"].skills.Combat.xp = 42;
        const save = toGameSave(state);

        adapter.save(save);
        const loaded = adapter.load();

        expect(loaded?.lastTick).toBe(save.lastTick);
        expect(loaded?.players?.[state.activePlayerId ?? "1"]?.name).toBe("Hero");
        expect(loaded?.players?.[state.activePlayerId ?? "1"]?.skills?.Combat?.xp).toBe(42);

        localStorageMock.clear();
        globalThis.localStorage = localStorageBackup;
    });
});
