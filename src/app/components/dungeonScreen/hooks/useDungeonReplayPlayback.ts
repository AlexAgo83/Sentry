import { useCallback, useEffect, useRef, useState } from "react";
import type { DungeonReplayState } from "../../../../core/types";

export const useDungeonReplayPlayback = (
    latestReplay: DungeonReplayState | null,
    showReplay: boolean,
    frameIntervalMs: number
) => {
    const [replayPaused, setReplayPaused] = useState(true);
    const [replaySpeed, setReplaySpeed] = useState<0.2 | 0.5 | 1 | 2 | 4>(1);
    const [replayCursorMs, setReplayCursorMs] = useState(0);
    const replayCursorRef = useRef(0);
    const replayTotalMs = latestReplay ? Math.max(latestReplay.elapsedMs, latestReplay.events.at(-1)?.atMs ?? 0) : 0;

    const setReplayCursor = useCallback((next: number) => {
        replayCursorRef.current = next;
        setReplayCursorMs(next);
    }, []);

    useEffect(() => {
        setReplayCursorMs(() => {
            replayCursorRef.current = 0;
            return 0;
        });
        setReplayPaused(true);
        setReplaySpeed(1);
    }, [latestReplay?.runId]);

    useEffect(() => {
        if (!showReplay || !latestReplay || replayPaused || typeof window === "undefined") {
            return;
        }
        let rafId = 0;
        let lastTs = performance.now();
        let lastRenderTs = lastTs;
        let cursorMs = replayCursorRef.current;
        const animate = (nextTs: number) => {
            const deltaMs = Math.max(0, nextTs - lastTs);
            lastTs = nextTs;
            if (cursorMs >= replayTotalMs) {
                cursorMs = replayTotalMs;
            } else {
                cursorMs = Math.min(replayTotalMs, cursorMs + deltaMs * replaySpeed);
            }
            if (nextTs - lastRenderTs >= frameIntervalMs) {
                lastRenderTs = nextTs;
                setReplayCursorMs(() => {
                    replayCursorRef.current = cursorMs;
                    return cursorMs;
                });
            }
            rafId = window.requestAnimationFrame(animate);
        };
        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [showReplay, latestReplay, latestReplay?.runId, replayPaused, replaySpeed, replayTotalMs, frameIntervalMs]);

    useEffect(() => {
        if (!latestReplay || replayCursorMs < replayTotalMs) {
            return;
        }
        setReplayPaused(true);
    }, [latestReplay, replayCursorMs, replayTotalMs]);

    return {
        replayPaused,
        setReplayPaused,
        replaySpeed,
        setReplaySpeed,
        replayCursorMs,
        setReplayCursor,
        replayCursorRef,
        replayTotalMs
    };
};
