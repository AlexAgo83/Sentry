import type { DungeonArenaFrame } from "../arenaPlayback";
import {
    ATTACK_LUNGE_DISTANCE,
    ATTACK_LUNGE_MS,
    BEAM_VFX_GLOW_WIDTH,
    BEAM_VFX_WIDTH,
    DAMAGE_SHAKE_MS,
    DAMAGE_TINT_COLOR,
    DAMAGE_TINT_MS,
    ENEMY_SPAWN_FADE_MS,
    MAGIC_BEAM_VFX_COLOR,
    MAGIC_BEAM_VFX_MS,
    MAGIC_PULSE_COLOR,
    MAGIC_PULSE_MS,
    MAGIC_PULSE_OFFSET_Y,
    MAX_FLOAT_POOL,
    MAX_ATTACK_VFX_POOL,
    MELEE_ARC_VFX_COLOR,
    MELEE_ARC_VFX_MS,
    MELEE_ARC_VFX_OFFSET,
    MELEE_ARC_VFX_RADIUS,
    MELEE_ARC_VFX_SPREAD_RAD,
    PROJECTILE_VFX_OUTLINE,
    PROJECTILE_VFX_RADIUS,
    RANGED_PROJECTILE_VFX_COLOR,
    RANGED_PROJECTILE_VFX_MS,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./constants";
import {
    createUnitNode,
    drawArena,
    drawCombatTypeIcon,
    drawEnemyBody,
    drawHeroBody,
    drawHp,
    drawTargetAndDeath,
    getAutoFitScale
} from "./drawing";
import { clamp, hashString, mixColors, toWorldX, toWorldY } from "./math";
import type { PixiRuntime } from "./types";

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

const getAttackVfxSpecsForUnitMap = (frame: DungeonArenaFrame, unitById: Map<string, DungeonArenaFrame["units"][number]>) => {
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

export const updateFrame = (runtime: PixiRuntime, frame: DungeonArenaFrame) => {
    const viewportWidth = runtime.app.screen?.width ?? runtime.app.renderer.width;
    const viewportHeight = runtime.app.screen?.height ?? runtime.app.renderer.height;
    if (runtime.phaseLabel.parent !== runtime.app.stage) {
        runtime.phaseLabel.parent?.removeChild(runtime.phaseLabel);
        runtime.app.stage.addChild(runtime.phaseLabel);
    }
    drawArena(runtime.arena);

    const unitById = new Map(frame.units.map((unit) => [unit.id, unit]));
    const attackBySource = new Map(frame.attackCues.map((cue) => [cue.sourceId, cue]));
    const magicBySource = new Map(frame.magicCues.map((cue) => [cue.sourceId, cue]));
    const attackVfxSpecs = getAttackVfxSpecsForUnitMap(frame, unitById);
    const seen = new Set<string>();
    const lastSeen = runtime.lastSeen;

    if (runtime.attackVfxPool.length === 0) {
        for (let i = 0; i < MAX_ATTACK_VFX_POOL; i += 1) {
            const gfx = new runtime.PIXI.Graphics();
            gfx.visible = false;
            gfx.alpha = 0;
            runtime.vfxLayer.addChild(gfx);
            runtime.attackVfxPool.push(gfx);
        }
    }

    const acquireAttackVfxNode = (key: string) => {
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

    attackVfxSpecs.forEach((spec) => {
        const node = acquireAttackVfxNode(spec.key);
        if (!node) {
            return;
        }
        (node as any).__vfxKind = spec.kind;
        (node as any).__vfxSourceId = spec.sourceId;
        (node as any).__vfxTargetId = spec.targetId;
        (node as any).__vfxAtMs = spec.atMs;
    });

    frame.units.forEach((unit) => {
        const node = runtime.unitNodes.get(unit.id) ?? createUnitNode(runtime.PIXI, runtime.world);
        if (!runtime.unitNodes.has(unit.id)) {
            runtime.unitNodes.set(unit.id, node);
        }
        const wasVisible = lastSeen.has(unit.id);
        seen.add(unit.id);
        node.container.visible = true;
        const baseX = toWorldX(unit.x);
        const baseY = toWorldY(unit.y);
        node.label.text = unit.name;
        node.label.alpha = unit.alive ? 1 : 0.5;

        if (!wasVisible && unit.isEnemy) {
            node.spawnAtMs = frame.atMs;
        }

        const lastHp = Number(node.lastHp);
        if (Number.isFinite(lastHp) && unit.hp < lastHp) {
            node.damageAtMs = frame.atMs;
            node.damageRatio = clamp((lastHp - unit.hp) / Math.max(1, unit.hpMax), 0, 1);
        }
        node.lastHp = unit.hp;

        if (unit.isEnemy) {
            drawEnemyBody(node, unit);
        } else {
            drawHeroBody(node, unit);
        }
        if (!unit.isEnemy) {
            drawCombatTypeIcon(
                node,
                unit.weaponType ?? "Melee",
                unit.alive,
                node.label.x,
                node.label.y,
                node.label.width ?? 0
            );
        } else {
            node.combatIcon.visible = false;
        }
        node.magicPulse.clear();
        node.magicPulse.visible = false;
        const magicCue = !unit.isEnemy ? magicBySource.get(unit.id) : null;
        if (magicCue) {
            const age = frame.atMs - magicCue.atMs;
            if (age >= 0 && age <= MAGIC_PULSE_MS) {
                const progress = clamp(age / MAGIC_PULSE_MS, 0, 1);
                const alpha = (1 - progress) * 0.75;
                const radius = 18 + progress * 14;
                node.magicPulse.visible = true;
                node.magicPulse.lineStyle(2, MAGIC_PULSE_COLOR, 0.7 * alpha);
                node.magicPulse.beginFill(MAGIC_PULSE_COLOR, 0.18 * alpha);
                node.magicPulse.drawCircle(0, MAGIC_PULSE_OFFSET_Y, radius);
                node.magicPulse.endFill();
            }
        }
        drawHp(node, unit.hp, unit.hpMax);
        drawTargetAndDeath(node, frame.targetEnemyId === unit.id, unit.alive);
        const baseAlpha = unit.alive ? 1 : 0.6;
        let spawnAlpha = 1;
        if (unit.isEnemy && Number.isFinite(node.spawnAtMs)) {
            const spawnAge = frame.atMs - Number(node.spawnAtMs);
            if (spawnAge >= ENEMY_SPAWN_FADE_MS) {
                node.spawnAtMs = undefined;
            } else {
                spawnAlpha = clamp(spawnAge / ENEMY_SPAWN_FADE_MS, 0, 1);
            }
        }
        node.container.alpha = baseAlpha * spawnAlpha;

        const damageAt = Number(node.damageAtMs);
        let damagePulse = 0;
        let shakeProgress = 0;
        if (Number.isFinite(damageAt)) {
            const damageAge = frame.atMs - damageAt;
            if (damageAge >= 0 && damageAge <= DAMAGE_TINT_MS) {
                damagePulse = clamp(1 - damageAge / DAMAGE_TINT_MS, 0, 1);
            }
            if (damageAge >= 0 && damageAge <= DAMAGE_SHAKE_MS) {
                shakeProgress = clamp(1 - damageAge / DAMAGE_SHAKE_MS, 0, 1);
            }
            if (damageAge > DAMAGE_TINT_MS && damageAge > DAMAGE_SHAKE_MS) {
                node.damageAtMs = undefined;
                node.damageRatio = undefined;
            }
        }

        const tintStrength = damagePulse * 0.85;
        node.body.tint = tintStrength > 0 ? mixColors(0xffffff, DAMAGE_TINT_COLOR, tintStrength) : 0xffffff;

        if (!Number.isFinite(node.shakeSeed)) {
            node.shakeSeed = hashString(unit.id);
        }
        const shakeSeed = Number(node.shakeSeed);
        const damageRatio = Number(node.damageRatio) || 0;
        const shakeAmplitude = shakeProgress * (3 + damageRatio * 6);
        const shakeTime = (frame.atMs + shakeSeed) * 0.08;
        const offsetX = Math.sin(shakeTime) * shakeAmplitude;
        const offsetY = Math.cos(shakeTime * 1.1) * shakeAmplitude;

        let lungeX = 0;
        let lungeY = 0;
        const attackCue = attackBySource.get(unit.id);
        if (attackCue && shouldApplyLunge(unit.weaponType)) {
            const age = frame.atMs - attackCue.atMs;
            if (age >= 0 && age <= ATTACK_LUNGE_MS) {
                const target = unitById.get(attackCue.targetId);
                if (target) {
                    const targetX = toWorldX(target.x);
                    const targetY = toWorldY(target.y);
                    const dx = targetX - baseX;
                    const dy = targetY - baseY;
                    const length = Math.hypot(dx, dy) || 1;
                    const phase = clamp(age / ATTACK_LUNGE_MS, 0, 1);
                    const ease = Math.sin(Math.PI * phase);
                    const distance = ATTACK_LUNGE_DISTANCE * (unit.isBoss ? 1.15 : 1);
                    lungeX = (dx / length) * distance * ease;
                    lungeY = (dy / length) * distance * ease;
                }
            }
        }

        node.container.position.set(baseX + offsetX + lungeX, baseY + offsetY + lungeY);
    });

    const vfxKeysToRelease: string[] = [];
    runtime.attackVfxByKey.forEach((gfx, key) => {
        const kind = (gfx as any).__vfxKind as AttackVfxKind | undefined;
        const sourceId = String((gfx as any).__vfxSourceId ?? "");
        const targetId = String((gfx as any).__vfxTargetId ?? "");
        const atMs = Number((gfx as any).__vfxAtMs);
        if (!kind || !sourceId || !targetId || !Number.isFinite(atMs)) {
            gfx.visible = false;
            gfx.alpha = 0;
            gfx.clear?.();
            (gfx as any).__vfxKey = undefined;
            vfxKeysToRelease.push(key);
            return;
        }

        const durationMs = getAttackVfxDurationMs(kind);
        const age = frame.atMs - atMs;
        if (age < 0) {
            gfx.visible = false;
            return;
        }
        if (age > durationMs) {
            gfx.visible = false;
            gfx.alpha = 0;
            gfx.clear();
            (gfx as any).__vfxKey = undefined;
            vfxKeysToRelease.push(key);
            return;
        }

        const sourceUnit = unitById.get(sourceId);
        const targetUnit = unitById.get(targetId);
        if (!sourceUnit || !targetUnit) {
            gfx.visible = false;
            gfx.alpha = 0;
            gfx.clear();
            (gfx as any).__vfxKey = undefined;
            vfxKeysToRelease.push(key);
            return;
        }

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

        gfx.visible = alpha > 0.02;
        gfx.alpha = 1;
        gfx.clear();

        if (kind === "melee_arc") {
            const angle = Math.atan2(dy, dx);
            gfx.position.set(sx + nx * MELEE_ARC_VFX_OFFSET, sy + ny * MELEE_ARC_VFX_OFFSET);
            gfx.rotation = angle;
            const radius = MELEE_ARC_VFX_RADIUS * (1 + progress * 0.12);
            const spread = MELEE_ARC_VFX_SPREAD_RAD;
            const start = -spread / 2;
            const end = spread / 2;
            gfx.lineStyle(9, MELEE_ARC_VFX_COLOR, 0.22 * alpha);
            gfx.arc(0, 0, radius, start, end);
            gfx.lineStyle(4.2, MELEE_ARC_VFX_COLOR, 0.55 * alpha);
            gfx.arc(0, 0, radius, start, end);
        } else if (kind === "ranged_projectile") {
            const t = 1 - Math.pow(1 - clamp(progress * 1.08, 0, 1), 3);
            gfx.position.set(sx + dx * t, sy + dy * t);
            const radius = PROJECTILE_VFX_RADIUS * (0.95 + (1 - progress) * 0.15);
            gfx.lineStyle(2, PROJECTILE_VFX_OUTLINE, 0.55 * alpha);
            gfx.beginFill(RANGED_PROJECTILE_VFX_COLOR, 0.85 * alpha);
            gfx.drawCircle(0, 0, radius);
            gfx.endFill();
        } else {
            gfx.position.set(sx, sy);
            gfx.rotation = 0;
            gfx.lineStyle(BEAM_VFX_GLOW_WIDTH, MAGIC_BEAM_VFX_COLOR, 0.14 * alpha);
            gfx.moveTo(0, 0);
            gfx.lineTo(dx, dy);
            gfx.lineStyle(BEAM_VFX_WIDTH, MAGIC_BEAM_VFX_COLOR, 0.48 * alpha);
            gfx.moveTo(0, 0);
            gfx.lineTo(dx, dy);
        }
    });
    vfxKeysToRelease.forEach((id) => runtime.attackVfxByKey.delete(id));

    runtime.unitNodes.forEach((node, id) => {
        if (!seen.has(id)) {
            node.container.visible = false;
            node.lastHp = undefined;
            node.damageAtMs = undefined;
            node.damageRatio = undefined;
            node.spawnAtMs = undefined;
            node.magicPulse.clear();
            node.magicPulse.visible = false;
        }
    });
    runtime.lastSeen = seen;

    if (runtime.floatingPool.length === 0) {
        for (let i = 0; i < MAX_FLOAT_POOL; i += 1) {
            const text = new runtime.PIXI.Text("", {
                fill: 0xffffff,
                fontSize: 14,
                fontFamily: "monospace",
                fontWeight: "700"
            });
            text.anchor.set(0.5, 0.5);
            text.zIndex = 30;
            text.visible = false;
            runtime.world.addChild(text);
            runtime.floatingPool.push(text);
        }
    }

    const getFloatingTextNode = (id: string) => {
        const existing = runtime.floatingById.get(id);
        if (existing) {
            return existing;
        }
        const freeNode = runtime.floatingPool.find((candidate) => !(candidate as any).__floatingId);
        if (!freeNode) {
            return null;
        }
        (freeNode as any).__floatingId = id;
        (freeNode as any).__floatingStaleFrames = 0;
        (freeNode as any).__lastX = undefined;
        (freeNode as any).__lastY = undefined;
        runtime.floatingById.set(id, freeNode);
        return freeNode;
    };

    const visibleFloatingIds = new Set<string>();
    frame.floatingTexts.forEach((floating) => {
        const text = getFloatingTextNode(floating.id);
        if (!text) {
            return;
        }
        const target = frame.units.find((unit) => unit.id === floating.targetId);
        const alpha = Math.max(0.03, 1 - Math.pow(floating.progress, 1.35));
        text.text = `${floating.kind === "heal" ? "+" : "-"}${floating.amount}`;
        text.tint = floating.kind === "heal" ? 0x5ed9aa : 0xf07d73;
        if (target) {
            const x = toWorldX(target.x);
            const y = toWorldY(target.y) - 42 - floating.progress * 28;
            text.position.set(x, y);
            (text as any).__lastX = x;
            (text as any).__lastY = y;
        } else {
            const lastX = Number((text as any).__lastX);
            const lastY = Number((text as any).__lastY);
            if (!Number.isFinite(lastX) || !Number.isFinite(lastY)) {
                text.visible = false;
                return;
            }
            text.position.set(lastX, lastY);
            (text as any).__lastY = lastY - 0.4;
        }
        visibleFloatingIds.add(floating.id);
        text.alpha = alpha;
        text.visible = true;
        (text as any).__floatingStaleFrames = 0;
    });

    const idsToRelease: string[] = [];
    runtime.floatingById.forEach((text, id) => {
        if (visibleFloatingIds.has(id)) {
            return;
        }
        const staleFrames = Number((text as any).__floatingStaleFrames ?? 0) + 1;
        (text as any).__floatingStaleFrames = staleFrames;
        text.visible = true;
        text.alpha = Math.max(0, Number(text.alpha ?? 0) - 0.09);
        text.position.y -= 0.7;
        if (text.alpha <= 0.01 || staleFrames > 16) {
            text.visible = false;
            (text as any).__floatingId = undefined;
            (text as any).__floatingStaleFrames = 0;
            idsToRelease.push(id);
        }
    });
    idsToRelease.forEach((id) => runtime.floatingById.delete(id));

    const overlayLabel = frame.bossPhaseLabel ?? frame.floorLabel ?? "";
    runtime.phaseLabel.visible = overlayLabel.length > 0;
    runtime.phaseLabel.text = overlayLabel;
    runtime.phaseLabel.position.set(viewportWidth / 2, viewportHeight / 2);

    runtime.world.scale.set(getAutoFitScale(viewportWidth, viewportHeight, frame.units));
    runtime.world.pivot.set(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    runtime.world.position.set(viewportWidth / 2, viewportHeight / 2);
};
