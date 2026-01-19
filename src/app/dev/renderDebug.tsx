import { Profiler, useEffect } from "react";
import type { ProfilerOnRenderCallback, ReactNode } from "react";

export const RENDER_COUNTS_ENABLE_KEY = "sentry.debug.renderCounts";
export const PROFILER_ENABLE_KEY = "sentry.debug.profiler";
const GLOBAL_KEY = "__SENTRY_RENDER_COUNTS__";

type RenderCounts = Record<string, number>;

const isDev = Boolean(import.meta.env?.DEV);
const RENDER_COUNTS_LOG_INTERVAL_MS = 1000;
const PROFILER_LOG_INTERVAL_MS = 1000;
const PROFILER_TOP_LIMIT = 8;

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

let renderCountsLogTimer: number | null = null;
let lastRenderCountsSnapshot: RenderCounts = {};

const stopRenderCountsLogger = () => {
    if (typeof window === "undefined") {
        return;
    }
    if (renderCountsLogTimer !== null) {
        window.clearInterval(renderCountsLogTimer);
        renderCountsLogTimer = null;
    }
    lastRenderCountsSnapshot = {};
};

const ensureRenderCountsLogger = () => {
    if (typeof window === "undefined") {
        return;
    }
    if (!isDev || !isDebugEnabled(RENDER_COUNTS_ENABLE_KEY)) {
        stopRenderCountsLogger();
        return;
    }
    if (renderCountsLogTimer !== null) {
        return;
    }

    renderCountsLogTimer = window.setInterval(() => {
        if (!isDev || !isDebugEnabled(RENDER_COUNTS_ENABLE_KEY)) {
            stopRenderCountsLogger();
            return;
        }
        const counts = getCounts();
        const delta: RenderCounts = {};
        for (const [key, value] of Object.entries(counts)) {
            const prev = lastRenderCountsSnapshot[key] ?? 0;
            const next = value - prev;
            if (next > 0) {
                delta[key] = next;
            }
        }
        lastRenderCountsSnapshot = { ...counts };
        if (Object.keys(delta).length === 0) {
            return;
        }
        console.debug("[renderCounts] (+1s)", delta);
    }, RENDER_COUNTS_LOG_INTERVAL_MS);
};

export const useRenderCount = (label: string) => {
    if (isDev && isDebugEnabled(RENDER_COUNTS_ENABLE_KEY)) {
        const counts = getCounts();
        counts[label] = (counts[label] ?? 0) + 1;
        ensureRenderCountsLogger();
    }
};

type DevProfilerProps = {
    id: string;
    children: ReactNode;
    thresholdMs?: number;
};

const shouldLogProfile = (actualDuration: number, thresholdMs: number) => {
    return Number.isFinite(actualDuration) && actualDuration >= thresholdMs;
};

type ProfilerAggregate = {
    count: number;
    totalActualMs: number;
    totalBaseMs: number;
    maxActualMs: number;
    maxBaseMs: number;
    lastPhase: string;
    lastCommitTimeMs: number;
};

let profilerLogTimer: number | null = null;
let profilerBuffer: Record<string, ProfilerAggregate> = {};
let profilerActiveConsumers = 0;

const stopProfilerLogger = () => {
    if (typeof window === "undefined") {
        return;
    }
    if (profilerLogTimer !== null) {
        window.clearInterval(profilerLogTimer);
        profilerLogTimer = null;
    }
    profilerBuffer = {};
};

const flushProfiler = () => {
    if (typeof window === "undefined") {
        return;
    }
    if (!isDev || !isDebugEnabled(PROFILER_ENABLE_KEY)) {
        profilerBuffer = {};
        return;
    }
    const entries = Object.entries(profilerBuffer);
    profilerBuffer = {};
    if (entries.length === 0) {
        return;
    }

    const summary = entries
        .map(([key, value]) => ({
            id: key,
            count: value.count,
            avgActualMs: Number((value.totalActualMs / value.count).toFixed(2)),
            maxActualMs: Number(value.maxActualMs.toFixed(2)),
            avgBaseMs: Number((value.totalBaseMs / value.count).toFixed(2)),
            maxBaseMs: Number(value.maxBaseMs.toFixed(2)),
            lastPhase: value.lastPhase,
            lastCommitTimeMs: Number(value.lastCommitTimeMs.toFixed(2))
        }))
        .sort((a, b) => b.maxActualMs - a.maxActualMs)
        .slice(0, PROFILER_TOP_LIMIT);

    console.debug(`[profiler] (last ${PROFILER_LOG_INTERVAL_MS}ms)`, summary);
};

const ensureProfilerLogger = () => {
    if (typeof window === "undefined") {
        return;
    }
    if (!isDev || !isDebugEnabled(PROFILER_ENABLE_KEY)) {
        stopProfilerLogger();
        return;
    }
    if (profilerLogTimer !== null) {
        return;
    }
    profilerLogTimer = window.setInterval(() => {
        if (!isDev || !isDebugEnabled(PROFILER_ENABLE_KEY)) {
            stopProfilerLogger();
            return;
        }
        flushProfiler();
    }, PROFILER_LOG_INTERVAL_MS);
};

export const DevProfiler = ({ id, children, thresholdMs = 4 }: DevProfilerProps) => {
    const enabled = isDev && isDebugEnabled(PROFILER_ENABLE_KEY);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        if (!enabled) {
            return;
        }

        profilerActiveConsumers += 1;
        ensureProfilerLogger();
        return () => {
            profilerActiveConsumers = Math.max(0, profilerActiveConsumers - 1);
            if (profilerActiveConsumers === 0) {
                stopProfilerLogger();
            }
        };
    }, [enabled]);

    if (!enabled) {
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
        void startTime;
        if (!shouldLogProfile(actualDuration, thresholdMs)) {
            return;
        }
        ensureProfilerLogger();
        const key = String(profilerId);
        const existing = profilerBuffer[key];
        if (existing) {
            existing.count += 1;
            existing.totalActualMs += actualDuration;
            existing.totalBaseMs += baseDuration;
            existing.maxActualMs = Math.max(existing.maxActualMs, actualDuration);
            existing.maxBaseMs = Math.max(existing.maxBaseMs, baseDuration);
            existing.lastPhase = phase;
            existing.lastCommitTimeMs = commitTime;
        } else {
            profilerBuffer[key] = {
                count: 1,
                totalActualMs: actualDuration,
                totalBaseMs: baseDuration,
                maxActualMs: actualDuration,
                maxBaseMs: baseDuration,
                lastPhase: phase,
                lastCommitTimeMs: commitTime
            };
        }
    };

    return (
        <Profiler id={id} onRender={onRender}>
            {children}
        </Profiler>
    );
};
