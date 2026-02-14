import { useEffect, useRef, useState } from "react";
import type { DungeonRunState } from "../../../../core/types";
import { DUNGEON_FLOAT_WINDOW_MS } from "../../dungeon/arenaPlayback";

export const useDungeonLivePlayback = (activeRun: DungeonRunState | null, frameIntervalMs: number) => {
    const [liveCursorMs, setLiveCursorMs] = useState(0);
    const liveCursorRef = useRef(0);
    const liveTotalMs = activeRun ? Math.max(activeRun.elapsedMs, activeRun.events.at(-1)?.atMs ?? 0) : 0;
    const activeRunId = activeRun?.id ?? null;
    const liveTotalMsRef = useRef(0);

    useEffect(() => {
        liveTotalMsRef.current = liveTotalMs;
    }, [liveTotalMs]);

    useEffect(() => {
        if (!activeRunId) {
            return;
        }
        setLiveCursorMs(() => {
            const next = liveTotalMsRef.current;
            liveCursorRef.current = next;
            return next;
        });
    }, [activeRunId]);

    useEffect(() => {
        if (!activeRunId || typeof window === "undefined") {
            return;
        }
        let rafId = 0;
        let lastTs = performance.now();
        let lastRenderTs = lastTs;
        let cursorMs = liveCursorRef.current;
        const allowOverrun = Boolean(activeRun?.restartAt);
        const animate = (nextTs: number) => {
            const deltaMs = Math.max(0, nextTs - lastTs);
            lastTs = nextTs;
            const targetMs = liveTotalMsRef.current;
            const overrunCap = targetMs + DUNGEON_FLOAT_WINDOW_MS * 2;
            if (cursorMs >= targetMs) {
                cursorMs = allowOverrun ? Math.min(overrunCap, cursorMs + deltaMs) : targetMs;
            } else {
                cursorMs = Math.min(targetMs, cursorMs + deltaMs);
            }
            if (nextTs - lastRenderTs >= frameIntervalMs) {
                lastRenderTs = nextTs;
                setLiveCursorMs(() => {
                    liveCursorRef.current = cursorMs;
                    return cursorMs;
                });
            }
            rafId = window.requestAnimationFrame(animate);
        };
        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [activeRunId, activeRun?.restartAt, frameIntervalMs]);

    return {
        liveCursorMs,
        liveTotalMs
    };
};
