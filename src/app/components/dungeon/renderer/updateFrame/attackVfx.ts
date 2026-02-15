import type { DungeonArenaFrame } from "../../arenaPlayback";
import {
    DAMAGE_TINT_COLOR,
    MAGIC_BEAM_VFX_MS,
    MAGIC_ORBS_VFX_RADIUS,
    MAGIC_ORBS_VFX_SPACING,
    MAGIC_ORBS_VFX_TRAIL,
    MAX_ATTACK_VFX_POOL,
    MELEE_ARC_VFX_MS,
    MELEE_ARC_VFX_OFFSET,
    PROJECTILE_VFX_RADIUS,
    RANGED_PROJECTILE_VFX_MS,
    RANGED_PROJECTILE_VFX_SCALE,
    VFX_SVG_BASE_MAGIC_ORB_RADIUS,
    VFX_SVG_BASE_PROJECTILE_RADIUS
} from "../constants";
import { clamp, toWorldX, toWorldY } from "../math";
import type { PixiRuntime } from "../types";

export type AttackVfxKind = "melee_arc" | "ranged_projectile" | "magic_beam";

export const resolveAttackVfxKind = (weaponType?: string | null): AttackVfxKind => {
    if (weaponType === "Ranged") {
        return "ranged_projectile";
    }
    if (weaponType === "Magic") {
        return "magic_beam";
    }
    return "melee_arc";
};

export const shouldApplyLunge = (weaponType?: string | null) => resolveAttackVfxKind(weaponType) === "melee_arc";

const getAttackVfxDurationMs = (kind: AttackVfxKind) => {
    if (kind === "ranged_projectile") {
        return RANGED_PROJECTILE_VFX_MS;
    }
    if (kind === "magic_beam") {
        return MAGIC_BEAM_VFX_MS;
    }
    return MELEE_ARC_VFX_MS;
};

export type AttackVfxSpec = {
    key: string;
    kind: AttackVfxKind;
    sourceId: string;
    targetId: string;
    atMs: number;
};

const buildAttackVfxKey = (spec: Omit<AttackVfxSpec, "key">) => (
    `${spec.kind}:${spec.sourceId}:${spec.targetId}:${spec.atMs}`
);

const getAttackVfxSpecsForUnitMap = (
    frame: DungeonArenaFrame,
    unitById: Map<string, DungeonArenaFrame["units"][number]>
) => {
    const specs: AttackVfxSpec[] = [];
    frame.attackCues.forEach((cue) => {
        const source = unitById.get(cue.sourceId);
        const target = unitById.get(cue.targetId);
        if (!source || !target) {
            return;
        }
        const kind = resolveAttackVfxKind(source.weaponType);
        const core = { kind, sourceId: cue.sourceId, targetId: cue.targetId, atMs: cue.atMs };
        specs.push({ ...core, key: buildAttackVfxKey(core) });
    });
    return specs;
};

export const getAttackVfxSpecs = (frame: DungeonArenaFrame) => {
    const unitById = new Map(frame.units.map((unit) => [unit.id, unit]));
    return getAttackVfxSpecsForUnitMap(frame, unitById);
};

export const ensureAttackVfxPool = (runtime: PixiRuntime) => {
    if (runtime.attackVfxPool.length > 0) {
        return;
    }
    for (let i = 0; i < MAX_ATTACK_VFX_POOL; i += 1) {
        const container = new runtime.PIXI.Container();
        container.visible = false;
        container.alpha = 1;

        const melee = new runtime.PIXI.Sprite(runtime.vfxTextures.meleeArc);
        melee.anchor.set(0.5, 0.5);
        melee.visible = false;

        const ranged = new runtime.PIXI.Sprite(runtime.vfxTextures.rangedProjectile);
        ranged.anchor.set(0.5, 0.5);
        ranged.visible = false;

        const magicOrbs: any[] = [];
        for (let j = 0; j < 10; j += 1) {
            const orb = new runtime.PIXI.Sprite(runtime.vfxTextures.magicOrb);
            orb.anchor.set(0.5, 0.5);
            orb.visible = false;
            magicOrbs.push(orb);
            container.addChild(orb);
        }

        container.addChild(melee);
        container.addChild(ranged);
        runtime.vfxLayer.addChild(container);
        runtime.attackVfxPool.push({ container, melee, ranged, magicOrbs });
    }
};

const acquireAttackVfxNode = (runtime: PixiRuntime, key: string) => {
    const existing = runtime.attackVfxByKey.get(key);
    if (existing) {
        return existing;
    }
    const freeNode = runtime.attackVfxPool.find((candidate) => !(candidate as any).__vfxKey);
    if (!freeNode) {
        return null;
    }
    (freeNode as any).__vfxKey = key;
    runtime.attackVfxByKey.set(key, freeNode);
    return freeNode;
};

export const syncAttackVfxSpecs = (
    runtime: PixiRuntime,
    frame: DungeonArenaFrame,
    unitById: Map<string, DungeonArenaFrame["units"][number]>
) => {
    const specs = getAttackVfxSpecsForUnitMap(frame, unitById);
    specs.forEach((spec) => {
        const node = acquireAttackVfxNode(runtime, spec.key);
        if (!node) {
            return;
        }
        (node as any).__vfxKind = spec.kind;
        (node as any).__vfxSourceId = spec.sourceId;
        (node as any).__vfxTargetId = spec.targetId;
        (node as any).__vfxAtMs = spec.atMs;
    });
};

