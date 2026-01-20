import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

describe("persistence hooks", () => {
    const originalVi = (globalThis as any).vi;
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        (globalThis as any).vi = originalVi;
        process.env.NODE_ENV = originalEnv;
        vi.resetModules();
    });

    it("usePersistedCollapse stores and restores state", async () => {
        // Force non-test path to hit localStorage
        (globalThis as any).vi = undefined;
        process.env.NODE_ENV = "development";
        vi.resetModules();
        const { usePersistedCollapse } = await import("../../src/app/hooks/usePersistedCollapse");

        const getItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
        const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});

        const { result } = renderHook(() => usePersistedCollapse("panel", false));

        expect(result.current[0]).toBe(false);
        act(() => {
            result.current[1](true);
        });
        await waitFor(() => expect(setItem).toHaveBeenCalled());

        getItem.mockReturnValueOnce(JSON.stringify({ panel: true }));
        const { result: second } = renderHook(() => usePersistedCollapse("panel", false));
        expect(second.current[0]).toBe(true);

        getItem.mockRestore();
        setItem.mockRestore();
    });

    it("usePersistedInventoryFilters stores and restores values", async () => {
        // Force non-test path
        (globalThis as any).vi = undefined;
        process.env.NODE_ENV = "development";
        vi.resetModules();
        const { usePersistedInventoryFilters } = await import("../../src/app/hooks/usePersistedInventoryFilters");

        const getItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
        const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
        const defaultValue = { sort: "Name" as const, search: "", page: 1 };

        const { result } = renderHook(() => usePersistedInventoryFilters(defaultValue));
        act(() => {
            result.current[1]({ sort: "Count", search: "foo", page: 2 });
        });
        await waitFor(() => expect(setItem).toHaveBeenCalled());

        getItem.mockReturnValueOnce(JSON.stringify({ sort: "Count", search: "bar", page: 3 }));
        const { result: second } = renderHook(() => usePersistedInventoryFilters(defaultValue));
        expect(second.current[0]).toEqual({ sort: "Count", search: "bar", page: 3 });

        getItem.mockRestore();
        setItem.mockRestore();
    });
});
