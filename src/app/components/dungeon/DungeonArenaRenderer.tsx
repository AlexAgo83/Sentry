import { memo, useEffect, useRef, useState } from "react";
import { createPixiRuntime, destroyPixiRuntime, isJsdom } from "./renderer/runtime";
import { updateFrame } from "./renderer/updateFrame";
import type { DungeonArenaRendererProps, PixiRuntime } from "./renderer/types";

export const DungeonArenaRenderer = memo(({
    frame,
    paused,
    className,
    style
}: DungeonArenaRendererProps) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const runtimeRef = useRef<PixiRuntime | null>(null);
    const frameRef = useRef(frame);
    const tailRafRef = useRef<number | null>(null);
    const [disabled, setDisabled] = useState(false);

    frameRef.current = frame;

    const clearAttackVfx = (runtime: PixiRuntime) => {
        // Hide and release all VFX nodes so they don't "stick" while paused.
        runtime.attackVfxByKey.forEach((node) => {
            const container = (node as any).container;
            const melee = (node as any).melee;
            const ranged = (node as any).ranged;
            const magicOrbs = (node as any).magicOrbs as any[] | undefined;
            if (container) container.visible = false;
            if (melee) melee.visible = false;
            if (ranged) ranged.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            (node as any).__vfxKey = undefined;
        });
        runtime.attackVfxByKey.clear();
        runtime.attackVfxPool.forEach((node) => {
            const container = (node as any).container;
            const melee = (node as any).melee;
            const ranged = (node as any).ranged;
            const magicOrbs = (node as any).magicOrbs as any[] | undefined;
            if (container) container.visible = false;
            if (melee) melee.visible = false;
            if (ranged) ranged.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            (node as any).__vfxKey = undefined;
        });
    };

    useEffect(() => {
        const hostElement = hostRef.current;
        if (typeof window === "undefined" || !hostElement || isJsdom()) {
            setDisabled(true);
            return;
        }
        let mounted = true;

        const boot = async () => {
            try {
                const runtime = await createPixiRuntime(hostElement);
                if (!mounted) {
                    destroyPixiRuntime(runtime, hostElement);
                    return;
                }
                runtimeRef.current = runtime;
                if (frameRef.current) {
                    updateFrame(runtime, frameRef.current);
                }
                setDisabled(false);
            } catch {
                setDisabled(true);
            }
        };

        void boot();

        return () => {
            mounted = false;
            const runtime = runtimeRef.current;
            runtimeRef.current = null;
            if (!runtime) {
                return;
            }
            destroyPixiRuntime(runtime, hostElement);
        };
    }, []);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime || !frame) {
            return;
        }
        if (tailRafRef.current) {
            cancelAnimationFrame(tailRafRef.current);
            tailRafRef.current = null;
        }
        const renderFrame = paused
            ? { ...frame, statusLabel: "paused", attackCues: [], magicCues: [] }
            : frame;
        try {
            updateFrame(runtime, renderFrame);
        } catch {
            setDisabled(true);
            return;
        }

        if (paused) {
            clearAttackVfx(runtime);
            return;
        }

        // When a dungeon finishes, the upstream frame clock typically stops progressing.
        // Run a short tail animation so any queued VFX can finish their lifespan instead
        // of freezing on screen.
        //
        // IMPORTANT: replay frames can carry a global end status (victory/failed) even
        // while the timeline cursor is mid-run. Only tail when we're at the end of the
        // timeline, otherwise we create two competing clocks and visuals will flicker.
        const status = renderFrame.statusLabel ?? "";
        const isAtEnd = Number.isFinite(renderFrame.totalMs) && renderFrame.atMs >= renderFrame.totalMs;
        if (status !== "running" && isAtEnd && runtime.attackVfxByKey.size > 0) {
            const baseAtMs = renderFrame.atMs;
            const start = performance.now();
            const MAX_TAIL_MS = 1_200;

            const tick = () => {
                const rt = runtimeRef.current;
                if (!rt) {
                    return;
                }
                const elapsed = performance.now() - start;
                const atMs = baseAtMs + elapsed;
                try {
                    // Avoid spawning new motion cues while we let already-spawned VFX expire.
                    updateFrame(rt, { ...renderFrame, atMs, attackCues: [], magicCues: [] });
                } catch {
                    setDisabled(true);
                    return;
                }

                if (elapsed < MAX_TAIL_MS && rt.attackVfxByKey.size > 0) {
                    tailRafRef.current = requestAnimationFrame(tick);
                } else {
                    tailRafRef.current = null;
                }
            };

            tailRafRef.current = requestAnimationFrame(tick);
        }

        return () => {
            if (tailRafRef.current) {
                cancelAnimationFrame(tailRafRef.current);
                tailRafRef.current = null;
            }
        };
    }, [frame, paused]);

    return (
        <div
            ref={hostRef}
            className={`ts-dungeon-arena${className ? ` ${className}` : ""}${disabled ? " is-disabled" : ""}`}
            style={style}
            data-testid="dungeon-arena-renderer"
            aria-label="Dungeon arena renderer"
        >
            {disabled ? (
                <div className="ts-dungeon-arena-fallback">
                    Arena renderer unavailable in this environment.
                </div>
            ) : null}
        </div>
    );
});

DungeonArenaRenderer.displayName = "DungeonArenaRenderer";
