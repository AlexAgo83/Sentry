// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createLocalStorageAdapter } from "../../../src/adapters/persistence/localStorageAdapter";
import { createInitialGameState } from "../../../src/core/state";
import { toGameSave } from "../../../src/core/serialization";
import { getPersistenceLoadReport, setPersistenceLoadReport } from "../../../src/adapters/persistence/loadReport";
import { createSaveEnvelopeV2 } from "../../../src/adapters/persistence/saveEnvelope";
import { lastGoodKeyFor } from "../../../src/adapters/persistence/localStorageKeys";

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
        setPersistenceLoadReport({ status: "empty", recoveredFromLastGood: false });
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
        const legacySave = { ...save, schemaVersion: 1 };
        storage.setItem(storageKey, JSON.stringify(legacySave));
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);

        const loaded = adapter.load();
        expect(loaded).not.toBeNull();
        expect(loaded?.schemaVersion).toBe(3);
        expect(loaded?.version).toBe(save.version);
        expect(Object.keys(loaded?.players ?? {})).toEqual(Object.keys(save.players));
        expect(getPersistenceLoadReport().status).toBe("migrated");
    });

    it("handles invalid JSON and logs the error", () => {
        const storage = createMemoryStorage();
        storage.setItem(storageKey, "{bad-json");
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(adapter.load()).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
        expect(getPersistenceLoadReport().status).toBe("corrupt");
    });

    it("recovers last good save when the current save is corrupt", () => {
        const storage = createMemoryStorage();
        storage.setItem(storageKey, "{bad-json");
        const save = toGameSave(createInitialGameState("0.4.0"));
        const lastGoodKey = lastGoodKeyFor(storageKey);
        storage.setItem(lastGoodKey, JSON.stringify(createSaveEnvelopeV2(save, 123)));
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;
        const adapter = createLocalStorageAdapter(storageKey);
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const loaded = adapter.load();
        expect(loaded).not.toBeNull();
        expect(loaded?.schemaVersion).toBe(3);
        expect(loaded?.version).toBe(save.version);
        expect(Object.keys(loaded?.players ?? {})).toEqual(Object.keys(save.players));
        expect(getPersistenceLoadReport().status).toBe("recovered_last_good");
        expect(getPersistenceLoadReport().recoveredFromLastGood).toBe(true);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("saves last-good snapshot before overwriting the current save", () => {
        const storage = createMemoryStorage();
        const adapter = createLocalStorageAdapter(storageKey);
        const save = toGameSave(createInitialGameState("0.4.0"));
        const oldEnvelope = createSaveEnvelopeV2(save, 111);
        storage.setItem(storageKey, JSON.stringify(oldEnvelope));
        (globalThis as { localStorage?: LocalStorageStub }).localStorage = storage;

        const nextSave = { ...save, version: "0.4.1" };
        adapter.save(nextSave);

        const lastGoodKey = lastGoodKeyFor(storageKey);
        expect(storage.getItem(lastGoodKey)).toBe(JSON.stringify(oldEnvelope));
        expect(storage.getItem(storageKey)).not.toBeNull();
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
