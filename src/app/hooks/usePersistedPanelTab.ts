import { useEffect, useState } from "react";

// Vitest exposes a global `vi`; use it to detect test mode for hooks that should avoid persistence.
declare const vi: { [key: string]: unknown } | undefined;
const isTestEnv = typeof vi !== "undefined" ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as unknown as { vitest?: unknown }).vitest)) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "test");

const TAB_STORAGE_KEY = "sentry.panelTab";

export const usePersistedPanelTab = (panelKey: string, defaultValue: string) => {
    const [value, setValue] = useState<string>(() => {
        if (isTestEnv) {
            return defaultValue;
        }
        if (typeof window === "undefined") {
            return defaultValue;
        }
        try {
            const raw = window.localStorage.getItem(TAB_STORAGE_KEY);
            if (!raw) {
                return defaultValue;
            }
            const parsed = JSON.parse(raw);
            return typeof parsed?.[panelKey] === "string" ? parsed[panelKey] : defaultValue;
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
            const raw = window.localStorage.getItem(TAB_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            parsed[panelKey] = value;
            window.localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(parsed));
        } catch {
            // ignore storage failures
        }
    }, [panelKey, value]);

    return [value, setValue] as const;
};
