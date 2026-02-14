import { useCallback, useEffect, useState } from "react";

const GRAPHICS_SETTINGS_STORAGE_KEY = "sentry.graphicsSettings";
const GRAPHICS_SETTINGS_EVENT = "sentry:graphics-settings";

export type GraphicsSettings = {
    smoothActionProgress: boolean;
    forceCollapsedSkinPreview: boolean;
};

const DEFAULT_GRAPHICS_SETTINGS: GraphicsSettings = {
    smoothActionProgress: true,
    forceCollapsedSkinPreview: false
};

const normalizeGraphicsSettings = (value: unknown): GraphicsSettings => {
    if (!value || typeof value !== "object") {
        return DEFAULT_GRAPHICS_SETTINGS;
    }
    const smoothActionProgress = (value as { smoothActionProgress?: unknown }).smoothActionProgress;
    const forceCollapsedSkinPreview = (value as { forceCollapsedSkinPreview?: unknown }).forceCollapsedSkinPreview;
    const normalized = {
        smoothActionProgress: typeof smoothActionProgress === "boolean"
            ? smoothActionProgress
            : DEFAULT_GRAPHICS_SETTINGS.smoothActionProgress,
        forceCollapsedSkinPreview: typeof forceCollapsedSkinPreview === "boolean"
            ? forceCollapsedSkinPreview
            : DEFAULT_GRAPHICS_SETTINGS.forceCollapsedSkinPreview
    };
    if (normalized.forceCollapsedSkinPreview) {
        return {
            ...normalized,
            smoothActionProgress: false
        };
    }
    return normalized;
};

const readGraphicsSettings = (): GraphicsSettings => {
    if (typeof window === "undefined") {
        return DEFAULT_GRAPHICS_SETTINGS;
    }
    try {
        const raw = window.localStorage.getItem(GRAPHICS_SETTINGS_STORAGE_KEY);
        if (!raw) {
            return DEFAULT_GRAPHICS_SETTINGS;
        }
        return normalizeGraphicsSettings(JSON.parse(raw));
    } catch {
        return DEFAULT_GRAPHICS_SETTINGS;
    }
};

const writeGraphicsSettings = (settings: GraphicsSettings) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(GRAPHICS_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Ignore persistence failures for optional graphics settings.
    }
};

const emitGraphicsSettingsChange = () => {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new Event(GRAPHICS_SETTINGS_EVENT));
};

export const useGraphicsSettings = () => {
    const [settings, setSettings] = useState<GraphicsSettings>(() => readGraphicsSettings());

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const syncFromStorage = () => {
            setSettings(readGraphicsSettings());
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key && event.key !== GRAPHICS_SETTINGS_STORAGE_KEY) {
                return;
            }
            syncFromStorage();
        };

        window.addEventListener(GRAPHICS_SETTINGS_EVENT, syncFromStorage);
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener(GRAPHICS_SETTINGS_EVENT, syncFromStorage);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const setSmoothActionProgress = useCallback((enabled: boolean) => {
        setSettings((previous) => {
            const resolvedEnabled = previous.forceCollapsedSkinPreview ? false : enabled;
            if (previous.smoothActionProgress === resolvedEnabled) {
                return previous;
            }
            const next = { ...previous, smoothActionProgress: resolvedEnabled };
            writeGraphicsSettings(next);
            emitGraphicsSettingsChange();
            return next;
        });
    }, []);

    const setForceCollapsedSkinPreview = useCallback((enabled: boolean) => {
        setSettings((previous) => {
            const smoothActionProgress = enabled ? false : previous.smoothActionProgress;
            if (
                previous.forceCollapsedSkinPreview === enabled
                && previous.smoothActionProgress === smoothActionProgress
            ) {
                return previous;
            }
            const next = {
                ...previous,
                forceCollapsedSkinPreview: enabled,
                smoothActionProgress
            };
            writeGraphicsSettings(next);
            emitGraphicsSettingsChange();
            return next;
        });
    }, []);

    return {
        settings,
        setSmoothActionProgress,
        setForceCollapsedSkinPreview
    };
};
