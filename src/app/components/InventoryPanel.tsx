import { memo } from "react";
import { InventoryIcon, type InventoryIconId } from "../ui/inventoryIcons";

export type InventorySort = "Name" | "Count";

export type InventoryEntry = {
    id: string;
    name: string;
    count: number;
    description: string;
    iconId: InventoryIconId;
    usedBy: string[];
    obtainedBy: string[];
};

type InventoryPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    entries: InventoryEntry[];
    gridEntries: InventoryEntry[];
    selectedItem: InventoryEntry | null;
    selectedItemId: string | null;
    onSelectItem: (itemId: string) => void;
    onClearSelection: () => void;
    sort: InventorySort;
    onSortChange: (sort: InventorySort) => void;
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    emptyState: string;
    selectionHint: string | null;
};

export const InventoryPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    entries,
    gridEntries,
    selectedItem,
    selectedItemId,
    onSelectItem,
    onClearSelection,
    sort,
    onSortChange,
    search,
    onSearchChange,
    page,
    pageCount,
    onPageChange,
    totalItems,
    emptyState,
    selectionHint
}: InventoryPanelProps) => {
    return (
        <section className="generic-panel ts-panel ts-inventory-panel">
            <div className="ts-panel-header">
                <h2 className="ts-panel-title">Inventory</h2>
                <span className="ts-panel-meta">Shared stash</span>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onToggleCollapsed}
                >
                    {isCollapsed ? "Expand" : "Collapse"}
                </button>
            </div>
            {!isCollapsed ? (
                <div className="ts-inventory-layout">
                    <div className="ts-inventory-column">
                        <div className="ts-inventory-controls">
                            <div className="ts-inventory-control">
                                <label className="ts-field-label" htmlFor="inventory-sort">
                                    Sort by
                                </label>
                                <select
                                    id="inventory-sort"
                                    className="generic-field select ts-focusable"
                                    value={sort}
                                    onChange={(event) => onSortChange(event.target.value as InventorySort)}
                                >
                                    <option value="Name">Name</option>
                                    <option value="Count">Count</option>
                                </select>
                            </div>
                            <div className="ts-inventory-control">
                                <label className="ts-field-label" htmlFor="inventory-search">
                                    Search items
                                </label>
                                <input
                                    id="inventory-search"
                                    className="generic-field input ts-input ts-focusable"
                                    value={search}
                                    onChange={(event) => onSearchChange(event.target.value)}
                                    placeholder="Filter by name"
                                />
                            </div>
                            <div className="ts-inventory-meta">
                                <span>{totalItems} item types</span>
                                <span>Page {page}/{pageCount}</span>
                            </div>
                        </div>
                        <div className="ts-inventory-grid">
                            {entries.length > 0 ? (
                                gridEntries.length > 0 ? (
                                    gridEntries.map((item) => {
                                        const isSelected = item.id === selectedItemId;
                                        const slotClassName = isSelected
                                            ? "ts-inventory-slot is-selected ts-focusable"
                                            : "ts-inventory-slot ts-focusable";
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={slotClassName}
                                                aria-pressed={isSelected}
                                                aria-label={`${item.name} x${item.count}`}
                                                title={`${item.name} x${item.count}`}
                                                onClick={() => onSelectItem(item.id)}
                                            >
                                                <InventoryIcon iconId={item.iconId} />
                                                <span className="ts-inventory-count">{item.count}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="ts-inventory-empty">{emptyState}</div>
                                )
                            ) : (
                                <div className="ts-inventory-empty">{emptyState}</div>
                            )}
                        </div>
                        <div className="ts-inventory-pagination">
                            <button
                                type="button"
                                className="generic-field button ts-focusable"
                                onClick={() => onPageChange(Math.max(1, page - 1))}
                                disabled={page <= 1}
                            >
                                Previous
                            </button>
                            <div className="ts-inventory-pagination-label">Page {page} of {pageCount}</div>
                            <button
                                type="button"
                                className="generic-field button ts-focusable"
                                onClick={() => onPageChange(Math.min(pageCount, page + 1))}
                                disabled={page >= pageCount}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    <div className="ts-inventory-focus">
                        <div className="ts-inventory-focus-header">
                            <h3 className="ts-inventory-focus-title">
                                {selectedItem ? selectedItem.name : "No item selected"}
                            </h3>
                            {selectedItem ? (
                                <button
                                    type="button"
                                    className="generic-field button ts-inventory-clear ts-focusable"
                                    onClick={onClearSelection}
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>
                        <div className="ts-inventory-focus-count">
                            Count: {selectedItem ? selectedItem.count : "--"}
                        </div>
                        {selectionHint ? (
                            <div className="ts-inventory-selection-hint">{selectionHint}</div>
                        ) : null}
                        <div className="ts-inventory-focus-row">
                            <span className="ts-inventory-focus-label">Used by</span>
                            <span className="ts-inventory-focus-value">
                                {selectedItem
                                    ? (selectedItem.usedBy.length > 0 ? selectedItem.usedBy.join(", ") : "None")
                                    : "--"}
                            </span>
                        </div>
                        <div className="ts-inventory-focus-row">
                            <span className="ts-inventory-focus-label">Obtained by</span>
                            <span className="ts-inventory-focus-value">
                                {selectedItem
                                    ? (selectedItem.obtainedBy.length > 0 ? selectedItem.obtainedBy.join(", ") : "None")
                                    : "--"}
                            </span>
                        </div>
                        <p className="ts-inventory-focus-copy">
                            {selectedItem
                                ? selectedItem.description
                                : "Select an item to view details."}
                        </p>
                    </div>
                </div>
            ) : null}
        </section>
    );
});

InventoryPanel.displayName = "InventoryPanel";
