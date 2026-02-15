import type { InventoryState, ItemDelta, ItemId } from "./types";

const normalizeCount = (value: unknown): number | null => {
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric)) {
        return null;
    }
    return Math.max(0, Math.floor(numeric));
};

export const normalizeInventoryItems = (value: unknown): Record<ItemId, number> => {
    if (!value || typeof value !== "object") {
        return {};
    }
    return Object.entries(value as Record<string, unknown>).reduce<Record<ItemId, number>>((acc, [itemId, amount]) => {
        const normalized = normalizeCount(amount);
        if (normalized !== null) {
            acc[itemId] = normalized;
        }
        return acc;
    }, {});
};

export const normalizeDiscoveredItemIds = (value: unknown): Record<ItemId, true> => {
    if (!value || typeof value !== "object") {
        return {};
    }
    return Object.entries(value as Record<string, unknown>).reduce<Record<ItemId, true>>((acc, [itemId, discovered]) => {
        if (discovered) {
            acc[itemId] = true;
        }
        return acc;
    }, {});
};

export const mergeDiscoveredItemIds = (
    items: Record<ItemId, number>,
    discovered?: Record<ItemId, true> | null
): Record<ItemId, true> => {
    const next: Record<ItemId, true> = { ...(discovered ?? {}) };
    Object.entries(items).forEach(([itemId, amount]) => {
        if ((amount ?? 0) > 0) {
            next[itemId] = true;
        }
    });
    return next;
};

export const mergeDiscoveredItemIdsFromDelta = (
    discovered: Record<ItemId, true> | undefined,
    deltas: ItemDelta | undefined
): Record<ItemId, true> | undefined => {
    if (!deltas) {
        return discovered;
    }
    let next = discovered;
    Object.entries(deltas).forEach(([itemId, amount]) => {
        if ((amount ?? 0) <= 0) {
            return;
        }
        if (!next) {
            next = {};
        }
        next[itemId] = true;
    });
    return next;
};

export const isItemDiscovered = (inventory: InventoryState, itemId: ItemId): boolean => {
    return Boolean(inventory.discoveredItemIds?.[itemId]) || (inventory.items[itemId] ?? 0) > 0;
};
