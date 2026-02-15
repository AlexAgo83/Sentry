import type { CombatSkillId, ItemDelta } from "../types";

export type OfflineCatchUpResult = {
    diff: number;
    processedMs: number;
    capped: boolean;
    ticks: number;
    totalItemDeltas: ItemDelta;
    playerItemDeltas: Record<string, ItemDelta>;
    dungeonItemDeltas: ItemDelta;
    dungeonItemDeltasByPlayer: Record<string, ItemDelta>;
    dungeonCombatXpByPlayer: Record<string, Partial<Record<CombatSkillId, number>>>;
};

export const runOfflineCatchUp = (options: {
    from: number;
    to: number;
    capMs: number;
    offlineInterval: number;
    maxStepMs: number;
    dispatchTick: (deltaMs: number, timestamp: number) => void;
    collectTickDeltas: (
        totalItemDeltas: ItemDelta,
        playerItemDeltas: Record<string, ItemDelta>,
        dungeonItemDeltas: ItemDelta,
        dungeonItemDeltasByPlayer: Record<string, ItemDelta>,
        dungeonCombatXpByPlayer: Record<string, Partial<Record<CombatSkillId, number>>>
    ) => void;
}): OfflineCatchUpResult => {
    const diff = Math.max(0, options.to - options.from);
    const processedMs = Math.min(diff, options.capMs);
    const end = options.from + processedMs;
    const stepMs = Math.min(options.offlineInterval, options.maxStepMs);
    let tickTime = options.from;
    let ticks = 0;
    const totalItemDeltas: ItemDelta = {};
    const playerItemDeltas: Record<string, ItemDelta> = {};
    const dungeonItemDeltas: ItemDelta = {};
    const dungeonItemDeltasByPlayer: Record<string, ItemDelta> = {};
    const dungeonCombatXpByPlayer: Record<string, Partial<Record<CombatSkillId, number>>> = {};

    while (tickTime < end) {
        const nextTickTime = Math.min(end, tickTime + stepMs);
        const deltaMs = nextTickTime - tickTime;
        tickTime = nextTickTime;
        options.dispatchTick(deltaMs, tickTime);
        ticks += 1;
        options.collectTickDeltas(
            totalItemDeltas,
            playerItemDeltas,
            dungeonItemDeltas,
            dungeonItemDeltasByPlayer,
            dungeonCombatXpByPlayer
        );
    }

    const capped = processedMs < diff;
    if (capped && options.to > end) {
        options.dispatchTick(0, options.to);
    }

    return {
        diff,
        processedMs,
        capped,
        ticks,
        totalItemDeltas,
        playerItemDeltas,
        dungeonItemDeltas,
        dungeonItemDeltasByPlayer,
        dungeonCombatXpByPlayer
    };
};

