import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppView } from "../../src/app/AppView";

const renderAppView = () => {
    return render(
        <AppView
            version="0.0.0"
            onOpenSystem={() => {}}
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
            roster={<div />}
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

describe("AppView quests navigation", () => {
    it("shows Quests in the desktop header", () => {
        Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
        renderAppView();
        expect(screen.getByRole("tab", { name: "Quests" })).toBeTruthy();
    });

    it("shows Quests in the mobile Travel menu", async () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        const user = userEvent.setup();
        renderAppView();
        await user.click(screen.getByRole("tab", { name: "Travel" }));
        expect(screen.getByRole("menuitem", { name: "Quests" })).toBeTruthy();
    });
});
