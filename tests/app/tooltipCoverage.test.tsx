import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import type { GameStore } from "../../src/store/gameStore";
import { getTooltipCoverageViolations } from "./helpers/tooltipAssertions";

let testStore: GameStore;
let testRuntime: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    simulateOffline: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
};

vi.mock("../../src/app/game", () => ({
    get gameStore() {
        return testStore;
    },
    get gameRuntime() {
        return testRuntime;
    }
}));

const buildState = () => {
    const state = createInitialGameState("0.4.0", { seedHero: true });
    state.appReady = true;
    state.players["2"] = createPlayerState("2", "Mara");
    state.inventory.items.meat = 2;
    state.inventory.items.bones = 1;
    return state;
};

const renderApp = () => {
    Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
    testStore = createGameStore(buildState());
    testRuntime = {
        start: vi.fn(),
        stop: vi.fn(),
        simulateOffline: vi.fn(),
        reset: vi.fn()
    };
    const user = userEvent.setup();
    render(<App />);
    return { user };
};

const assertTooltipCoverage = (root: HTMLElement = document.body) => {
    const { missingTitles, iconOnlyButtonsMissingAria } = getTooltipCoverageViolations(root);
    expect(
        missingTitles,
        `Missing title attributes:\n${missingTitles.join("\n")}`
    ).toEqual([]);
    expect(
        iconOnlyButtonsMissingAria,
        `Icon-only buttons missing aria-label:\n${iconOnlyButtonsMissingAria.join("\n")}`
    ).toEqual([]);
};

describe("Tooltip coverage", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("ensures all clickable controls expose hover titles (and icon buttons have aria-label)", () => {
        renderApp();
        expect(screen.getByText("Roster")).toBeTruthy();
        assertTooltipCoverage();
    });

    it("keeps tooltip coverage across primary navigation and system modal flows", async () => {
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        const fetchSpy = vi.fn().mockImplementation(async (input: string | URL | Request) => {
            const url = String(input);
            if (url.includes("/api/v1/leaderboard")) {
                return new Response(
                    JSON.stringify({
                        items: [],
                        perPage: 10,
                        hasNextPage: false,
                        nextCursor: null
                    }),
                    { status: 200, headers: { "content-type": "application/json" } }
                );
            }
            return new Response(
                JSON.stringify({
                    items: [],
                    page: 1,
                    perPage: 10,
                    hasNextPage: false,
                    source: "github"
                }),
                { status: 200, headers: { "content-type": "application/json" } }
            );
        });
        vi.stubGlobal("fetch", fetchSpy);

        const { user } = renderApp();

        // Main nav tabs
        assertTooltipCoverage();
        await user.click(screen.getByRole("tab", { name: /Inv/ }));
        assertTooltipCoverage();
        await user.click(screen.getByRole("tab", { name: /Quest/i }));
        assertTooltipCoverage();
        await user.click(screen.getByRole("tab", { name: /Action/i }));
        assertTooltipCoverage();

        // Open Settings (System modal) and a couple of nested modals.
        await user.click(screen.getByRole("button", { name: "Open settings" }));
        expect(await screen.findByRole("heading", { name: "Settings" })).toBeTruthy();
        assertTooltipCoverage();

        await user.click(screen.getByRole("button", { name: "Action journal" }));
        expect(await screen.findByRole("heading", { name: "Journal" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));

        await user.click(screen.getByRole("button", { name: "Telemetry" }));
        expect(await screen.findByRole("heading", { name: "Telemetry" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));

        await user.click(screen.getByRole("button", { name: "Graphics" }));
        expect(await screen.findByRole("heading", { name: "Graphics" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));

        await user.click(screen.getByRole("button", { name: "Save options" }));
        expect(await screen.findByRole("heading", { name: "Save" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Local save" }));
        expect(await screen.findByRole("heading", { name: "Local save" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Save" })).toBeTruthy();
        assertTooltipCoverage();

        await user.click(screen.getByRole("button", { name: "Cloud save" }));
        expect(await screen.findByRole("heading", { name: "Cloud Save" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Save" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));

        // Leaderboard/Change both hit the backend.
        await user.click(screen.getByRole("button", { name: "Leaderboard" }));
        expect(await screen.findByRole("heading", { name: "Scrore" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));

        await user.click(screen.getByRole("button", { name: "Changelogs" }));
        expect(await screen.findByRole("heading", { name: "Change" })).toBeTruthy();
        assertTooltipCoverage();
        await user.click(screen.getByRole("button", { name: "Back" }));

        await user.click(screen.getByRole("button", { name: "About" }));
        expect(openSpy).toHaveBeenCalled();

        openSpy.mockRestore();
        vi.unstubAllGlobals();
    });
});
