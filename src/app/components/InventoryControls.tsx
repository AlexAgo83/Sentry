import { memo } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { InventorySort } from "./InventoryPanel";

type InventoryControlsProps = {
    sort: InventorySort;
    onSortChange: (value: InventorySort) => void;
    search: string;
    onSearchChange: (value: string) => void;
};

const SORT_OPTIONS: InventorySort[] = ["Name", "Count"];
const getSortTabId = (sort: InventorySort) => `inventory-sort-tab-${sort.toLowerCase()}`;

export const InventoryControls = memo(({ sort, onSortChange, search, onSearchChange }: InventoryControlsProps) => {
    const handleSortKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, currentSort: InventorySort) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            return;
        }
        event.preventDefault();
        const index = SORT_OPTIONS.indexOf(currentSort);
        const nextIndex = event.key === "Home"
            ? 0
            : event.key === "End"
            ? SORT_OPTIONS.length - 1
            : event.key === "ArrowRight"
            ? (index + 1) % SORT_OPTIONS.length
            : (index - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length;
        onSortChange(SORT_OPTIONS[nextIndex]);
    };

    return (
        <div className="ts-inventory-controls">
            <div className="ts-filter-row">
                <label className="ts-filter-label" htmlFor="inventory-search">Search</label>
                <input
                    id="inventory-search"
                    className="generic-field input ts-inventory-search"
                    placeholder="Filter by name"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>
            <div className="ts-filter-row">
                <span className="ts-filter-label">Sort</span>
                <div className="ts-filter-tabs" role="tablist" aria-label="Sort inventory">
                    {SORT_OPTIONS.map((option) => {
                        const isSelected = sort === option;
                        return (
                            <button
                                key={option}
                                id={getSortTabId(option)}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                tabIndex={isSelected ? 0 : -1}
                                className={`ts-chip${isSelected ? " is-active" : ""}`}
                                onClick={() => onSortChange(option)}
                                onKeyDown={(event) => handleSortKeyDown(event, option)}
                                title={`Sort by ${option.toLowerCase()}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

InventoryControls.displayName = "InventoryControls";
