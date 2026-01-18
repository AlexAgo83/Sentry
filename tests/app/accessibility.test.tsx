import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "jest-axe";
import { InventoryPanel, type InventoryEntry } from "../../src/app/components/InventoryPanel";

const baseProps = {
    isCollapsed: false,
    onToggleCollapsed: () => {},
    entries: [] as InventoryEntry[],
    gridEntries: [] as InventoryEntry[],
    selectedItem: null,
    selectedItemId: null,
    onSelectItem: () => {},
    onClearSelection: () => {},
    sort: "Name" as const,
    onSortChange: () => {},
    search: "",
    onSearchChange: () => {},
    page: 1,
    pageCount: 1,
    onPageChange: () => {},
    totalItems: 0,
    emptyState: "No items",
    selectionHint: "Off-page selection"
};

describe("Accessibility", () => {
    it("InventoryPanel has no obvious axe violations", async () => {
        const { container } = render(<InventoryPanel {...baseProps} />);
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });
});
