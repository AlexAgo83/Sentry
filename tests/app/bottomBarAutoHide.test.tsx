import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppView } from "../../src/app/AppView";

describe("AppView (mobile bottom bar)", () => {
    it("does not render the bottom bar on mobile", () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });

        const { container } = render(
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

        expect(container.querySelector(".app-bottom-bar")).toBeNull();
    });
});
