import type { DungeonArenaFrame } from "../arenaPlayback";
import {
    ATTACK_LUNGE_DISTANCE,
    ATTACK_LUNGE_MS,
    DAMAGE_SHAKE_MS,
    DAMAGE_TINT_COLOR,
    DAMAGE_TINT_MS,
    ENEMY_SPAWN_FADE_MS,
    MAGIC_SPIRAL_MS,
    MAGIC_SPIRAL_RADIUS,
    MAGIC_SPIRAL_TURNS,
    MAGIC_BEAM_VFX_MS,
    MAGIC_ORBS_VFX_RADIUS,
    MAGIC_ORBS_VFX_SPACING,
    MAGIC_ORBS_VFX_TRAIL,
    MAGIC_PULSE_COLOR,
    MAGIC_PULSE_MS,
    MAGIC_PULSE_OFFSET_Y,
    MAX_FLOAT_POOL,
    MAX_ATTACK_VFX_POOL,
    MELEE_ARC_VFX_MS,
    MELEE_ARC_VFX_OFFSET,
    PROJECTILE_VFX_RADIUS,
    RANGED_RECOIL_DISTANCE,
    RANGED_RECOIL_MS,
    RANGED_PROJECTILE_VFX_SCALE,
    RANGED_PROJECTILE_VFX_MS,
    VFX_SVG_BASE_MAGIC_ORB_RADIUS,
    VFX_SVG_BASE_PROJECTILE_RADIUS,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./constants";
import {
    createUnitNode,
    drawArena,
    drawAttackCharge,
    drawCombatTypeIcon,
    drawHeroBody,
    drawHp,
    drawTargetAndDeath,
    getAutoFitScale
} from "./drawing";
import { clamp, hashString, mixColors, parseHexColor, toWorldX, toWorldY } from "./math";
import type { PixiRuntime } from "./types";
import { getCombatSkillIdForWeaponType } from "../../../../data/equipment";
import { getSkillIconColor } from "../../../ui/skillColors";

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
    const statusLabel = frame.statusLabel ?? "running";
    // Replay frames carry the overall replay status (victory/failed) even while the
    // timeline cursor is mid-run. Use time to decide whether combat animations
    // (shake/lunge) should run, while still allowing an explicit "paused" state to freeze.
    const combatActive = statusLabel !== "paused" && (statusLabel === "running" || frame.atMs < frame.totalMs);
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

    const meleeVfxColor = parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType("Melee" as any)), 0xf2c14e);
    const rangedVfxColor = parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType("Ranged" as any)), 0x8ac926);
    const magicVfxColor = parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType("Magic" as any)), 0x7cc6ff);

    if (runtime.attackVfxPool.length === 0) {
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
            // Enemies are rendered from standalone SVG assets (mob/boss).
            node.body.clear();
            node.body.visible = false;
            node.silhouette.clear();
            node.silhouette.visible = false;
            if (node.enemySprite) {
                node.enemySprite.visible = true;
                node.enemySprite.texture = unit.isBoss ? runtime.entityTextures.enemyBoss : runtime.entityTextures.enemyMob;
                // Match the approximate footprint of the previous Graphics icons.
                const scale = unit.isBoss ? 0.5 : 0.425;
                node.enemySprite.scale.set(scale);
                node.enemySprite.alpha = unit.alive ? 1 : 0.5;
                node.enemySprite.tint = 0xffffff;
            }
        } else {
            if (node.enemySprite) {
                node.enemySprite.visible = false;
            }
            node.body.visible = true;
            node.silhouette.visible = true;
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
        drawAttackCharge(node, unit.attackCharge ?? 0, unit.weaponType ?? "Melee", unit.isEnemy, unit.alive);
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
        const nextTint = tintStrength > 0 ? mixColors(0xffffff, DAMAGE_TINT_COLOR, tintStrength) : 0xffffff;
        if (unit.isEnemy && node.enemySprite?.visible) {
            node.enemySprite.tint = nextTint;
        } else {
            node.body.tint = nextTint;
        }

        if (!Number.isFinite(node.shakeSeed)) {
            node.shakeSeed = hashString(unit.id);
        }
        const shakeSeed = Number(node.shakeSeed);
        const damageRatio = Number(node.damageRatio) || 0;
        const shakeAmplitude = combatActive ? (shakeProgress * (3 + damageRatio * 6)) : 0;
        const shakeTime = (frame.atMs + shakeSeed) * 0.08;
        const offsetX = Math.sin(shakeTime) * shakeAmplitude;
        const offsetY = Math.cos(shakeTime * 1.1) * shakeAmplitude;

        let attackMotionX = 0;
        let attackMotionY = 0;
        const attackCue = attackBySource.get(unit.id);
        if (combatActive && attackCue) {
            const age = frame.atMs - attackCue.atMs;
            const kind = resolveAttackVfxKind(unit.weaponType);
            const motionMs = kind === "magic_beam"
                ? MAGIC_SPIRAL_MS
                : kind === "ranged_projectile"
                    ? RANGED_RECOIL_MS
                    : ATTACK_LUNGE_MS;
            if (age >= 0 && age <= motionMs) {
                const phase = clamp(age / motionMs, 0, 1);
                const ease = Math.sin(Math.PI * phase);
                const target = unitById.get(attackCue.targetId) ?? null;

                if (kind === "melee_arc") {
                    if (target) {
                        const targetX = toWorldX(target.x);
                        const targetY = toWorldY(target.y);
                        const dx = targetX - baseX;
                        const dy = targetY - baseY;
                        const length = Math.hypot(dx, dy) || 1;
                        const distance = ATTACK_LUNGE_DISTANCE * (unit.isBoss ? 1.15 : 1);
                        attackMotionX = (dx / length) * distance * ease;
                        attackMotionY = (dy / length) * distance * ease;
                    }
                } else if (kind === "ranged_projectile") {
                    // Ranged: slight recoil away from the target.
                    if (target) {
                        const targetX = toWorldX(target.x);
                        const targetY = toWorldY(target.y);
                        const dx = targetX - baseX;
                        const dy = targetY - baseY;
                        const length = Math.hypot(dx, dy) || 1;
                        const distance = RANGED_RECOIL_DISTANCE * (unit.isBoss ? 1.1 : 1);
                        attackMotionX = -(dx / length) * distance * ease;
                        attackMotionY = -(dy / length) * distance * ease;
                    }
                } else {
                    // Magic: swirl in a small spiral, oriented toward the target (when available).
                    const turns = MAGIC_SPIRAL_TURNS;
                    const angle = phase * Math.PI * 2 * turns;
                    // Make it feel like a spiral rather than a vibration:
                    // start at 0, expand to max, then return to 0.
                    const radius = MAGIC_SPIRAL_RADIUS * Math.sin(Math.PI * phase);
                    const c = Math.cos(angle);
                    const s = Math.sin(angle);
                    if (target) {
                        const targetX = toWorldX(target.x);
                        const targetY = toWorldY(target.y);
                        const dx = targetX - baseX;
                        const dy = targetY - baseY;
                        const length = Math.hypot(dx, dy) || 1;
                        const nx = dx / length;
                        const ny = dy / length;
                        const px = -ny;
                        const py = nx;
                        attackMotionX = (nx * c + px * s) * radius;
                        attackMotionY = (ny * c + py * s) * radius;
                    } else {
                        attackMotionX = c * radius;
                        attackMotionY = s * radius;
                    }
                }
            }
        }

        node.container.position.set(baseX + offsetX + attackMotionX, baseY + offsetY + attackMotionY);
    });

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
            : (kind === "melee_arc" ? meleeVfxColor : kind === "ranged_projectile" ? rangedVfxColor : magicVfxColor);

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

    runtime.unitNodes.forEach((node, id) => {
        if (!seen.has(id)) {
            node.container.visible = false;
            node.lastHp = undefined;
            node.damageAtMs = undefined;
            node.damageRatio = undefined;
            node.spawnAtMs = undefined;
            node.magicPulse.clear();
            node.magicPulse.visible = false;
            if (node.enemySprite) {
                node.enemySprite.visible = false;
            }
            node.attackBack.clear();
            node.attackFill.clear();
            node.attackBack.visible = false;
            node.attackFill.visible = false;
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
