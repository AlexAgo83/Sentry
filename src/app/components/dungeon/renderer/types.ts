import type { DungeonArenaFrame } from "../arenaPlayback";

export type PixiModule = typeof import("pixi.js");

export type DungeonArenaRendererProps = {
    frame: DungeonArenaFrame | null;
    className?: string;
};

export type UnitNode = {
    container: any;
    body: any;
    hpBack: any;
    hpFill: any;
    targetRing: any;
    magicPulse: any;
    deathMark: any;
    label: any;
    combatIcon: any;
    lastHp?: number;
    damageAtMs?: number;
    damageRatio?: number;
    spawnAtMs?: number;
    shakeSeed?: number;
};

export type PixiRuntime = {
    PIXI: PixiModule;
    app: any;
    world: any;
    arena: any;
    phaseLabel: any;
    unitNodes: Map<string, UnitNode>;
    floatingPool: any[];
    floatingById: Map<string, any>;
    resizeObserver: ResizeObserver | null;
    lastSeen: Set<string>;
};
