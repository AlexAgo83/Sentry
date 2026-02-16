import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppView } from "../../src/app/AppView";

const renderAppView = () => {
    return render(
        <AppView
            version="0.0.0"
            onOpenSystem={() => {}}
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

    it("shows Quests in the mobile header", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        renderAppView();
        expect(screen.getByRole("tab", { name: "Quests" })).toBeTruthy();
    });
});
