import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useInventoryNewBadges } from "../../../src/app/hooks/useInventoryNewBadges";

const GLOBAL_STORAGE_KEY = "sentry:seen-items:global";

describe("useInventoryNewBadges", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("migrates legacy versioned storage into the global key", async () => {
        window.localStorage.setItem(
            "sentry:seen-items:0.9.3",
            JSON.stringify({ itemIds: ["gold"], menuIds: ["gold"] })
        );

        const { result } = renderHook(() => useInventoryNewBadges({ gold: 10, wood: 2 }, "0.9.3"));

        expect(result.current.newItemIds).toEqual(["wood"]);

        await waitFor(() => {
            expect(window.localStorage.getItem(GLOBAL_STORAGE_KEY)).toBeTruthy();
        });
    });

    it("keeps seen state when app version changes", () => {
        window.localStorage.setItem(
            GLOBAL_STORAGE_KEY,
            JSON.stringify({ itemIds: ["gold"], menuIds: ["gold"] })
        );

        const { result, rerender } = renderHook(
            ({ version }) => useInventoryNewBadges({ gold: 10, wood: 2 }, version),
            { initialProps: { version: "0.9.3" } }
        );

        expect(result.current.newItemIds).toEqual(["wood"]);

        rerender({ version: "0.9.4" });
        expect(result.current.newItemIds).toEqual(["wood"]);
    });
});
