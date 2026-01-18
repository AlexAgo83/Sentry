import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { InventoryControls } from "../../src/app/components/InventoryControls";

describe("InventoryControls", () => {
    it("updates search and sort", async () => {
        const user = userEvent.setup();
        const onSortChange = vi.fn();
        const onSearchChange = vi.fn();

        const Harness = () => {
            const [sort, setSort] = useState<"Name" | "Count">("Name");
            const [search, setSearch] = useState("");
            return (
                <InventoryControls
                    sort={sort}
                    onSortChange={(value) => {
                        onSortChange(value);
                        setSort(value);
                    }}
                    search={search}
                    onSearchChange={(value) => {
                        onSearchChange(value);
                        setSearch(value);
                    }}
                />
            );
        };

        render(
            <Harness />
        );

        await user.type(screen.getByLabelText("Search"), "bones");
        expect(onSearchChange).toHaveBeenCalled();
        expect((screen.getByLabelText("Search") as HTMLInputElement).value).toBe("bones");

        await user.click(screen.getByRole("tab", { name: "Count" }));
        expect(onSortChange).toHaveBeenCalledWith("Count");
    });

    it("renders active sort state for Count and can switch back to Name", async () => {
        const user = userEvent.setup();
        const onSortChange = vi.fn();

        render(
            <InventoryControls
                sort="Count"
                onSortChange={onSortChange}
                search=""
                onSearchChange={vi.fn()}
            />
        );

        expect(screen.getByRole("tab", { name: "Count" }).getAttribute("aria-selected")).toBe("true");

        await user.click(screen.getByRole("tab", { name: "Name" }));
        expect(onSortChange).toHaveBeenCalledWith("Name");
    });
});
