import { useEffect, useState } from "react";

// Vitest exposes a global `vi`; use it to detect test mode for hooks that should avoid persistence.
declare const vi: { [key: string]: unknown } | undefined;
const isTestEnv = typeof vi !== "undefined" ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as unknown as { vitest?: unknown }).vitest)) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "test");

const PANEL_STORAGE_KEY = "sentry.panelCollapsed";

export const usePersistedCollapse = (panelKey: string, defaultValue = false) => {
    if (isTestEnv) {
        const [value, setValue] = useState<boolean>(defaultValue);
        return [value, setValue] as const;
    }
    const [value, setValue] = useState<boolean>(() => {
        if (typeof window === "undefined") {
            return defaultValue;
        }
        try {
            const raw = window.localStorage.getItem(PANEL_STORAGE_KEY);
            if (!raw) {
                return defaultValue;
            }
            const parsed = JSON.parse(raw);
            return typeof parsed?.[panelKey] === "boolean" ? parsed[panelKey] : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        if (isTestEnv) {
            return;
        }
        if (typeof window === "undefined") {
            return;
        }
        try {
            const raw = window.localStorage.getItem(PANEL_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            parsed[panelKey] = value;
            window.localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(parsed));
        } catch {
            // ignore storage failures
        }
    }, [panelKey, value]);

    return [value, setValue] as const;
};
