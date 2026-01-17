import { GameSave } from "../../core/types";
import { PersistenceAdapter } from "./types";

const DEFAULT_STORAGE_KEY = "sentry-ts-save-v1";

export const createLocalStorageAdapter = (storageKey = DEFAULT_STORAGE_KEY): PersistenceAdapter => {
    return {
        load: () => {
            if (typeof localStorage === "undefined") {
                return null;
            }
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                return null;
            }
            try {
                return JSON.parse(raw) as GameSave;
            } catch (error) {
                console.error("Failed to parse save data", error);
                return null;
            }
        },
        save: (save) => {
            if (typeof localStorage === "undefined") {
                return;
            }
            localStorage.setItem(storageKey, JSON.stringify(save));
        }
    };
};
