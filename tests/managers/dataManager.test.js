import { suite, test, expect } from "vitest";
import { Engine } from "../../src/engine.js";

suite("DataManager", () => {
    test("saves and loads player data", () => {
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

        const engine = new Engine();
        engine.lastIntervalTime = 1234;
        const player = engine.playerManager.createPlayer(1, false);
        player.setName("Hero");
        const combatSkill = player.getSkillByID("Combat");
        combatSkill.xp = 42;

        engine.dataManager.save();

        const engineReloaded = new Engine();
        engineReloaded.dataManager.load();
        const loadedPlayer = engineReloaded.playerManager
            .getPlayers()
            .find((entry) => entry.getIdentifier() === 1);

        expect(engineReloaded.lastIntervalTime).toBe(1234);
        expect(loadedPlayer?.getName()).toBe("Hero");
        expect(loadedPlayer?.getSkillByID("Combat")?.xp).toBe(42);

        localStorageMock.clear();
        globalThis.localStorage = localStorageBackup;
    });
});
