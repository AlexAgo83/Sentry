import type { ItemDelta } from "../../../core/types";

export const unlockTier = (level: number) => level;

export const withRewards = (deltas: ItemDelta): ItemDelta => deltas;
