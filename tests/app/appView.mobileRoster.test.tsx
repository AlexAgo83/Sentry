import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppView, type AppActiveScreen, type AppActiveSidePanel } from "../../src/app/AppView";

const renderAppView = (props?: {
    activeScreen?: AppActiveScreen;
    activeSidePanel?: AppActiveSidePanel;
    isRosterDrawerOpen?: boolean;
}) => {
    return render(
        <AppView
            version="0.0.0"
            onOpenSystem={() => {}}
            isRosterDrawerOpen={props?.isRosterDrawerOpen}
            activeScreen={props?.activeScreen ?? "main"}
            activeSidePanel={props?.activeSidePanel ?? "action"}
            onShowAction={() => {}}
            onShowDungeon={() => {}}
            isDungeonLocked={false}
            onShowStats={() => {}}
            onShowRoster={() => {}}
            onShowInventory={() => {}}
            onShowEquipment={() => {}}
            onShowShop={() => {}}
            onShowQuests={() => {}}
            isDungeonRunActive={false}
            hasNewInventoryItems={false}
            roster={<section><h2>Roster Panel Content</h2></section>}
            actionPanel={<div />}
            statsPanel={<div />}
            inventoryPanel={<div />}
            equipmentPanel={<div />}
            shopPanel={<div />}
            questsPanel={<div />}
            actionSelectionScreen={<div />}
            dungeonScreen={<div />}
        />
    );
};

describe("AppView (mobile roster)", () => {
    it("shows the roster toggle button in the mobile top bar", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        renderAppView();
        expect(screen.getByRole("button", { name: "Open roster" })).toBeTruthy();
    });

    it("toggles the roster drawer open state on mobile", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        const { rerender, container } = renderAppView({ activeScreen: "main", activeSidePanel: "action" });
        const drawer = container.querySelector(".app-roster-drawer");
        expect(drawer?.classList.contains("is-open")).toBe(false);

        rerender(
            <AppView
                version="0.0.0"
                onOpenSystem={() => {}}
                isRosterDrawerOpen
                activeScreen="main"
                activeSidePanel="action"
                onShowAction={() => {}}
                onShowDungeon={() => {}}
                isDungeonLocked={false}
                onShowStats={() => {}}
                onShowRoster={() => {}}
                onShowInventory={() => {}}
                onShowEquipment={() => {}}
                onShowShop={() => {}}
                onShowQuests={() => {}}
                isDungeonRunActive={false}
                hasNewInventoryItems={false}
                roster={<section><h2>Roster Panel Content</h2></section>}
                actionPanel={<div />}
                statsPanel={<div />}
                inventoryPanel={<div />}
                equipmentPanel={<div />}
                shopPanel={<div />}
                questsPanel={<div />}
                actionSelectionScreen={<div />}
                dungeonScreen={<div />}
            />
        );
        expect(drawer?.classList.contains("is-open")).toBe(true);
    });

    it("locks body scroll when roster drawer is open on mobile", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        const { rerender } = renderAppView({ isRosterDrawerOpen: true });
        expect(document.body.classList.contains("is-roster-drawer-open")).toBe(true);
        expect(document.body.style.overflow).toBe("hidden");
        expect(document.documentElement.style.overflow).toBe("hidden");

        rerender(
            <AppView
                version="0.0.0"
                onOpenSystem={() => {}}
                isRosterDrawerOpen={false}
                activeScreen="main"
                activeSidePanel="action"
                onShowAction={() => {}}
                onShowDungeon={() => {}}
                isDungeonLocked={false}
                onShowStats={() => {}}
                onShowRoster={() => {}}
                onShowInventory={() => {}}
                onShowEquipment={() => {}}
                onShowShop={() => {}}
                onShowQuests={() => {}}
                isDungeonRunActive={false}
                hasNewInventoryItems={false}
                roster={<section><h2>Roster Panel Content</h2></section>}
                actionPanel={<div />}
                statsPanel={<div />}
                inventoryPanel={<div />}
                equipmentPanel={<div />}
                shopPanel={<div />}
                questsPanel={<div />}
                actionSelectionScreen={<div />}
                dungeonScreen={<div />}
            />
        );
        expect(document.body.classList.contains("is-roster-drawer-open")).toBe(false);
        expect(document.body.style.overflow).toBe("");
        expect(document.documentElement.style.overflow).toBe("");
    });
});
