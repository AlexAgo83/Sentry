import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import type { GameStore } from "../../src/store/gameStore";

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

const buildState = (options?: { food?: number }) => {
    const state = createInitialGameState("0.4.0");
    state.players["2"] = createPlayerState("2", "Mara");
    state.inventory.items.food = options?.food ?? state.inventory.items.food ?? 0;
    state.inventory.items.meat = 2;
    state.inventory.items.bones = 1;
    return state;
};

const renderApp = (options?: { food?: number }) => {
    testStore = createGameStore(buildState(options));
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

describe("App", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("renders roster and toggles inventory panel", async () => {
        const { user } = renderApp();
        expect(screen.getByText("Roster")).toBeTruthy();
        expect(screen.getByText("2 heroes")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Inventory" }));

        const inventoryPanel = screen.getByRole("heading", { name: "Inventory" }).closest("section");
        expect(inventoryPanel).toBeTruthy();
        if (inventoryPanel) {
            expect(within(inventoryPanel).getByText("Gold: 150")).toBeTruthy();
            await user.click(within(inventoryPanel).getByRole("button", { name: "Collapse" }));
            expect(within(inventoryPanel).queryByText("Gold: 150")).toBeNull();
        }

        const rosterPanel = screen.getByText("Roster").closest("section");
        if (rosterPanel) {
            await user.click(within(rosterPanel).getByRole("button", { name: "Collapse" }));
            expect(screen.queryByText("Recruit new hero")).toBeNull();
        }
    });

    it("shows loadout summary and missing item hint", async () => {
        const { user } = renderApp({ food: 0 });
        const actButtons = screen.getAllByRole("button", { name: /Manage actions/ });
        await user.click(actButtons[0]);

        const skillSelect = screen.getByLabelText("Select skill");
        await user.selectOptions(skillSelect, ["Combat"]);

        const summary = screen.getByText("Action").closest(".ts-action-summary");
        expect(summary).toBeTruthy();
        if (summary) {
            expect(within(summary).getByText("Combat")).toBeTruthy();
            expect(within(summary).getByText("Border Skirmish")).toBeTruthy();
            expect(within(summary).getByText("1 Food")).toBeTruthy();
            expect(within(summary).getByText("1 Gold, 1 Bones")).toBeTruthy();
        }

        const missingHint = screen.getByText(/Missing: Food x1/);
        expect(missingHint).toBeTruthy();
        const startButton = screen.getByRole("button", { name: "Start action" }) as HTMLButtonElement;
        expect(startButton.disabled).toBe(true);
    });

    it("starts and pauses an action", async () => {
        const { user } = renderApp({ food: 2 });
        const actButtons = screen.getAllByRole("button", { name: /Manage actions/ });
        await user.click(actButtons[0]);

        const skillSelect = screen.getByLabelText("Select skill");
        await user.selectOptions(skillSelect, ["Combat"]);

        await user.click(screen.getByRole("button", { name: "Start action" }));
        expect(testStore.getState().players["1"].selectedActionId).toBe("Combat");

        await user.click(screen.getByRole("button", { name: "Pause action" }));
        expect(testStore.getState().players["1"].selectedActionId).toBeNull();
    });

    it("recruits and renames heroes, escape closes modal", async () => {
        const { user } = renderApp();

        await user.click(screen.getByRole("button", { name: "Recruit new hero" }));
        const nameInput = screen.getByLabelText("Hero name") as HTMLInputElement;
        await user.type(nameInput, "Nova");
        await user.click(screen.getByRole("button", { name: "Create hero" }));
        expect(Object.keys(testStore.getState().players)).toHaveLength(3);
        expect(
            Object.values(testStore.getState().players).some((player) => player.name === "Nova")
        ).toBe(true);

        const setButtons = screen.getAllByRole("button", { name: /Set name/ });
        await user.click(setButtons[0]);
        const renameInput = screen.getByLabelText("Hero name") as HTMLInputElement;
        await user.clear(renameInput);
        await user.type(renameInput, "Alpha");
        await user.click(screen.getByRole("button", { name: "Save name" }));
        expect(testStore.getState().players["1"].name).toBe("Alpha");

        const actButtons = screen.getAllByRole("button", { name: /Manage actions/ });
        await user.click(actButtons[0]);
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByText("Loadout")).toBeNull();
    });

    it("shows offline summary and handles system actions", async () => {
        const { user } = renderApp({ food: 1 });
        const summary = {
            durationMs: 20000,
            ticks: 2,
            players: [
                {
                    playerId: "1",
                    playerName: "Player_1",
                    actionId: "Hunting",
                    recipeId: "hunt_small_game",
                    skillXpGained: 2,
                    recipeXpGained: 4,
                    skillLevelGained: 0,
                    recipeLevelGained: 0,
                    itemDeltas: { bones: 2 }
                }
            ],
            totalItemDeltas: { bones: 2 }
        };

        testStore.dispatch({ type: "setOfflineSummary", summary });

        expect(await screen.findByText("Offline recap")).toBeTruthy();
        expect(screen.getByText(/Inventory changes: \+2 Bones/)).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Close" }));
        expect(testStore.getState().offlineSummary).toBeNull();

        const systemPanel = screen.getByText("System").closest("section");
        expect(systemPanel).toBeTruthy();
        if (systemPanel) {
            await user.click(within(systemPanel).getByRole("button", { name: "Expand" }));
            await user.click(within(systemPanel).getByRole("button", { name: "Simulate +30 min" }));
            expect(testRuntime.simulateOffline).toHaveBeenCalledWith(30 * 60 * 1000);

            const confirmSpy = vi.spyOn(window, "confirm");
            confirmSpy.mockReturnValueOnce(false).mockReturnValueOnce(true);

            await user.click(within(systemPanel).getByRole("button", { name: "Reset save" }));
            expect(testRuntime.reset).not.toHaveBeenCalled();
            await user.click(within(systemPanel).getByRole("button", { name: "Reset save" }));
            expect(testRuntime.reset).toHaveBeenCalled();
        }
    });
});
