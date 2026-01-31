import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppView } from "../../src/app/AppView";

const renderAppView = (props: Partial<Parameters<typeof AppView>[0]> = {}) => {
    return render(
        <AppView
            version="0.0.0"
            onOpenSystem={() => {}}
            activeScreen="main"
            activeSidePanel="action"
            onShowAction={() => {}}
            onShowStats={() => {}}
            onShowRoster={() => {}}
            onShowInventory={() => {}}
            onShowEquipment={() => {}}
            onShowShop={() => {}}
            onShowQuests={() => {}}
            hasNewInventoryItems={false}
            roster={<section><h2>Roster Panel Content</h2></section>}
            actionPanel={<div />}
            statsPanel={<div />}
            inventoryPanel={<div />}
            equipmentPanel={<div />}
            shopPanel={<div />}
            questsPanel={<div />}
            actionSelectionScreen={<div />}
            {...props}
        />
    );
};

describe("AppView (mobile roster)", () => {
    it("shows the Roster label in the mobile bottom bar", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        renderAppView();
        expect(screen.getByRole("tab", { name: "Roster" })).toBeTruthy();
    });

    it("hides roster on mobile unless the roster screen is active", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        const { rerender } = renderAppView({ activeScreen: "main", activeSidePanel: "action" });
        expect(screen.queryByText("Roster Panel Content")).toBeNull();

        rerender(
            <AppView
                version="0.0.0"
                onOpenSystem={() => {}}
                activeScreen="roster"
                activeSidePanel="action"
                onShowAction={() => {}}
                onShowStats={() => {}}
                onShowRoster={() => {}}
                onShowInventory={() => {}}
                onShowEquipment={() => {}}
                onShowShop={() => {}}
                onShowQuests={() => {}}
                hasNewInventoryItems={false}
                roster={<section><h2>Roster Panel Content</h2></section>}
                actionPanel={<div />}
                statsPanel={<div />}
                inventoryPanel={<div />}
                equipmentPanel={<div />}
                shopPanel={<div />}
                questsPanel={<div />}
                actionSelectionScreen={<div />}
            />
        );
        expect(screen.getByText("Roster Panel Content")).toBeTruthy();
    });
});
