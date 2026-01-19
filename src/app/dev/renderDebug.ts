import { useEffect, useRef } from "react";

const ENABLE_KEY = "sentry.debug.renderCounts";
const GLOBAL_KEY = "__SENTRY_RENDER_COUNTS__";

type RenderCounts = Record<string, number>;

const isEnabled = () => {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        return window.localStorage.getItem(ENABLE_KEY) === "1";
    } catch {
        return false;
    }
};

const getCounts = (): RenderCounts => {
    if (typeof window === "undefined") {
        return {};
    }
    const candidate = (window as unknown as Record<string, unknown>)[GLOBAL_KEY];
    if (candidate && typeof candidate === "object") {
        return candidate as RenderCounts;
    }
    const created: RenderCounts = {};
    (window as unknown as Record<string, unknown>)[GLOBAL_KEY] = created;
    return created;
};

export const useRenderCount = (label: string) => {
    const hasMounted = useRef(false);
    const lastLoggedAt = useRef<number>(0);

    if (import.meta.env.DEV && isEnabled()) {
        const counts = getCounts();
        counts[label] = (counts[label] ?? 0) + 1;
    }

    useEffect(() => {
        if (!import.meta.env.DEV || !isEnabled()) {
            return;
        }
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        const now = Date.now();
        if (now - lastLoggedAt.current < 1000) {
            return;
        }
        lastLoggedAt.current = now;
        const counts = getCounts();
        console.debug("[renderCounts]", { ...counts });
    });
};
