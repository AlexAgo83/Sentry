import { render, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppView } from "../../src/app/AppView";

describe("AppView (mobile bottom bar)", () => {
    it("keeps the bottom bar visible while scrolling", async () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        Object.defineProperty(window, "scrollY", { value: 0, writable: true });

        const { container } = render(
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
                roster={<div />}
                actionPanel={<div />}
                statsPanel={<div />}
                inventoryPanel={<div />}
                equipmentPanel={<div />}
                shopPanel={<div />}
                questsPanel={<div />}
                actionSelectionScreen={<div />}
            />
        );

        const bottomBar = container.querySelector(".app-bottom-bar");
        expect(bottomBar).toBeTruthy();
        expect(bottomBar?.className).not.toContain("is-scroll-hidden");

        await act(async () => {
            (window as any).scrollY = 200;
            window.dispatchEvent(new Event("scroll"));
        });

        await waitFor(() => {
            expect(container.querySelector(".app-bottom-bar")?.className).not.toContain("is-scroll-hidden");
        });

        await act(async () => {
            (window as any).scrollY = 120;
            window.dispatchEvent(new Event("scroll"));
        });

        await waitFor(() => {
            expect(container.querySelector(".app-bottom-bar")?.className).not.toContain("is-scroll-hidden");
        });
    });
});
