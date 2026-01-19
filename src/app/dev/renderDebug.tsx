import { Profiler, useEffect, useRef } from "react";
import type { ProfilerOnRenderCallback, ReactNode } from "react";

export const RENDER_COUNTS_ENABLE_KEY = "sentry.debug.renderCounts";
export const PROFILER_ENABLE_KEY = "sentry.debug.profiler";
const GLOBAL_KEY = "__SENTRY_RENDER_COUNTS__";

type RenderCounts = Record<string, number>;

const isDev = Boolean(import.meta.env?.DEV);

export const isDebugEnabled = (key: string) => {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        return window.localStorage.getItem(key) === "1";
    } catch {
        return false;
    }
};

export const setDebugEnabled = (key: string, enabled: boolean) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        if (enabled) {
            window.localStorage.setItem(key, "1");
        } else {
            window.localStorage.removeItem(key);
        }
    } catch {
        // ignore
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

export const getRenderCountsSnapshot = (): RenderCounts => {
    if (typeof window === "undefined") {
        return {};
    }
    return { ...getCounts() };
};

export const resetRenderCounts = () => {
    if (typeof window === "undefined") {
        return;
    }
    (window as unknown as Record<string, unknown>)[GLOBAL_KEY] = {};
};

export const useRenderCount = (label: string) => {
    const hasMounted = useRef(false);
    const lastLoggedAt = useRef<number>(0);

    if (isDev && isDebugEnabled(RENDER_COUNTS_ENABLE_KEY)) {
        const counts = getCounts();
        counts[label] = (counts[label] ?? 0) + 1;
    }

    useEffect(() => {
        if (!isDev || !isDebugEnabled(RENDER_COUNTS_ENABLE_KEY)) {
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

type DevProfilerProps = {
    id: string;
    children: ReactNode;
    thresholdMs?: number;
};

const shouldLogProfile = (actualDuration: number, thresholdMs: number) => {
    return Number.isFinite(actualDuration) && actualDuration >= thresholdMs;
};

export const DevProfiler = ({ id, children, thresholdMs = 4 }: DevProfilerProps) => {
    if (!isDev || !isDebugEnabled(PROFILER_ENABLE_KEY)) {
        return <>{children}</>;
    }

    const onRender: ProfilerOnRenderCallback = (
        profilerId,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime
    ) => {
        if (!shouldLogProfile(actualDuration, thresholdMs)) {
            return;
        }
        console.debug("[profiler]", {
            id: profilerId,
            phase,
            actualDurationMs: Number(actualDuration.toFixed(2)),
            baseDurationMs: Number(baseDuration.toFixed(2)),
            startTimeMs: Number(startTime.toFixed(2)),
            commitTimeMs: Number(commitTime.toFixed(2)),
        });
    };

    return (
        <Profiler id={id} onRender={onRender}>
            {children}
        </Profiler>
    );
};