export const renderAttackVfx = (
    runtime: PixiRuntime,
    frame: DungeonArenaFrame,
    unitById: Map<string, DungeonArenaFrame["units"][number]>,
    colors: { melee: number; ranged: number; magic: number }
) => {
    const vfxKeysToRelease: string[] = [];
    runtime.attackVfxByKey.forEach((node, key) => {
        const kind = (node as any).__vfxKind as AttackVfxKind | undefined;
        const sourceId = String((node as any).__vfxSourceId ?? "");
        const targetId = String((node as any).__vfxTargetId ?? "");
        const atMs = Number((node as any).__vfxAtMs);
        const container = (node as any).container;
        const melee = (node as any).melee;
        const ranged = (node as any).ranged;
        const magicOrbs = (node as any).magicOrbs as any[] | undefined;
        if (!kind || !sourceId || !targetId || !Number.isFinite(atMs)) {
            container.visible = false;
            if (melee) melee.visible = false;
            if (ranged) ranged.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            (node as any).__vfxKey = undefined;
            vfxKeysToRelease.push(key);
            return;
        }

        const durationMs = getAttackVfxDurationMs(kind);
        const age = frame.atMs - atMs;
        if (age < 0) {
            container.visible = false;
            return;
        }
        if (age > durationMs) {
            container.visible = false;
            if (melee) melee.visible = false;
            if (ranged) ranged.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            (node as any).__vfxKey = undefined;
            vfxKeysToRelease.push(key);
            return;
        }

        const sourceUnit = unitById.get(sourceId);
        const targetUnit = unitById.get(targetId);
        if (!sourceUnit || !targetUnit) {
            container.visible = false;
            if (melee) melee.visible = false;
            if (ranged) ranged.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            (node as any).__vfxKey = undefined;
            vfxKeysToRelease.push(key);
            return;
        }

        const vfxColor = sourceUnit.isEnemy
            ? DAMAGE_TINT_COLOR
            : (kind === "melee_arc" ? colors.melee : kind === "ranged_projectile" ? colors.ranged : colors.magic);

        const sourceNode = runtime.unitNodes.get(sourceId);
        const targetNode = runtime.unitNodes.get(targetId);
        const sx = Number(sourceNode?.container?.position?.x) || toWorldX(sourceUnit.x);
        const sy = Number(sourceNode?.container?.position?.y) || toWorldY(sourceUnit.y);
        const tx = Number(targetNode?.container?.position?.x) || toWorldX(targetUnit.x);
        const ty = Number(targetNode?.container?.position?.y) || toWorldY(targetUnit.y);
        const dx = tx - sx;
        const dy = ty - sy;
        const length = Math.hypot(dx, dy) || 1;
        const nx = dx / length;
        const ny = dy / length;

        const progress = clamp(age / durationMs, 0, 1);
        const alpha = clamp(1 - progress, 0, 1);

        container.visible = alpha > 0.02;
        container.alpha = 1;

        if (kind === "melee_arc") {
            const angle = Math.atan2(dy, dx);
            container.position.set(sx + nx * MELEE_ARC_VFX_OFFSET, sy + ny * MELEE_ARC_VFX_OFFSET);
            container.rotation = angle;
            if (ranged) ranged.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            melee.visible = true;
            melee.tint = vfxColor;
            melee.alpha = clamp(0.2 + 0.8 * alpha, 0, 1);
            melee.scale.set(1 + progress * 0.12);
        } else if (kind === "ranged_projectile") {
            const t = 1 - Math.pow(1 - clamp(progress * 1.08, 0, 1), 3);
            const angle = Math.atan2(dy, dx);
            container.position.set(sx + dx * t, sy + dy * t);
            container.rotation = angle;
            if (melee) melee.visible = false;
            if (Array.isArray(magicOrbs)) magicOrbs.forEach((orb) => { orb.visible = false; });
            ranged.visible = true;
            ranged.tint = vfxColor;
            ranged.alpha = clamp(0.15 + 0.85 * alpha, 0, 1);
            const base = PROJECTILE_VFX_RADIUS / Math.max(1e-4, VFX_SVG_BASE_PROJECTILE_RADIUS);
            const scale = RANGED_PROJECTILE_VFX_SCALE * base * (0.95 + (1 - progress) * 0.15);
            ranged.scale.set(scale);
        } else {
            // Magic: a moving trail of orbs (sprites) along the path.
            container.position.set(sx, sy);
            container.rotation = 0;
            if (melee) melee.visible = false;
            if (ranged) ranged.visible = false;

            const count = clamp(Math.round(length / MAGIC_ORBS_VFX_SPACING) + 1, 4, 10);
            const head = clamp(progress * 1.18, 0, 1);
            const tail = clamp(head - MAGIC_ORBS_VFX_TRAIL, 0, 1);
            const span = Math.max(1e-4, head - tail);

            const base = MAGIC_ORBS_VFX_RADIUS / Math.max(1e-4, VFX_SVG_BASE_MAGIC_ORB_RADIUS);
            for (let i = 0; i < 10; i += 1) {
                const orb = (magicOrbs && magicOrbs[i]) ? magicOrbs[i] : null;
                if (!orb) {
                    continue;
                }
                orb.visible = i < count;
                if (!orb.visible) {
                    continue;
                }
                const t = count === 1 ? 0 : i / (count - 1);
                if (t < tail || t > head) {
                    orb.visible = false;
                    continue;
                }
                const local = (t - tail) / span; // 0..1
                const orbAlpha = Math.sin(Math.PI * local) * alpha;
                if (orbAlpha <= 0.02) {
                    orb.visible = false;
                    continue;
                }

                orb.position.set(dx * t, dy * t);
                orb.alpha = clamp(0.18 + 0.82 * orbAlpha, 0, 1);
                orb.tint = vfxColor;
                const scale = base * (0.85 + 0.25 * Math.sin(Math.PI * local));
                orb.scale.set(scale);
            }
        }
    });
    vfxKeysToRelease.forEach((id) => runtime.attackVfxByKey.delete(id));
};

