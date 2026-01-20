import { render, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppView } from "../../src/app/AppView";

describe("AppView (mobile bottom bar)", () => {
    it("auto-hides the bottom bar on scroll down and shows it on scroll up", async () => {
        Object.defineProperty(window, "innerWidth", { value: 360, writable: true });
        Object.defineProperty(window, "scrollY", { value: 0, writable: true });

        const { container } = render(
            <AppView
                version="0.0.0"
                onOpenSystem={() => {}}
                onOpenDevTools={() => {}}
                activeSidePanel="action"
                onShowAction={() => {}}
                onShowStats={() => {}}
                onShowInventory={() => {}}
                onShowEquipment={() => {}}
                roster={<div />}
                actionPanel={<div />}
                statsPanel={<div />}
                inventoryPanel={<div />}
                equipmentPanel={<div />}
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
            expect(container.querySelector(".app-bottom-bar")?.className).toContain("is-scroll-hidden");
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

