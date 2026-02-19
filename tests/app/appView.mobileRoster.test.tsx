import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppView, type AppActiveScreen, type AppActiveSidePanel } from "../../src/app/AppView";

const renderAppView = (props?: {
    activeScreen?: AppActiveScreen;
    activeSidePanel?: AppActiveSidePanel;
    isRosterDrawerOpen?: boolean;
    onCloseRosterDrawer?: () => void;
}) => {
    return render(
        <AppView
            version="0.0.0"
            onOpenSystem={() => {}}
            isRosterDrawerOpen={props?.isRosterDrawerOpen}
            onCloseRosterDrawer={props?.onCloseRosterDrawer}
            activeScreen={props?.activeScreen ?? "main"}
            activeSidePanel={props?.activeSidePanel ?? "action"}
            onShowHero={() => {}}
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
                onShowHero={() => {}}
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
        expect(document.documentElement.style.overflow).toBe("");

        rerender(
            <AppView
                version="0.0.0"
                onOpenSystem={() => {}}
                isRosterDrawerOpen={false}
                activeScreen="main"
                activeSidePanel="action"
                onShowHero={() => {}}
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

    it("applies dialog semantics and keeps keyboard focus trapped in drawer", async () => {
        const user = userEvent.setup();
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        renderAppView({ isRosterDrawerOpen: true });

        const dialog = screen.getByRole("dialog", { name: "Sentry" });

        expect(dialog.getAttribute("aria-modal")).toBe("true");
        expect(document.activeElement).toBe(dialog);

        await user.tab();
        expect(document.activeElement).toBe(dialog);
    });

    it("closes the drawer via overlay and Escape key callbacks", async () => {
        const user = userEvent.setup();
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        const onCloseRosterDrawer = vi.fn();
        renderAppView({ isRosterDrawerOpen: true, onCloseRosterDrawer });

        await user.click(screen.getByRole("button", { name: "Dismiss roster overlay" }));
        expect(onCloseRosterDrawer).toHaveBeenCalledTimes(1);

        await user.keyboard("{Escape}");
        expect(onCloseRosterDrawer).toHaveBeenCalledTimes(2);
    });
});
