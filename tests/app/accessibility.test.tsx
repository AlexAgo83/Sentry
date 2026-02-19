import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "jest-axe";
import { InventoryPanel, type InventoryEntry } from "../../src/app/components/InventoryPanel";
import { ModalShell } from "../../src/app/components/ModalShell";
import { StartupSplashScreen } from "../../src/app/components/StartupSplashScreen";

const baseProps = {
    isCollapsed: false,
    onToggleCollapsed: () => {},
    entries: [] as InventoryEntry[],
    gridEntries: [] as InventoryEntry[],
    selectedItem: null,
    selectedItemId: null,
    selectedItemCharges: null,
    onSelectItem: () => {},
    onClearSelection: () => {},
    sellQuantity: 1,
    onSellQuantityChange: () => {},
    onSellSelected: () => {},
    canSellSelected: false,
    sellGoldGain: 0,
    unitValue: 0,
    sellDisabledReason: null as string | null,
    onSellAll: () => {},
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

    it("ModalShell has no obvious axe violations", async () => {
        const { container } = render(
            <ModalShell title="Settings" onClose={() => {}}>
                <button type="button">Confirm</button>
            </ModalShell>
        );
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });

    it("StartupSplashScreen has no obvious axe violations", async () => {
        const { container } = render(
            <StartupSplashScreen
                isReady
                onContinue={() => {}}
            />
        );
        const results = await axe(container);
        expect(results.violations).toHaveLength(0);
    });
});
