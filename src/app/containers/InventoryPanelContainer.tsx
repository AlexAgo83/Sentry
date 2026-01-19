import { useCallback, useEffect, useState } from "react";
import { ITEM_DEFINITIONS } from "../../data/definitions";
import { useGameStore } from "../hooks/useGameStore";
import { getInventoryMeta } from "../ui/inventoryMeta";
import { ITEM_USAGE_MAP } from "../ui/itemUsage";
import { useInventoryView } from "../hooks/useInventoryView";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { usePersistedInventoryFilters } from "../hooks/usePersistedInventoryFilters";
import { InventoryPanel, type InventorySort } from "../components/InventoryPanel";

export const InventoryPanelContainer = () => {
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const [isInventoryCollapsed, setInventoryCollapsed] = usePersistedCollapse("inventory", false);
    const [inventoryFilters, setInventoryFilters] = usePersistedInventoryFilters({
        sort: "Name",
        search: "",
        page: 1
    });

    const handleSetInventorySort = useCallback((value: InventorySort) => {
        setInventoryFilters((prev) => ({
            ...prev,
            sort: value,
            page: 1
        }));
    }, [setInventoryFilters]);
    const handleSetInventorySearch = useCallback((value: string) => {
        setInventoryFilters((prev) => ({
            ...prev,
            search: value,
            page: 1
        }));
    }, [setInventoryFilters]);
    const handleSetInventoryPage = useCallback((page: number) => {
        setInventoryFilters((prev) => ({
            ...prev,
            page
        }));
    }, [setInventoryFilters]);

    const handleToggleInventoryItem = useCallback((itemId: string) => {
        setSelectedInventoryItemId((current) => (current === itemId ? null : itemId));
    }, []);
    const handleClearInventorySelection = useCallback(() => {
        setSelectedInventoryItemId(null);
    }, []);

    const inventoryView = useInventoryView({
        items: inventoryItems,
        definitions: ITEM_DEFINITIONS,
        getInventoryMeta,
        usageMap: ITEM_USAGE_MAP,
        sort: inventoryFilters.sort,
        search: inventoryFilters.search,
        page: inventoryFilters.page,
        selectedItemId: selectedInventoryItemId
    });

    const selectionHint = inventoryView.selectedItem
        ? inventoryView.selectedItemIndex < 0
            ? inventoryView.normalizedSearch.length > 0
                ? "Selected item is hidden by your search."
                : "Selected item is not visible in the current list."
            : inventoryView.selectedItemPage !== inventoryView.safePage
                ? `Selected item is on page ${inventoryView.selectedItemPage}.`
                : null
        : null;
    const inventoryEmptyState = inventoryView.visibleEntries.length === 0
        ? "No items collected yet. Start actions to gather resources."
        : inventoryView.filteredEntries.length === 0
            ? "No items match your search."
            : "No items on this page.";

    useEffect(() => {
        if (inventoryFilters.page !== inventoryView.safePage) {
            handleSetInventoryPage(inventoryView.safePage);
        }
    }, [handleSetInventoryPage, inventoryFilters.page, inventoryView.safePage]);

    return (
        <InventoryPanel
            isCollapsed={isInventoryCollapsed}
            onToggleCollapsed={() => setInventoryCollapsed((value) => !value)}
            entries={inventoryView.visibleEntries}
            gridEntries={inventoryView.pageEntries}
            selectedItem={inventoryView.selectedItem}
            selectedItemId={selectedInventoryItemId}
            onSelectItem={handleToggleInventoryItem}
            onClearSelection={handleClearInventorySelection}
            sort={inventoryFilters.sort}
            onSortChange={handleSetInventorySort}
            search={inventoryFilters.search}
            onSearchChange={handleSetInventorySearch}
            page={inventoryView.safePage}
            pageCount={inventoryView.pageCount}
            onPageChange={handleSetInventoryPage}
            totalItems={inventoryView.visibleEntries.length}
            emptyState={inventoryEmptyState}
            selectionHint={selectionHint}
        />
    );
};

