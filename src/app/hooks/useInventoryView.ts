import { useMemo } from "react";
import type { InventoryEntry, InventorySort } from "../components/InventoryPanel";
import type { InventoryIconId } from "../ui/inventoryIcons";

type InventoryMeta = {
    description: string;
    iconId: InventoryIconId;
};

type InventoryUsage = {
    usedBy: string[];
    obtainedBy: string[];
};

type InventoryViewOptions = {
    items: Record<string, number>;
    definitions: Array<{ id: string; name: string }>;
    getInventoryMeta: (itemId: string) => InventoryMeta;
    usageMap: Record<string, InventoryUsage>;
    sort: InventorySort;
    search: string;
    page: number;
    selectedItemId: string | null;
    pageSize?: number;
};

type InventoryViewState = {
    entries: InventoryEntry[];
    visibleEntries: InventoryEntry[];
    filteredEntries: InventoryEntry[];
    sortedEntries: InventoryEntry[];
    pageCount: number;
    safePage: number;
    pageEntries: InventoryEntry[];
    selectedItem: InventoryEntry | null;
    selectedItemIndex: number;
    selectedItemPage: number | null;
    normalizedSearch: string;
};

export const useInventoryView = ({
    items,
    definitions,
    getInventoryMeta,
    usageMap,
    sort,
    search,
    page,
    selectedItemId,
    pageSize = 36
}: InventoryViewOptions): InventoryViewState => {
    const entries = useMemo<InventoryEntry[]>(() => definitions.map((item) => ({
        ...item,
        count: items[item.id] ?? 0,
        ...getInventoryMeta(item.id),
        ...usageMap[item.id]
    })), [definitions, getInventoryMeta, items, usageMap]);

    const visibleEntries = useMemo(
        () => entries.filter((item) => item.count > 0),
        [entries]
    );
    const normalizedSearch = useMemo(
        () => search.trim().toLowerCase(),
        [search]
    );
    const filteredEntries = useMemo(
        () => visibleEntries.filter((item) => (
            normalizedSearch.length === 0
            || item.name.toLowerCase().includes(normalizedSearch)
        )),
        [normalizedSearch, visibleEntries]
    );
    const sortedEntries = useMemo(() => {
        const sorted = [...filteredEntries];
        if (sort === "Count") {
            sorted.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.name.localeCompare(b.name);
            });
            return sorted;
        }
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        return sorted;
    }, [filteredEntries, sort]);
    const pageCount = useMemo(
        () => Math.max(1, Math.ceil(sortedEntries.length / pageSize)),
        [pageSize, sortedEntries.length]
    );
    const safePage = Math.min(page, pageCount);
    const pageEntries = useMemo(
        () => sortedEntries.slice(
            (safePage - 1) * pageSize,
            safePage * pageSize
        ),
        [pageSize, safePage, sortedEntries]
    );
    const selectedItem = useMemo(
        () => (
            selectedItemId
                ? entries.find((item) => item.id === selectedItemId) ?? null
                : null
        ),
        [entries, selectedItemId]
    );
    const selectedItemIndex = useMemo(
        () => (
            selectedItemId
                ? sortedEntries.findIndex((item) => item.id === selectedItemId)
                : -1
        ),
        [selectedItemId, sortedEntries]
    );
    const selectedItemPage = useMemo(
        () => (selectedItemIndex >= 0 ? Math.floor(selectedItemIndex / pageSize) + 1 : null),
        [pageSize, selectedItemIndex]
    );

    return {
        entries,
        visibleEntries,
        filteredEntries,
        sortedEntries,
        pageCount,
        safePage,
        pageEntries,
        selectedItem,
        selectedItemIndex,
        selectedItemPage,
        normalizedSearch
    };
};
