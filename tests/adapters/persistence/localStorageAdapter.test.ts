// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createLocalStorageAdapter } from "../../../src/adapters/persistence/localStorageAdapter";
import { createInitialGameState } from "../../../src/core/state";
import { toGameSave } from "../../../src/core/serialization";

type LocalStorageStub = {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    clear: () => void;
};

const createMemoryStorage = (): LocalStorageStub => {
    const store = new Map<string, string>();
    return {
        getItem: (key) => (store.has(key) ? store.get(key)! : null),
        setItem: (key, value) => {
            store.set(key, value);
        },
        removeItem: (key) => {
            store.delete(key);
        },
        clear: () => {
            store.clear();
        }
    };
};

describe("createLocalStorageAdapter", () => {
    const storageKey = "test-storage-key";
    let originalStorage: unknown;

    beforeEach(() => {
        originalStorage = (globalThis as { localStorage?: unknown }).localStorage;
        delete (globalThis as { localStorage?: unknown }).localStorage;
    });

    afterEach(() => {
        delete (globalThis as { localStorage?: unknown }).localStorage;
        if (originalStorage !== undefined) {
            (globalThis as { localStorage?: unknown }).localStorage = originalStorage;
        }
        vi.restoreAllMocks();
    });

    it("returns null when localStorage is unavailable", () => {
        const adapter = createLocalStorageAdapter(storageKey);

        expect(adapter.load()).toBeNull();
    });

    it("returns null when no save exists", () => {
        const storage = createMemoryStorage();
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);

        expect(adapter.load()).toBeNull();
    });

    it("parses stored saves", () => {
        const storage = createMemoryStorage();
        const save = toGameSave(createInitialGameState("0.4.0"));
        storage.setItem(storageKey, JSON.stringify(save));
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);

        expect(adapter.load()).toEqual(save);
    });

    it("handles invalid JSON and logs the error", () => {
        const storage = createMemoryStorage();
        storage.setItem(storageKey, "{bad-json");
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(adapter.load()).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
    });

    it("saves to localStorage when available", () => {
        const storage = createMemoryStorage();
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);
        const save = toGameSave(createInitialGameState("0.4.0"));

        adapter.save(save);

        const stored = storage.getItem(storageKey);
        expect(stored).toBeTruthy();
        const parsed = stored ? JSON.parse(stored) as { schemaVersion?: number; payload?: unknown } : null;
        expect(parsed?.schemaVersion).toBe(2);
        expect(parsed?.payload).toEqual(save);
    });

    it("does nothing when saving without localStorage", () => {
        const adapter = createLocalStorageAdapter(storageKey);
        const save = toGameSave(createInitialGameState("0.4.0"));

        expect(() => adapter.save(save)).not.toThrow();
    });
});
