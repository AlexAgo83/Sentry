import type { DungeonArenaFrame } from "../../arenaPlayback";
import { MAX_FLOAT_POOL } from "../constants";
import { toWorldX, toWorldY } from "../math";
import type { PixiRuntime } from "../types";

export const ensureFloatingTextPool = (runtime: PixiRuntime) => {
    if (runtime.floatingPool.length > 0) {
        return;
    }
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
};

const getFloatingTextNode = (runtime: PixiRuntime, id: string) => {
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

export const updateFloatingTexts = (runtime: PixiRuntime, frame: DungeonArenaFrame) => {
    const visibleFloatingIds = new Set<string>();
    frame.floatingTexts.forEach((floating) => {
        const text = getFloatingTextNode(runtime, floating.id);
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
};

