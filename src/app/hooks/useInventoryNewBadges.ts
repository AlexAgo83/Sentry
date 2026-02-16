import { useCallback, useEffect, useMemo, useRef } from "react";
import { gameStore } from "../game";
import { useGameStore } from "./useGameStore";

const STORAGE_PREFIX = "sentry:seen-items";
const getLegacyStorageKey = (version: string) => `${STORAGE_PREFIX}:${version}`;

type StoredBadgeState = {
    itemIds: string[];
    menuIds: string[];
};

const parseStoredState = (raw: string | null): StoredBadgeState | null => {
    if (!raw) {
        return null;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
        const filtered = parsed.filter((entry) => typeof entry === "string");
        return { itemIds: filtered, menuIds: filtered };
    }
    if (!parsed || typeof parsed !== "object") {
        return null;
    }
    const itemIds = Array.isArray(parsed.itemIds)
        ? parsed.itemIds.filter((entry: unknown) => typeof entry === "string")
        : [];
    const menuIds = Array.isArray(parsed.menuIds)
        ? parsed.menuIds.filter((entry: unknown) => typeof entry === "string")
        : itemIds;
    return { itemIds, menuIds };
};

// Legacy-only, best-effort import (once). The save payload is the source of truth.
const readLegacyStoredIds = (version: string): StoredBadgeState | null => {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const versionLegacyState = parseStoredState(window.localStorage.getItem(getLegacyStorageKey(version)));
        if (versionLegacyState) {
            return versionLegacyState;
        }

        for (let index = 0; index < window.localStorage.length; index += 1) {
            const key = window.localStorage.key(index);
            if (!key || !key.startsWith(`${STORAGE_PREFIX}:`)) {
                continue;
            }
            const legacyState = parseStoredState(window.localStorage.getItem(key));
            if (legacyState) {
                return legacyState;
            }
        }
        return null;
    } catch {
        return null;
    }
};

const toSeenRecord = (ids: string[]) => (
    ids.reduce<Record<string, true>>((acc, itemId) => {
        const trimmed = itemId.trim();
        if (trimmed) {
            acc[trimmed] = true;
        }
        return acc;
    }, {})
);

export const useInventoryNewBadges = (inventoryItems: Record<string, number>, version: string) => {
    const appReady = useGameStore((state) => state.appReady);
    const seenItemIds = useGameStore((state) => state.ui.inventoryBadges.seenItemIds);
    const seenMenuIds = useGameStore((state) => state.ui.inventoryBadges.seenMenuIds);
    const legacyImported = useGameStore((state) => Boolean(state.ui.inventoryBadges.legacyImported));
    const hasRequestedImportRef = useRef(false);

    useEffect(() => {
        if (!appReady || legacyImported || hasRequestedImportRef.current) {
            return;
        }
        hasRequestedImportRef.current = true;

        const legacy = readLegacyStoredIds(version);
        if (!legacy) {
            gameStore.dispatch({ type: "uiInventoryBadgesLegacyImportChecked" });
            return;
        }
        const nextItemIds = toSeenRecord(legacy.itemIds);
        const nextMenuIds = toSeenRecord(legacy.menuIds);

        gameStore.dispatch({
            type: "uiInventoryBadgesSet",
            seenItemIds: nextItemIds,
            seenMenuIds: Object.keys(nextMenuIds).length > 0 ? nextMenuIds : nextItemIds,
            legacyImported: true
        });
    }, [appReady, legacyImported, version]);

    const newItemIds = useMemo(() => (
        Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0 && !seenItemIds[itemId])
    ), [inventoryItems, seenItemIds]);
    const newMenuIds = useMemo(() => (
        Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0 && !seenMenuIds[itemId])
    ), [inventoryItems, seenMenuIds]);

    const markItemSeen = useCallback((itemId: string) => {
        if (!itemId) {
            return;
        }
        gameStore.dispatch({ type: "uiInventoryBadgesMarkItemSeen", itemId });
    }, []);

    const markMenuSeen = useCallback(() => {
        gameStore.dispatch({ type: "uiInventoryBadgesMarkMenuSeen" });
    }, []);

    return {
        newItemIds,
        hasNewItems: newMenuIds.length > 0,
        markItemSeen,
        markMenuSeen
    };
};
