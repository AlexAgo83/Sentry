import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_PREFIX = "sentry:seen-items";
const GLOBAL_STORAGE_KEY = `${STORAGE_PREFIX}:global`;

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

type ReadStoredIdsResult = {
    state: StoredBadgeState | null;
    source: "global" | "legacy" | null;
};

const readStoredIds = (version: string): ReadStoredIdsResult => {
    if (typeof window === "undefined") {
        return { state: null, source: null };
    }
    try {
        const globalState = parseStoredState(window.localStorage.getItem(GLOBAL_STORAGE_KEY));
        if (globalState) {
            return { state: globalState, source: "global" };
        }

        const versionLegacyState = parseStoredState(window.localStorage.getItem(getLegacyStorageKey(version)));
        if (versionLegacyState) {
            return { state: versionLegacyState, source: "legacy" };
        }

        for (let index = 0; index < window.localStorage.length; index += 1) {
            const key = window.localStorage.key(index);
            if (!key || key === GLOBAL_STORAGE_KEY || !key.startsWith(`${STORAGE_PREFIX}:`)) {
                continue;
            }
            const legacyState = parseStoredState(window.localStorage.getItem(key));
            if (legacyState) {
                return { state: legacyState, source: "legacy" };
            }
        }
        return { state: null, source: null };
    } catch {
        return { state: null, source: null };
    }
};

const writeStoredIds = (itemIds: Set<string>, menuIds: Set<string>) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(
            GLOBAL_STORAGE_KEY,
            JSON.stringify({ itemIds: Array.from(itemIds), menuIds: Array.from(menuIds) })
        );
    } catch {
        // Ignore storage errors.
    }
};

export const useInventoryNewBadges = (inventoryItems: Record<string, number>, version: string) => {
    const storedStateResult = readStoredIds(version);
    const [seenItemIds, setSeenItemIds] = useState<Set<string>>(() => new Set(storedStateResult.state?.itemIds ?? []));
    const [seenMenuIds, setSeenMenuIds] = useState<Set<string>>(() => new Set(storedStateResult.state?.menuIds ?? []));
    const hasStorageRef = useRef(storedStateResult.state !== null);
    const [isBootstrapPassComplete, setBootstrapPassComplete] = useState(false);

    useEffect(() => {
        setBootstrapPassComplete(true);
    }, []);

    useEffect(() => {
        const nextStoredResult = readStoredIds(version);
        if (nextStoredResult.state) {
            const nextItemIds = new Set(nextStoredResult.state.itemIds);
            const nextMenuIds = new Set(nextStoredResult.state.menuIds);
            setSeenItemIds(nextItemIds);
            setSeenMenuIds(nextMenuIds);
            hasStorageRef.current = true;
            if (nextStoredResult.source === "legacy") {
                writeStoredIds(nextItemIds, nextMenuIds);
            }
            return;
        }
        setSeenItemIds(new Set());
        setSeenMenuIds(new Set());
        hasStorageRef.current = false;
    }, [version]);

    useEffect(() => {
        if (!isBootstrapPassComplete || hasStorageRef.current) {
            return;
        }
        const baselineIds = Object.keys(inventoryItems).filter((itemId) => (inventoryItems[itemId] ?? 0) > 0);
        if (baselineIds.length === 0) {
            return;
        }
        const nextSet = new Set(baselineIds);
        setSeenItemIds(nextSet);
        setSeenMenuIds(nextSet);
        writeStoredIds(nextSet, nextSet);
        hasStorageRef.current = true;
    }, [inventoryItems, isBootstrapPassComplete]);

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
        writeStoredIds(nextSet, seenMenuIds);
        hasStorageRef.current = true;
    }, [seenItemIds, seenMenuIds]);

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
        writeStoredIds(seenItemIds, nextSet);
        hasStorageRef.current = true;
    }, [inventoryItems, seenItemIds, seenMenuIds]);

    return {
        newItemIds,
        hasNewItems: newMenuIds.length > 0,
        markItemSeen,
        markMenuSeen
    };
};
