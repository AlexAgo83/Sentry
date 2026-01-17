// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createLocalStorageAdapter } from "../../src/adapters/persistence/localStorageAdapter";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState } from "../../src/core/state";

type LocalStorageMock = {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
};

describe("LocalStorageAdapter", () => {
    it("saves and loads game data", () => {
        const storage = new Map<string, string>();
        const localStorageMock: LocalStorageMock = {
            getItem: (key) => (storage.has(key) ? storage.get(key)! : null),
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
        const localStorageBackup = (globalThis as { localStorage?: LocalStorageMock }).localStorage;
        (globalThis as { localStorage?: LocalStorageMock }).localStorage = localStorageMock;

        try {
            const adapter = createLocalStorageAdapter("sentry-test-save");
            const state = createInitialGameState("0.4.0");
            const activePlayerId = state.activePlayerId ?? "1";
            state.players[activePlayerId].name = "Hero";
            state.players[activePlayerId].skills.Combat.xp = 42;
            const save = toGameSave(state);

            adapter.save(save);
            const loaded = adapter.load();

            expect(loaded?.lastTick).toBe(save.lastTick);
            expect(loaded?.players?.[activePlayerId]?.name).toBe("Hero");
            expect(loaded?.players?.[activePlayerId]?.skills?.Combat?.xp).toBe(42);
        } finally {
            localStorageMock.clear();
            if (localStorageBackup === undefined) {
                delete (globalThis as { localStorage?: LocalStorageMock }).localStorage;
            } else {
                (globalThis as { localStorage?: LocalStorageMock }).localStorage = localStorageBackup;
            }
        }
    });
});
