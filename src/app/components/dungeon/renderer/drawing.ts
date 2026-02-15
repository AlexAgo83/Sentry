import type { WeaponType } from "../../../../core/types";
import { getCombatSkillIdForWeaponType } from "../../../../data/equipment";
import { getSkillIconColor } from "../../../ui/skillColors";
import type { DungeonArenaFrame } from "../arenaPlayback";
import {
    ENTITY_OUTLINE_ALPHA,
    ENTITY_OUTLINE_COLOR,
    ENTITY_OUTLINE_OFFSET,
    HERO_BODY_RADIUS,
    MOBILE_VIEWPORT_MAX,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./constants";
import { mixColors, parseHexColor, toWorldX, toWorldY } from "./math";
import type { PixiModule, UnitNode } from "./types";

export const createUnitNode = (PIXI: PixiModule, world: any): UnitNode => {
    const container = new PIXI.Container();
    container.zIndex = 10;
    const silhouette = new PIXI.Graphics();
    const body = new PIXI.Graphics();
    const enemySprite = new (PIXI as any).Sprite((PIXI as any).Texture?.EMPTY ?? (PIXI as any).Texture?.WHITE);
    enemySprite.anchor?.set?.(0.5, 0.5);
    enemySprite.visible = false;
    const enemyOutlineSprites: any[] = [];
    for (let i = 0; i < 8; i += 1) {
        const outline = new (PIXI as any).Sprite((PIXI as any).Texture?.EMPTY ?? (PIXI as any).Texture?.WHITE);
        outline.anchor?.set?.(0.5, 0.5);
        outline.visible = false;
        enemyOutlineSprites.push(outline);
    }
    const attackBack = new PIXI.Graphics();
    const attackFill = new PIXI.Graphics();
    const hpBack = new PIXI.Graphics();
    const hpFill = new PIXI.Graphics();
    const targetRing = new PIXI.Graphics();
    const magicPulse = new PIXI.Graphics();
    const deathMark = new PIXI.Graphics();
    const combatIcon = new PIXI.Graphics();
    const label = new PIXI.Text("", {
        fill: 0xdde6f6,
        fontSize: 11,
        fontFamily: "monospace"
    });
    label.anchor.set(0.5, 0.5);
    label.position.set(0, 34);

    container.addChild(targetRing);
    container.addChild(magicPulse);
    container.addChild(silhouette);
    enemyOutlineSprites.forEach((sprite) => container.addChild(sprite));
    container.addChild(enemySprite);
    container.addChild(body);
    container.addChild(combatIcon);
    container.addChild(attackBack);
    container.addChild(attackFill);
    container.addChild(hpBack);
    container.addChild(hpFill);
    container.addChild(deathMark);
    container.addChild(label);
    world.addChild(container);

    return {
        container,
        silhouette,
        body,
        enemySprite,
        enemyOutlineSprites,
        attackBack,
        attackFill,
        hpBack,
        hpFill,
        targetRing,
        magicPulse,
        deathMark,
        label,
        combatIcon
    };
};

const OUTLINE_DIRECTIONS: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1]
];

const drawOutlinePass = (
    gfx: any,
    alpha: number,
    drawShape: (target: any, offsetX: number, offsetY: number) => void
) => {
    gfx.clear();
    const outlineAlpha = Math.max(0, Math.min(1, alpha * ENTITY_OUTLINE_ALPHA));
    OUTLINE_DIRECTIONS.forEach(([dirX, dirY]) => {
        const offsetX = dirX * ENTITY_OUTLINE_OFFSET;
        const offsetY = dirY * ENTITY_OUTLINE_OFFSET;
        gfx.beginFill(ENTITY_OUTLINE_COLOR, outlineAlpha);
        drawShape(gfx, offsetX, offsetY);
        gfx.endFill();
    });
};

