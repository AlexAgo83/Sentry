import { memo, useEffect, useRef, useState } from "react";
import { createPixiRuntime, destroyPixiRuntime, isJsdom } from "./renderer/runtime";
import { updateFrame } from "./renderer/updateFrame";
import type { DungeonArenaRendererProps, PixiRuntime } from "./renderer/types";

export const DungeonArenaRenderer = memo(({
    frame,
    className
}: DungeonArenaRendererProps) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const runtimeRef = useRef<PixiRuntime | null>(null);
    const [disabled, setDisabled] = useState(false);

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
        updateFrame(runtime, frame);
    }, [frame]);

    return (
        <div
            ref={hostRef}
            className={`ts-dungeon-arena${className ? ` ${className}` : ""}${disabled ? " is-disabled" : ""}`}
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
