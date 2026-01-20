import { useCallback, useEffect, useState } from "react";
import { ITEM_DEFINITIONS } from "../../data/definitions";
import { useGameStore } from "../hooks/useGameStore";
import { getInventoryMeta } from "../ui/inventoryMeta";
import { ITEM_USAGE_MAP } from "../ui/itemUsage";
import { useInventoryView } from "../hooks/useInventoryView";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { usePersistedInventoryFilters } from "../hooks/usePersistedInventoryFilters";
import { InventoryPanel, type InventorySort } from "../components/InventoryPanel";
import { gameStore } from "../game";
import { getSellGoldGain, getSellValuePerItem } from "../../core/economy";

export const InventoryPanelContainer = () => {
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const [sellQuantity, setSellQuantity] = useState(1);
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

    useEffect(() => {
        setSellQuantity(1);
    }, [selectedInventoryItemId]);

    useEffect(() => {
        if (!inventoryView.selectedItem) {
            return;
        }
        setSellQuantity((current) => Math.min(Math.max(1, current), inventoryView.selectedItem?.count ?? 1));
    }, [inventoryView.selectedItem?.count, inventoryView.selectedItem?.id]);

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

    const selected = inventoryView.selectedItem;
    const canSellSelected = Boolean(
        selected
        && selected.id !== "gold"
        && selected.count > 0
        && getSellValuePerItem(selected.id) > 0
    );

    const sellDisabledReason = selected?.id === "gold"
        ? "Gold can't be sold."
        : null;

    const sellGoldGain = selected
        ? getSellGoldGain(selected.id, Math.min(Math.max(1, Math.floor(sellQuantity)), selected.count))
        : 0;

    const handleSellSelected = useCallback(async () => {
        const currentSelected = inventoryView.selectedItem;
        if (!currentSelected || !canSellSelected) {
            return;
        }
        const available = currentSelected.count;
        const amount = Math.min(Math.max(1, Math.floor(sellQuantity)), available);
        if (amount <= 0) {
            return;
        }

        const valuePerItem = getSellValuePerItem(currentSelected.id);
        const goldGainForSell = getSellGoldGain(currentSelected.id, amount);
        const requiresConfirm = amount > 1 || valuePerItem >= 10;
        if (requiresConfirm) {
            const { default: Swal } = await import("sweetalert2");
            const result = await Swal.fire({
                title: "Sell items?",
                text: `Sell x${amount} ${currentSelected.name} for +${goldGainForSell} gold?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sell",
                cancelButtonText: "Cancel",
            });
            if (!result.isConfirmed) {
                return;
            }
        }

        gameStore.dispatch({ type: "sellItem", itemId: currentSelected.id, count: amount });

        if (amount >= available) {
            setSelectedInventoryItemId(null);
        }
    }, [canSellSelected, inventoryView.selectedItem, sellQuantity]);

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
            sellQuantity={sellQuantity}
            onSellQuantityChange={setSellQuantity}
            onSellSelected={handleSellSelected}
            canSellSelected={canSellSelected}
            sellGoldGain={sellGoldGain}
            sellDisabledReason={sellDisabledReason}
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
