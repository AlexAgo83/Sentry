export const DEFAULT_STORAGE_KEY = "sentry-ts-save-v1";

export const lastGoodKeyFor = (storageKey: string) => `${storageKey}:lastGood`;

export const readRawSave = (storageKey = DEFAULT_STORAGE_KEY): string | null => {
    if (typeof localStorage === "undefined") {
        return null;
    }
    return localStorage.getItem(storageKey);
};

export const readRawLastGoodSave = (storageKey = DEFAULT_STORAGE_KEY): string | null => {
    if (typeof localStorage === "undefined") {
        return null;
    }
    return localStorage.getItem(lastGoodKeyFor(storageKey));
};

export const clearRawSaves = (storageKey = DEFAULT_STORAGE_KEY) => {
    if (typeof localStorage === "undefined") {
        return;
    }
    localStorage.removeItem(storageKey);
    localStorage.removeItem(lastGoodKeyFor(storageKey));
};
