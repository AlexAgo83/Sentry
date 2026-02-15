import type { CSSProperties } from "react";
import type { DungeonArenaFrame } from "../arenaPlayback";

export type PixiModule = typeof import("pixi.js");

export type DungeonArenaRendererProps = {
    frame: DungeonArenaFrame | null;
    paused?: boolean;
    className?: string;
    style?: CSSProperties;
};

export type UnitNode = {
    container: any;
    silhouette: any;
    body: any;
    enemySprite?: any;
    attackBack: any;
    attackFill: any;
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
    vfxLayer: any;
    vfxTextures: {
        meleeArc: any;
        rangedProjectile: any;
        magicOrb: any;
    };
    entityTextures: {
        enemyMob: any;
        enemyBoss: any;
    };
    phaseLabel: any;
    unitNodes: Map<string, UnitNode>;
    floatingPool: any[];
    floatingById: Map<string, any>;
    attackVfxPool: any[];
    attackVfxByKey: Map<string, any>;
    resizeObserver: ResizeObserver | null;
    lastSeen: Set<string>;
};
