import { useCallback, useEffect, useState } from "react";
import type { SwUpdateAvailableDetail } from "../../pwa/serviceWorker";
import { activateWaitingServiceWorker, listenForSwUpdateAvailable } from "../../pwa/serviceWorker";

export const useServiceWorkerUpdatePrompt = () => {
    const [swUpdate, setSwUpdate] = useState<SwUpdateAvailableDetail | null>(null);
    const [ignoredSwVersion, setIgnoredSwVersion] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        return listenForSwUpdateAvailable((detail) => {
            if (ignoredSwVersion === detail.version) {
                return;
            }
            setSwUpdate((prev) => prev ?? detail);
        });
    }, [ignoredSwVersion]);

    const closeSwUpdate = useCallback(() => {
        setSwUpdate((prev) => {
            if (prev) {
                setIgnoredSwVersion(prev.version);
            }
            return null;
        });
    }, []);

    const reloadSwUpdate = useCallback(() => {
        setSwUpdate((prev) => {
            if (!activateWaitingServiceWorker(prev?.registration ?? null)) {
                return prev;
            }
            return null;
        });
    }, []);

    return { swUpdate, closeSwUpdate, reloadSwUpdate };
};
