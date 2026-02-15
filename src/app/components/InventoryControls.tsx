import { memo } from "react";
import type { InventorySort } from "./InventoryPanel";

type InventoryControlsProps = {
    sort: InventorySort;
    onSortChange: (value: InventorySort) => void;
    search: string;
    onSearchChange: (value: string) => void;
};

export const InventoryControls = memo(({ sort, onSortChange, search, onSearchChange }: InventoryControlsProps) => (
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
                <button
                    type="button"
                    role="tab"
                    aria-selected={sort === "Name"}
                    className={`ts-chip${sort === "Name" ? " is-active" : ""}`}
                    onClick={() => onSortChange("Name")}
                    title="Sort by name"
                >
                    Name
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={sort === "Count"}
                    className={`ts-chip${sort === "Count" ? " is-active" : ""}`}
                    onClick={() => onSortChange("Count")}
                    title="Sort by count"
                >
                    Count
                </button>
            </div>
        </div>
    </div>
));

InventoryControls.displayName = "InventoryControls";
