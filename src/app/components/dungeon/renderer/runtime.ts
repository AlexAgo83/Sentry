import type { PixiRuntime } from "./types";

export const isJsdom = () => {
    if (typeof navigator === "undefined") {
        return false;
    }
    return /jsdom/i.test(navigator.userAgent);
};

export const createPixiRuntime = async (hostElement: HTMLDivElement): Promise<PixiRuntime> => {
    const PIXI = await import("pixi.js");

    const bounds = hostElement.getBoundingClientRect();
    const app = new PIXI.Application({
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        backgroundAlpha: 0,
        width: Math.max(320, Math.floor(bounds.width || 640)),
        height: Math.max(220, Math.floor(bounds.height || 360))
    });
    hostElement.appendChild(app.view as HTMLCanvasElement);

    const world = new PIXI.Container();
    const arena = new PIXI.Graphics();
    const phaseLabel = new PIXI.Text("", {
        fill: 0xf5d18b,
        fontSize: 14,
        fontFamily: "monospace",
        fontWeight: "700",
        stroke: 0x000000,
        strokeThickness: 4,
        lineJoin: "round"
    });
    phaseLabel.anchor.set(0.5, 0.5);
    phaseLabel.visible = false;
    world.addChild(arena);
    app.stage.addChild(world);
    app.stage.addChild(phaseLabel);

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver((entries) => {
            const next = entries[0]?.contentRect;
            if (!next) {
                return;
            }
            const width = Math.max(320, Math.floor(next.width));
            const height = Math.max(220, Math.floor(next.height));
            app.renderer.resize(width, height);
        });
        resizeObserver.observe(hostElement);
    }

    return {
        PIXI,
        app,
        world,
        arena,
        phaseLabel,
        unitNodes: new Map(),
        floatingPool: [],
        floatingById: new Map(),
        resizeObserver,
        lastSeen: new Set()
    };
};

export const destroyPixiRuntime = (runtime: PixiRuntime, hostElement: HTMLDivElement) => {
    runtime.resizeObserver?.disconnect();
    runtime.app.destroy(true, { children: true, texture: true, baseTexture: true });
    hostElement.innerHTML = "";
};
