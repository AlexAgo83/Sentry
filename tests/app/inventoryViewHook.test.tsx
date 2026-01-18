import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useInventoryView } from "../../src/app/hooks/useInventoryView";
import { getInventoryMeta } from "../../src/app/ui/inventoryMeta";
import { ITEM_USAGE_MAP } from "../../src/app/ui/itemUsage";
import { ITEM_DEFINITIONS } from "../../src/data/definitions";

describe("useInventoryView", () => {
    it("sorts by count, pages results, and tracks selection", () => {
        const definitions = ITEM_DEFINITIONS.filter((item) => ["gold", "bones", "meat"].includes(item.id));
        const items = { gold: 2, bones: 5, meat: 0 };

        const { result } = renderHook(() => useInventoryView({
            items,
            definitions,
            getInventoryMeta,
            usageMap: ITEM_USAGE_MAP,
            sort: "Count",
            search: "",
            page: 1,
            selectedItemId: "gold",
            pageSize: 1
        }));

        expect(result.current.visibleEntries).toHaveLength(2);
        expect(result.current.sortedEntries[0].id).toBe("bones");
        expect(result.current.pageCount).toBe(2);
        expect(result.current.pageEntries).toHaveLength(1);
        expect(result.current.selectedItem?.id).toBe("gold");
        expect(result.current.selectedItemPage).toBe(2);
    });

    it("filters by search", () => {
        const definitions = ITEM_DEFINITIONS.filter((item) => ["gold", "bones"].includes(item.id));
        const items = { gold: 2, bones: 5 };

        const { result } = renderHook(() => useInventoryView({
            items,
            definitions,
            getInventoryMeta,
            usageMap: ITEM_USAGE_MAP,
            sort: "Name",
            search: "bon",
            page: 1,
            selectedItemId: null
        }));

        expect(result.current.filteredEntries).toHaveLength(1);
        expect(result.current.filteredEntries[0].id).toBe("bones");
        expect(result.current.pageCount).toBe(1);
    });
});
