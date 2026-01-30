import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_PREFIX = "sentry:seen-items";

const getStorageKey = (version: string) => `${STORAGE_PREFIX}:${version}`;

type StoredBadgeState = {
    itemIds: string[];
    menuIds: string[];
};

const readStoredIds = (version: string): StoredBadgeState | null => {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(getStorageKey(version));
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
    } catch {
        return null;
    }
};

const writeStoredIds = (version: string, itemIds: Set<string>, menuIds: Set<string>) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(
            getStorageKey(version),
            JSON.stringify({ itemIds: Array.from(itemIds), menuIds: Array.from(menuIds) })
        );
    } catch {
        // Ignore storage errors.
    }
};

export const useInventoryNewBadges = (inventoryItems: Record<string, number>, version: string) => {
    const storedState = readStoredIds(version);
    const [seenItemIds, setSeenItemIds] = useState<Set<string>>(() => new Set(storedState?.itemIds ?? []));
    const [seenMenuIds, setSeenMenuIds] = useState<Set<string>>(() => new Set(storedState?.menuIds ?? []));
    const hasStorageRef = useRef(storedState !== null);

    useEffect(() => {
        const nextStored = readStoredIds(version);
        if (nextStored) {
            setSeenItemIds(new Set(nextStored.itemIds));
            setSeenMenuIds(new Set(nextStored.menuIds));
            hasStorageRef.current = true;
            return;
        }
        setSeenItemIds(new Set());
        setSeenMenuIds(new Set());
        hasStorageRef.current = false;
    }, [version]);

    useEffect(() => {
        if (hasStorageRef.current) {
            return;
        }
        const baselineIds = Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0);
        if (baselineIds.length === 0) {
            return;
        }
        const nextSet = new Set(baselineIds);
        setSeenItemIds(nextSet);
        setSeenMenuIds(nextSet);
        writeStoredIds(version, nextSet, nextSet);
        hasStorageRef.current = true;
    }, [inventoryItems, version]);

    const newItemIds = useMemo(() => (
        Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0 && !seenItemIds.has(itemId))
    ), [inventoryItems, seenItemIds]);
    const newMenuIds = useMemo(() => (
        Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0 && !seenMenuIds.has(itemId))
    ), [inventoryItems, seenMenuIds]);

    const markItemSeen = useCallback((itemId: string) => {
        if (!itemId || seenItemIds.has(itemId)) {
            return;
        }
        const nextSet = new Set(seenItemIds);
        nextSet.add(itemId);
        setSeenItemIds(nextSet);
        writeStoredIds(version, nextSet, seenMenuIds);
        hasStorageRef.current = true;
    }, [seenItemIds, seenMenuIds, version]);

    const markMenuSeen = useCallback(() => {
        const allIds = Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0);
        if (allIds.length === 0) {
            return;
        }
        const nextSet = new Set(seenMenuIds);
        let didChange = false;
        allIds.forEach((itemId) => {
            if (!nextSet.has(itemId)) {
                nextSet.add(itemId);
                didChange = true;
            }
        });
        if (!didChange) {
            return;
        }
        setSeenMenuIds(nextSet);
        writeStoredIds(version, seenItemIds, nextSet);
        hasStorageRef.current = true;
    }, [inventoryItems, seenItemIds, seenMenuIds, version]);

    return {
        newItemIds,
        hasNewItems: newMenuIds.length > 0,
        markItemSeen,
        markMenuSeen
    };
};
