import { memo } from "react";
import { InventoryControls } from "./InventoryControls";
import { getEquipmentDefinition } from "../../data/equipment";
import { InventoryIcon, type InventoryIconId } from "../ui/inventoryIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";

export type InventorySort = "Name" | "Count";

export type InventoryEntry = {
    id: string;
    name: string;
    count: number;
    description: string;
    iconId: InventoryIconId;
    usedBy: string[];
    obtainedBy: string[];
    isNew?: boolean;
};

type InventoryPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    entries: InventoryEntry[];
    gridEntries: InventoryEntry[];
    selectedItem: InventoryEntry | null;
    selectedItemId: string | null;
    selectedItemCharges: number | null;
    onSelectItem: (itemId: string) => void;
    onClearSelection: () => void;
    sellQuantity: number;
    onSellQuantityChange: (value: number) => void;
    onSellSelected: () => void;
    canSellSelected: boolean;
    sellGoldGain: number;
    unitValue: number;
    sellDisabledReason: string | null;
    onSellAll: () => void;
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

type InventorySlotProps = {
    item: InventoryEntry;
    isSelected: boolean;
    onSelect: () => void;
};

const InventorySlot = memo(({ item, isSelected, onSelect }: InventorySlotProps) => {
    const slotClassName = isSelected ? "ts-inventory-slot is-selected ts-focusable" : "ts-inventory-slot ts-focusable";
    const formattedCount = formatNumberCompact(item.count);
    const formattedCountFull = formatNumberFull(item.count);
    return (
        <button
            type="button"
            className={slotClassName}
            aria-pressed={isSelected}
            aria-label={`${item.name} x${formattedCountFull}`}
            title={`${item.name} x${formattedCountFull}`}
            onClick={onSelect}
            data-testid={`inventory-slot-${item.id}`}
        >
            <InventoryIcon iconId={item.iconId} />
            {item.isNew ? (
                <span className="ts-inventory-badge" aria-hidden="true">New</span>
            ) : null}
            <span className="ts-inventory-count" title={formattedCountFull}>
                {formattedCount}
            </span>
        </button>
    );
});

