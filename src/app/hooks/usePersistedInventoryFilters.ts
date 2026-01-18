import { useEffect, useState } from "react";
import type { InventorySort } from "../components/InventoryPanel";

// Vitest exposes a global `vi`; use it to detect test mode for hooks that should avoid persistence.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const vi: any;
const isTestEnv = typeof vi !== "undefined" ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as any).vitest)) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "test");

const INVENTORY_FILTERS_STORAGE_KEY = "sentry.inventoryFilters";

export type InventoryFilters = {
    sort: InventorySort;
    search: string;
    page: number;
};

export const usePersistedInventoryFilters = (defaultValue: InventoryFilters) => {
    if (isTestEnv) {
        return useState<InventoryFilters>(defaultValue) as const;
    }
    const [value, setValue] = useState<InventoryFilters>(() => {
        if (typeof window === "undefined") {
            return defaultValue;
        }
        try {
            const raw = window.localStorage.getItem(INVENTORY_FILTERS_STORAGE_KEY);
            if (!raw) {
                return defaultValue;
            }
            const parsed = JSON.parse(raw);
            const sort = parsed?.sort === "Name" || parsed?.sort === "Count" ? parsed.sort : defaultValue.sort;
            const search = typeof parsed?.search === "string" ? parsed.search : defaultValue.search;
            const page = typeof parsed?.page === "number" && parsed.page > 0 ? parsed.page : defaultValue.page;
            return { sort, search, page };
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        if (isTestEnv) {
            return;
        }
        if (typeof window === "undefined") {
            return;
        }
        try {
            window.localStorage.setItem(INVENTORY_FILTERS_STORAGE_KEY, JSON.stringify(value));
        } catch {
            // ignore storage failures
        }
    }, [value]);

    return [value, setValue] as const;
};
