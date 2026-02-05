import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SidePanelSwitcher } from "../../src/app/components/SidePanelSwitcher";

describe("SidePanelSwitcher dungeon active state", () => {
    it("keeps only dungeon selected on desktop when entering dungeon from another panel", () => {
        render(
            <SidePanelSwitcher
                active="inventory"
                isDungeonActive
                onShowDungeon={vi.fn()}
                onShowAction={vi.fn()}
                onShowStats={vi.fn()}
                onShowInventory={vi.fn()}
                onShowEquipment={vi.fn()}
                onShowShop={vi.fn()}
                onShowQuests={vi.fn()}
            />
        );

        expect(screen.getByRole("tab", { name: "Dungeon" }).getAttribute("aria-selected")).toBe("true");
        expect(screen.getByRole("tab", { name: "Bank" }).getAttribute("aria-selected")).toBe("false");
        expect(screen.getByRole("tab", { name: "Shop" }).getAttribute("aria-selected")).toBe("false");
    });

    it("does not keep Travel menu entries active while dungeon is active", async () => {
        const user = userEvent.setup();
        render(
            <SidePanelSwitcher
                active="shop"
                isDungeonActive
                onShowDungeon={vi.fn()}
                onShowAction={vi.fn()}
                onShowStats={vi.fn()}
                onShowInventory={vi.fn()}
                onShowEquipment={vi.fn()}
                onShowShop={vi.fn()}
                onShowQuests={vi.fn()}
                useInventoryMenu
                useHeroMenu
            />
        );

        expect(screen.getByRole("tab", { name: "Hero" }).getAttribute("aria-selected")).toBe("true");
        expect(screen.getByRole("tab", { name: "Bank" }).getAttribute("aria-selected")).toBe("false");

        await user.click(screen.getByRole("tab", { name: "Bank" }));
        expect(screen.getByRole("menuitem", { name: "Shop" }).className.includes("is-active")).toBe(false);
        expect(screen.getByRole("menuitem", { name: "Inventory" }).className.includes("is-active")).toBe(false);
        expect(screen.getByRole("menuitem", { name: "Quests" }).className.includes("is-active")).toBe(false);
    });
});