export const drawHeroBody = (node: UnitNode, unit: NonNullable<DungeonArenaFrame>["units"][number]) => {
    const alpha = unit.alive ? 1 : 0.5;
    const skin = parseHexColor(unit.skinColor, 0xe2be95);
    const hair = parseHexColor(unit.hairColor, 0x5a402f);
    drawOutlinePass(node.silhouette, alpha, (target, offsetX, offsetY) => {
        target.drawCircle(offsetX, offsetY, HERO_BODY_RADIUS + 0.6);
        if (unit.helmetVisible) {
            target.drawRoundedRect(-17 + offsetX, -16 + offsetY, 34, 12, 5);
        } else {
            target.drawEllipse(offsetX, -9 + offsetY, 13, 7);
        }
    });

    node.body.clear();
    node.body.beginFill(skin, alpha);
    node.body.drawCircle(0, 0, HERO_BODY_RADIUS);
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

// Enemy bodies are now SVG sprites (see `runtime.entityTextures`).

export const drawHp = (node: UnitNode, hp: number, hpMax: number) => {
    const ratio = hpMax > 0 ? Math.max(0, Math.min(1, hp / hpMax)) : 0;
    const width = 44;
    const height = 6;
    const left = -width / 2;
    // HP bar sits above the attack charge bar.
    const top = -42;

    node.hpBack.clear();
    node.hpBack.beginFill(0x0e1220, 0.85);
    node.hpBack.drawRoundedRect(left, top, width, height, 2);
    node.hpBack.endFill();

    node.hpFill.clear();
    node.hpFill.beginFill(ratio > 0.35 ? 0x4fcb99 : 0xe36d5f, 1);
    node.hpFill.drawRoundedRect(left + 1, top + 1, Math.max(0, (width - 2) * ratio), height - 2, 2);
    node.hpFill.endFill();
};

export const drawAttackCharge = (
    node: UnitNode,
    ratio: number,
    weaponType: WeaponType | undefined,
    isEnemy: boolean,
    isAlive: boolean
) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    const width = 44;
    const height = 4;
    const left = -width / 2;
    // Attack charge bar sits just under the HP bar.
    const top = -34;

    const alpha = isAlive ? 0.95 : 0.35;
    const fillColor = isEnemy
        ? 0xd24a4a
        : parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType(weaponType ?? "Melee")), 0xf2c14e);

    node.attackBack.clear();
    node.attackBack.beginFill(0x0e1220, 0.65 * alpha);
    node.attackBack.drawRoundedRect(left, top, width, height, 2);
    node.attackBack.endFill();

    node.attackFill.clear();
    node.attackFill.beginFill(fillColor, 0.85 * alpha);
    node.attackFill.drawRoundedRect(left + 1, top + 1, Math.max(0, (width - 2) * clamped), height - 2, 2);
    node.attackFill.endFill();
};

export const drawTargetAndDeath = (node: UnitNode, isTarget: boolean, isAlive: boolean) => {
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

export const drawCombatTypeIcon = (
    node: UnitNode,
    weaponType: WeaponType | undefined,
    isAlive: boolean,
    labelX: number,
    labelY: number,
    labelWidth: number
) => {
    node.combatIcon.clear();
    if (!weaponType) {
        node.combatIcon.visible = false;
        return;
    }

    const skillId = getCombatSkillIdForWeaponType(weaponType);
    const color = parseHexColor(getSkillIconColor(skillId), 0xf2c14e);
    const alpha = isAlive ? 0.95 : 0.45;
    node.combatIcon.visible = true;
    const iconOffset = 14;
    const labelLeft = labelX - labelWidth / 2;
    node.combatIcon.position.set(labelLeft - iconOffset, labelY);

    node.combatIcon.lineStyle(1.2, mixColors(0xffffff, color, 0.7), alpha);
    node.combatIcon.beginFill(0x0b1220, 0.85 * alpha);
    node.combatIcon.drawCircle(0, 0, 8);
    node.combatIcon.endFill();

    node.combatIcon.lineStyle(1.4, color, alpha);
    if (weaponType === "Ranged") {
        node.combatIcon.beginFill(color, 0.15 * alpha);
        node.combatIcon.drawPolygon([-4, -3, 4, 0, -4, 3, -2, 0]);
        node.combatIcon.endFill();
        node.combatIcon.moveTo(-4, -3);
        node.combatIcon.lineTo(3, 0);
        node.combatIcon.lineTo(-4, 3);
    } else if (weaponType === "Magic") {
        node.combatIcon.beginFill(color, 0.2 * alpha);
        node.combatIcon.drawPolygon([0, -4, 4, 0, 0, 4, -4, 0]);
        node.combatIcon.endFill();
        node.combatIcon.drawPolygon([0, -4, 4, 0, 0, 4, -4, 0]);
    } else {
        node.combatIcon.moveTo(-3, 4);
        node.combatIcon.lineTo(3, -4);
        node.combatIcon.moveTo(-1, 2);
        node.combatIcon.lineTo(1, 4);
        node.combatIcon.moveTo(-4, -1);
        node.combatIcon.lineTo(-1, 2);
    }
};

export const drawArena = (arena: any) => {
    arena.clear();
};

export const getAutoFitScale = (viewportWidth: number, viewportHeight: number, units: DungeonArenaFrame["units"]) => {
    const viewportHalfWidth = Math.max(96, viewportWidth / 2 - 24);
    const viewportHalfHeight = Math.max(72, viewportHeight / 2 - 20);
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;
    // Keep the camera scale stable across floors. If we compute the fit purely from the currently
    // visible unit positions, the scale "pops" when the boss spawns (boss X is further right than
    // normal mobs). Start from a minimum envelope that already includes the boss formation.
    let requiredHalfWidth = 392;
    let requiredHalfHeight = 200;

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

export const isCompactViewport = (viewportWidth: number, viewportHeight: number) => {
    return Math.min(viewportWidth, viewportHeight) <= MOBILE_VIEWPORT_MAX;
};