export const InventoryPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    gridEntries,
    selectedItem,
    selectedItemId,
    selectedItemCharges,
    onSelectItem,
    onClearSelection,
    sellQuantity,
    onSellQuantityChange,
    onSellSelected,
    canSellSelected,
    sellGoldGain,
    unitValue,
    sellDisabledReason,
    onSellAll,
    sort,
    onSortChange,
    search,
    onSearchChange,
    page,
    pageCount,
    onPageChange,
    emptyState,
    selectionHint
}: InventoryPanelProps) => {
    const equipmentDef = selectedItem ? getEquipmentDefinition(selectedItem.id) : undefined;
    const equipmentSlotLabel = equipmentDef
        ? equipmentDef.weaponType
            ? `${equipmentDef.slot} (${equipmentDef.weaponType})`
            : equipmentDef.slot
        : "None";

    const maxSellQuantity = Math.max(1, selectedItem?.count ?? 1);
    const clampedSellQuantity = Math.min(Math.max(1, sellQuantity), maxSellQuantity);
    const formattedSellGoldGain = formatNumberCompact(sellGoldGain);
    const formattedSellGoldGainFull = formatNumberFull(sellGoldGain);
    const formattedSelectedCount = selectedItem ? formatNumberCompact(selectedItem.count) : "--";
    const formattedSelectedCountFull = selectedItem ? formatNumberFull(selectedItem.count) : "--";
    const formattedUnitValue = selectedItem ? formatNumberCompact(unitValue) : "--";
    const formattedUnitValueFull = selectedItem ? formatNumberFull(unitValue) : "--";
    const formattedMaxSellQuantity = formatNumberCompact(maxSellQuantity);
    const formattedMaxSellQuantityFull = formatNumberFull(maxSellQuantity);
    const formattedClampedSellQuantity = formatNumberCompact(clampedSellQuantity);
    const canSellAll = Boolean(canSellSelected && selectedItem && selectedItem.count > 1);

    const sellButton = sellDisabledReason ? (
        <span className="ts-inventory-action-tooltip" title={sellDisabledReason}>
            <button
                type="button"
                className="ts-icon-button ts-panel-action-button ts-focusable ts-inventory-header-button ts-inventory-sell"
                onClick={onSellSelected}
                disabled={!canSellSelected}
                data-testid="inventory-sell"
            >
                Sell
            </button>
        </span>
    ) : (
        <button
            type="button"
            className="ts-icon-button ts-panel-action-button ts-focusable ts-inventory-header-button ts-inventory-sell"
            onClick={onSellSelected}
            disabled={!canSellSelected}
            data-testid="inventory-sell"
        >
            Sell
            {canSellSelected ? (
                <span className="ts-inventory-sell-button-gain" aria-hidden="true">
                    +{formattedSellGoldGain}g
                </span>
            ) : null}
        </button>
    );

    return (
        <section className="generic-panel ts-panel ts-inventory-panel">
            <div className="ts-panel-header">
                <h2 className="ts-panel-title">Inventory</h2>
                <div className="ts-panel-actions ts-panel-actions-inline ts-inventory-header-actions">
                    {selectedItem ? (
                        <>
                            {sellButton}
                            {canSellAll ? (
                                <button
                                    type="button"
                                    className="ts-icon-button ts-panel-action-button ts-focusable ts-inventory-header-button ts-inventory-sell"
                                    onClick={onSellAll}
                                    data-testid="inventory-sell-all"
                                >
                                    Sell all
                                </button>
                            ) : null}
                            <button
                                type="button"
                                className="ts-icon-button ts-panel-action-button ts-focusable ts-inventory-header-button ts-inventory-clear"
                                onClick={onClearSelection}
                                data-testid="inventory-clear-selection"
                            >
                                Clear
                            </button>
                        </>
                    ) : null}
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable"
                        onClick={onToggleCollapsed}
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <span className="ts-collapse-label">
                            <CollapseIcon isCollapsed={isCollapsed} />
                        </span>
                    </button>
                </div>
            </div>
            {!isCollapsed ? (
                <div className="ts-inventory-layout">
                    <div className="ts-inventory-column">
                        <InventoryControls
                            sort={sort}
                            onSortChange={onSortChange}
                            search={search}
                            onSearchChange={onSearchChange}
                        />
                        <div className="ts-inventory-grid">
                            {gridEntries.length > 0 ? (
                                gridEntries.map((item) => {
                                    const isSelected = item.id === selectedItemId;
                                    return (
                                        <InventorySlot
                                            key={item.id}
                                            item={item}
                                            isSelected={isSelected}
                                            onSelect={() => onSelectItem(item.id)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="ts-inventory-empty">{emptyState}</div>
                            )}
                        </div>
                        {pageCount > 1 ? (
                            <div className="ts-inventory-pagination">
                            <button
                                type="button"
                                className="ts-pagination-button"
                                onClick={() => onPageChange(Math.max(1, page - 1))}
                                disabled={page <= 1}
                                aria-label="Prev"
                            >
                                ← Prev
                            </button>
                            <div className="ts-inventory-pagination-label">Page {page} of {pageCount}</div>
                            <button
                                type="button"
                                className="ts-pagination-button"
                                onClick={() => onPageChange(Math.min(pageCount, page + 1))}
                                disabled={page >= pageCount}
                                aria-label="Next"
                            >
                                Next →
                            </button>
                            </div>
                        ) : null}
                    </div>
                    <div className="ts-inventory-focus">
                        <div className="ts-inventory-focus-header">
                            <h3 className="ts-inventory-focus-title">
                                {selectedItem ? selectedItem.name : "No item selected"}
                            </h3>
                        </div>
                        <div className="ts-inventory-focus-count">
                            <span title={selectedItem ? formattedSelectedCountFull : undefined}>
                                Count: {formattedSelectedCount}
                            </span>
                        </div>
                        <div className="ts-inventory-focus-row">
                            <span className="ts-inventory-focus-label">Unit value</span>
                            <span
                                className="ts-inventory-focus-value"
                                title={selectedItem ? `${formattedUnitValueFull}g` : undefined}
                            >
                                {selectedItem ? `${formattedUnitValue}g` : "--"}
                            </span>
                        </div>
                        {selectionHint ? (
                            <div className="ts-inventory-selection-hint">{selectionHint}</div>
                        ) : null}
                        <div className="ts-inventory-focus-row">
                            <span className="ts-inventory-focus-label">Equip slot</span>
                            <span className="ts-inventory-focus-value">
                                {selectedItem ? equipmentSlotLabel : "--"}
                            </span>
                        </div>
                        {selectedItem && selectedItemCharges !== null ? (
                            <div className="ts-inventory-focus-row">
                                <span className="ts-inventory-focus-label">Charges</span>
                                <span className="ts-inventory-focus-value">{selectedItemCharges}/100</span>
                            </div>
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
                        {selectedItem ? (
                            <div className="ts-inventory-sell-controls">
                                <div className="ts-inventory-sell-row">
                                    <span className="ts-inventory-sell-label">Qty</span>
                                    <input
                                        className="ts-inventory-sell-slider"
                                        type="range"
                                        min={1}
                                        max={maxSellQuantity}
                                        step={1}
                                        value={clampedSellQuantity}
                                        onChange={(event) => onSellQuantityChange(Number(event.currentTarget.value))}
                                        disabled={!canSellSelected}
                                        aria-label="Sell quantity"
                                        data-testid="inventory-sell-quantity"
                                    />
                                    <span
                                        className="ts-inventory-sell-value"
                                        title={`x${formattedClampedSellQuantity} / ${formattedMaxSellQuantityFull}`}
                                    >
                                        x{formattedClampedSellQuantity} / {formattedMaxSellQuantity}
                                    </span>
                                    {canSellSelected ? (
                                        <span className="ts-inventory-sell-gain" aria-label={`Gain ${formattedSellGoldGainFull} gold`}>
                                            +{formattedSellGoldGain}g
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </section>
    );
});

InventoryPanel.displayName = "InventoryPanel";
InventorySlot.displayName = "InventorySlot";
