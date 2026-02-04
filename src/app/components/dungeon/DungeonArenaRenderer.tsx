import { memo, useEffect, useRef, useState } from "react";
import type { DungeonArenaFrame } from "./arenaPlayback";

type PixiModule = typeof import("pixi.js");

type DungeonArenaRendererProps = {
    frame: DungeonArenaFrame | null;
    className?: string;
};

type UnitNode = {
    container: any;
    body: any;
    hpBack: any;
    hpFill: any;
    targetRing: any;
    deathMark: any;
    label: any;
};

type PixiRuntime = {
    PIXI: PixiModule;
    app: any;
    world: any;
    arena: any;
    phaseLabel: any;
    unitNodes: Map<string, UnitNode>;
    floatingPool: any[];
    resizeObserver: ResizeObserver | null;
};

const WORLD_WIDTH = 1_000;
const WORLD_HEIGHT = 560;
const MAX_FLOAT_POOL = 24;

const toWorldX = (x: number) => x * WORLD_WIDTH;
const toWorldY = (y: number) => y * WORLD_HEIGHT;

const parseHexColor = (value: string | undefined, fallback: number) => {
    if (!value || !value.startsWith("#")) {
        return fallback;
    }
    const parsed = Number.parseInt(value.slice(1), 16);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const buildStarPolygon = (points: number, outerRadius: number, innerRadius: number): number[] => {
    const vertices: number[] = [];
    const total = points * 2;
    for (let i = 0; i < total; i += 1) {
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    return vertices;
};

const createUnitNode = (PIXI: PixiModule, world: any): UnitNode => {
    const container = new PIXI.Container();
    const body = new PIXI.Graphics();
    const hpBack = new PIXI.Graphics();
    const hpFill = new PIXI.Graphics();
    const targetRing = new PIXI.Graphics();
    const deathMark = new PIXI.Graphics();
    const label = new PIXI.Text("", {
        fill: 0xdde6f6,
        fontSize: 11,
        fontFamily: "monospace"
    });
    label.anchor.set(0.5, 0.5);
    label.position.set(0, 34);

    container.addChild(targetRing);
    container.addChild(body);
    container.addChild(hpBack);
    container.addChild(hpFill);
    container.addChild(deathMark);
    container.addChild(label);
    world.addChild(container);

    return { container, body, hpBack, hpFill, targetRing, deathMark, label };
};

const drawHeroBody = (node: UnitNode, unit: NonNullable<DungeonArenaFrame>["units"][number]) => {
    const skin = parseHexColor(unit.skinColor, 0xe2be95);
    const hair = parseHexColor(unit.hairColor, 0x5a402f);

    node.body.clear();
    node.body.beginFill(skin, unit.alive ? 1 : 0.5);
    node.body.drawCircle(0, 0, 16);
    node.body.endFill();

    node.body.beginFill(0x131722, 0.8);
    node.body.drawCircle(-5, -2, 1.6);
    node.body.drawCircle(5, -2, 1.6);
    node.body.endFill();

    if (unit.helmetVisible) {
        node.body.lineStyle(0);
        node.body.beginFill(0x8f97a8, unit.alive ? 0.95 : 0.4);
        node.body.drawRoundedRect(-17, -16, 34, 12, 5);
        node.body.endFill();
    } else {
        node.body.beginFill(hair, unit.alive ? 0.9 : 0.35);
        node.body.drawEllipse(0, -9, 13, 7);
        node.body.endFill();
    }
};

const drawEnemyBody = (node: UnitNode, unit: NonNullable<DungeonArenaFrame>["units"][number]) => {
    const baseColor = unit.isBoss ? 0xb02f2f : 0x9f5f2e;
    const accentColor = unit.isBoss ? 0xea6f5f : 0xc98b4e;
    const alpha = unit.alive ? 1 : 0.5;

    node.body.clear();
    node.body.lineStyle(2, 0x2a0d0d, alpha);
    node.body.beginFill(baseColor, alpha);
    node.body.drawCircle(0, 0, unit.isBoss ? 23 : 16);
    node.body.endFill();
    node.body.beginFill(accentColor, alpha);
    node.body.drawPolygon(buildStarPolygon(5, unit.isBoss ? 11 : 8, unit.isBoss ? 4.5 : 3.5));
    node.body.endFill();
};

const drawHp = (node: UnitNode, hp: number, hpMax: number) => {
    const ratio = hpMax > 0 ? Math.max(0, Math.min(1, hp / hpMax)) : 0;
    const width = 44;
    const height = 6;
    const left = -width / 2;
    const top = -34;

    node.hpBack.clear();
    node.hpBack.beginFill(0x0e1220, 0.85);
    node.hpBack.drawRoundedRect(left, top, width, height, 2);
    node.hpBack.endFill();

    node.hpFill.clear();
    node.hpFill.beginFill(ratio > 0.35 ? 0x4fcb99 : 0xe36d5f, 1);
    node.hpFill.drawRoundedRect(left + 1, top + 1, Math.max(0, (width - 2) * ratio), height - 2, 2);
    node.hpFill.endFill();
};

const drawTargetAndDeath = (node: UnitNode, isTarget: boolean, isAlive: boolean) => {
    node.targetRing.clear();
    if (isTarget) {
        node.targetRing.lineStyle(2, 0xf3c551, 0.9);
        node.targetRing.drawCircle(0, 0, 26);
    }

    node.deathMark.clear();
    if (!isAlive) {
        node.deathMark.lineStyle(3, 0xd24a4a, 0.9);
        node.deathMark.moveTo(-12, -12);
        node.deathMark.lineTo(12, 12);
        node.deathMark.moveTo(12, -12);
        node.deathMark.lineTo(-12, 12);
    }
};

const drawArena = (arena: any, frame: DungeonArenaFrame) => {
    arena.clear();
    arena.beginFill(0x0b111d, 0.95);
    arena.drawRoundedRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 24);
    arena.endFill();

    arena.lineStyle(2, 0x1f334d, 0.8);
    arena.drawEllipse(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 420, 230);

    arena.lineStyle(1, 0x25374f, 0.45);
    for (let i = 1; i < 6; i += 1) {
        const x = (WORLD_WIDTH / 6) * i;
        arena.moveTo(x, 28);
        arena.lineTo(x, WORLD_HEIGHT - 28);
    }
    for (let i = 1; i < 4; i += 1) {
        const y = (WORLD_HEIGHT / 4) * i;
        arena.moveTo(28, y);
        arena.lineTo(WORLD_WIDTH - 28, y);
    }

    if (frame.floorLabel) {
        const hash = Math.abs(frame.floorLabel.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
        const pulseAlpha = 0.04 + (hash % 6) * 0.01;
        arena.beginFill(0xf1635a, pulseAlpha);
        arena.drawCircle(WORLD_WIDTH * 0.82, WORLD_HEIGHT * 0.5, 72);
        arena.endFill();
    }
};

const getAutoFitScale = (viewportWidth: number, viewportHeight: number, units: DungeonArenaFrame["units"]) => {
    const viewportHalfWidth = Math.max(96, viewportWidth / 2 - 24);
    const viewportHalfHeight = Math.max(72, viewportHeight / 2 - 20);
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;
    let requiredHalfWidth = 220;
    let requiredHalfHeight = 160;

    units.forEach((unit) => {
        const x = toWorldX(unit.x);
        const y = toWorldY(unit.y);
        requiredHalfWidth = Math.max(requiredHalfWidth, Math.abs(x - centerX) + 72);
        requiredHalfHeight = Math.max(requiredHalfHeight, Math.abs(y - centerY) + 84);
    });

    const fitScale = Math.min(
        viewportHalfWidth / requiredHalfWidth,
        viewportHalfHeight / requiredHalfHeight
    );
    return Math.max(0.42, Math.min(1.1, fitScale));
};

const updateFrame = (runtime: PixiRuntime, frame: DungeonArenaFrame) => {
    drawArena(runtime.arena, frame);

    const seen = new Set<string>();
    frame.units.forEach((unit) => {
        const node = runtime.unitNodes.get(unit.id) ?? createUnitNode(runtime.PIXI, runtime.world);
        if (!runtime.unitNodes.has(unit.id)) {
            runtime.unitNodes.set(unit.id, node);
        }
        seen.add(unit.id);
        node.container.visible = true;
        node.container.position.set(toWorldX(unit.x), toWorldY(unit.y));
        node.label.text = unit.name;
        node.label.alpha = unit.alive ? 1 : 0.5;

        if (unit.isEnemy) {
            drawEnemyBody(node, unit);
        } else {
            drawHeroBody(node, unit);
        }
        drawHp(node, unit.hp, unit.hpMax);
        drawTargetAndDeath(node, frame.targetEnemyId === unit.id, unit.alive);
        node.container.alpha = unit.alive ? 1 : 0.6;
    });

    runtime.unitNodes.forEach((node, id) => {
        if (!seen.has(id)) {
            node.container.visible = false;
        }
    });

    if (runtime.floatingPool.length === 0) {
        for (let i = 0; i < MAX_FLOAT_POOL; i += 1) {
            const text = new runtime.PIXI.Text("", {
                fill: 0xffffff,
                fontSize: 14,
                fontFamily: "monospace",
                fontWeight: "700"
            });
            text.anchor.set(0.5, 0.5);
            text.visible = false;
            runtime.world.addChild(text);
            runtime.floatingPool.push(text);
        }
    }

    frame.floatingTexts.forEach((floating, index) => {
        const text = runtime.floatingPool[index];
        if (!text) {
            return;
        }
        const target = frame.units.find((unit) => unit.id === floating.targetId);
        if (!target) {
            text.visible = false;
            return;
        }
        text.visible = true;
        text.text = `${floating.kind === "heal" ? "+" : "-"}${floating.amount}`;
        text.tint = floating.kind === "heal" ? 0x5ed9aa : 0xf07d73;
        text.alpha = 1 - floating.progress;
        text.position.set(
            toWorldX(target.x),
            toWorldY(target.y) - 42 - floating.progress * 28
        );
    });
    for (let i = frame.floatingTexts.length; i < runtime.floatingPool.length; i += 1) {
        runtime.floatingPool[i].visible = false;
    }

    runtime.phaseLabel.visible = Boolean(frame.bossPhaseLabel);
    runtime.phaseLabel.text = frame.bossPhaseLabel ?? "";
    runtime.phaseLabel.position.set(WORLD_WIDTH / 2, 24);

    const viewportWidth = runtime.app.screen?.width ?? runtime.app.renderer.width;
    const viewportHeight = runtime.app.screen?.height ?? runtime.app.renderer.height;
    runtime.world.scale.set(getAutoFitScale(viewportWidth, viewportHeight, frame.units));
    runtime.world.pivot.set(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    runtime.world.position.set(viewportWidth / 2, viewportHeight / 2);
};

const isJsdom = () => {
    if (typeof navigator === "undefined") {
        return false;
    }
    return /jsdom/i.test(navigator.userAgent);
};

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
                const PIXI = await import("pixi.js");
                if (!mounted || !hostElement) {
                    return;
                }

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
                    fontWeight: "700"
                });
                phaseLabel.anchor.set(0.5, 0.5);
                phaseLabel.visible = false;
                world.addChild(arena);
                world.addChild(phaseLabel);
                app.stage.addChild(world);

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

                runtimeRef.current = {
                    PIXI,
                    app,
                    world,
                    arena,
                    phaseLabel,
                    unitNodes: new Map(),
                    floatingPool: [],
                    resizeObserver
                };
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
            runtime.resizeObserver?.disconnect();
            runtime.app.destroy(true, { children: true, texture: true, baseTexture: true });
            hostElement.innerHTML = "";
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
