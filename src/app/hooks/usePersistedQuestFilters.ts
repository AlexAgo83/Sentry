import { useEffect, useState } from "react";

// Vitest exposes a global `vi`; use it to detect test mode for hooks that should avoid persistence.
declare const vi: { [key: string]: unknown } | undefined;
const isTestEnv = typeof vi !== "undefined" ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as unknown as { vitest?: unknown }).vitest)) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "test");

const QUEST_FILTERS_STORAGE_KEY = "sentry.questFilters";

export type QuestFilters = {
    showCompleted: boolean;
};

export const usePersistedQuestFilters = (defaultValue: QuestFilters) => {
    const [value, setValue] = useState<QuestFilters>(() => {
        if (isTestEnv) {
            return defaultValue;
        }
        if (typeof window === "undefined") {
            return defaultValue;
        }
        try {
            const raw = window.localStorage.getItem(QUEST_FILTERS_STORAGE_KEY);
            if (!raw) {
                return defaultValue;
            }
            const parsed = JSON.parse(raw);
            const showCompleted = typeof parsed?.showCompleted === "boolean"
                ? parsed.showCompleted
                : defaultValue.showCompleted;
            return { showCompleted };
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        if (isTestEnv) return;
        if (typeof window === "undefined") {
            return;
        }
        try {
            window.localStorage.setItem(QUEST_FILTERS_STORAGE_KEY, JSON.stringify(value));
        } catch {
            // ignore storage failures
        }
    }, [value]);

    return [value, setValue] as const;
};
