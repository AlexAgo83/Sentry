import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import type { GameStore } from "../../src/store/gameStore";
import type { OfflineSummaryState } from "../../src/core/types";

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

const buildState = (options?: { food?: number; rosterLimit?: number }) => {
    const state = createInitialGameState("0.4.0");
    state.players["2"] = createPlayerState("2", "Mara");
    if (options?.rosterLimit !== undefined) {
        state.rosterLimit = options.rosterLimit;
    }
    state.inventory.items.food = options?.food ?? state.inventory.items.food ?? 0;
    state.inventory.items.meat = 2;
    state.inventory.items.bones = 1;
    return state;
};

const renderApp = (options?: { food?: number; rosterLimit?: number }) => {
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
        const { user } = renderApp({ rosterLimit: 3 });
        expect(screen.getByText("Roster")).toBeTruthy();
        const rosterPanel = screen.getByText("Roster").closest("section");
        expect(rosterPanel).toBeTruthy();
        if (rosterPanel) {
            expect(within(rosterPanel).getByText("Player_1")).toBeTruthy();
            expect(within(rosterPanel).getByText("Mara")).toBeTruthy();
            expect(within(rosterPanel).getByRole("button", { name: "Enlist a new hero" })).toBeTruthy();
        }

        await user.click(screen.getByRole("tab", { name: /Inv/ }));

        const inventoryPanel = screen.getByRole("heading", { name: "Inventory" }).closest("section");
        expect(inventoryPanel).toBeTruthy();
        if (inventoryPanel) {
            expect(within(inventoryPanel).getByRole("heading", { name: "No item selected" })).toBeTruthy();
            const goldSlot = within(inventoryPanel).getByRole("button", { name: "Gold x150" });
            await user.click(goldSlot);
            expect(within(inventoryPanel).getByRole("heading", { name: "Gold" })).toBeTruthy();
            expect(within(inventoryPanel).getByText("Count: 150")).toBeTruthy();
            await user.click(within(inventoryPanel).getByRole("button", { name: "Clear" }));
            expect(within(inventoryPanel).getByRole("heading", { name: "No item selected" })).toBeTruthy();
            await user.click(within(inventoryPanel).getByRole("button", { name: "Collapse" }));
            expect(within(inventoryPanel).queryByRole("button", { name: "Gold x150" })).toBeNull();
        }

        if (rosterPanel) {
            await user.click(within(rosterPanel).getByRole("button", { name: "Collapse" }));
            expect(within(rosterPanel).getByRole("button", { name: "Expand" })).toBeTruthy();
        }

        // Switch back to action
        await user.click(screen.getByRole("tab", { name: "Action" }));
        expect(screen.getByRole("heading", { name: "Action" })).toBeTruthy();
    });

    it("shows focusable inventory controls and usage labels", async () => {
        const { user } = renderApp({ rosterLimit: 3 });
        const inventoryTab = screen.getByRole("tab", { name: /Inv/ });
        expect(inventoryTab.className).toContain("ts-focusable");

        await user.click(inventoryTab);

        const inventoryPanel = screen.getByRole("heading", { name: "Inventory" }).closest("section");
        expect(inventoryPanel).toBeTruthy();
        if (inventoryPanel) {
            const goldSlot = within(inventoryPanel).getByRole("button", { name: "Gold x150" });
            await user.click(goldSlot);
            expect(within(inventoryPanel).getByText("Used by")).toBeTruthy();
            expect(within(inventoryPanel).getByText("Obtained by")).toBeTruthy();
        }
    });

    it("shows loadout summary and missing item hint", async () => {
        const { user } = renderApp({ food: 0 });
        await user.click(screen.getByRole("button", { name: "Change" }));

        const skillGroup = screen.getByRole("group", { name: "Select skill" });
        await user.click(within(skillGroup).getByRole("radio", { name: /Roaming/i }));

        const recipeGroup = screen.getByRole("group", { name: "Select recipe" });
        expect((within(recipeGroup).getByRole("radio", { name: /Border Skirmish/i }) as HTMLInputElement).checked).toBe(true);
        await user.click(within(recipeGroup).getByRole("radio", { name: /Frontline Clash/i }));
        expect((within(recipeGroup).getByRole("radio", { name: /Frontline Clash/i }) as HTMLInputElement).checked).toBe(true);

        testStore.dispatch({ type: "tick", deltaMs: 0, timestamp: Date.now() });
        expect((within(skillGroup).getByRole("radio", { name: /Roaming/i }) as HTMLInputElement).checked).toBe(true);
        expect((within(recipeGroup).getByRole("radio", { name: /Frontline Clash/i }) as HTMLInputElement).checked).toBe(true);

        const summary = screen.getByText("Action", { selector: ".ts-action-summary-label" })
            .closest(".ts-action-summary") as HTMLElement | null;
        expect(summary).toBeTruthy();
        if (summary) {
            expect(within(summary).getByText("Roaming")).toBeTruthy();
            expect(within(summary).getByText("Frontline Clash")).toBeTruthy();
            expect(within(summary).getByText("1 Food")).toBeTruthy();
            const inlineItems = within(summary).getAllByText((_, node) => (
                Boolean(node?.classList?.contains("ts-item-inline"))
            ));
            const inlineText = inlineItems.map((node) => node.textContent ?? "");
            expect(inlineText.some((text) => text.includes("1 Gold"))).toBe(true);
            expect(inlineText.some((text) => text.includes("1 Bones"))).toBe(true);
        }

        const missingHint = screen.getByText(/Missing: Food x1/);
        expect(missingHint).toBeTruthy();
        const startButton = screen.getByRole("button", { name: "Start action" }) as HTMLButtonElement;
        expect(startButton.disabled).toBe(true);
    });

    it("starts and pauses an action", async () => {
        const { user } = renderApp({ food: 2 });
        await user.click(screen.getByRole("button", { name: "Change" }));

        await user.click(within(screen.getByRole("group", { name: "Select skill" })).getByRole("radio", { name: /Roaming/i }));

        const startButton = screen.getByRole("button", { name: "Start action" }) as HTMLButtonElement;
        expect(startButton.disabled).toBe(false);

        await user.click(startButton);
        expect(testStore.getState().players["1"].selectedActionId).toBe("Combat");
        expect((screen.getByRole("button", { name: "Start action" }) as HTMLButtonElement).disabled).toBe(true);

        await user.click(screen.getByRole("button", { name: "Interrupt" }));
        expect(testStore.getState().players["1"].selectedActionId).toBeNull();
        expect((screen.getByRole("button", { name: "Start action" }) as HTMLButtonElement).disabled).toBe(false);
    });

    it("recruits and renames heroes, escape closes modal", async () => {
        const { user } = renderApp({ rosterLimit: 3 });

        await user.click(screen.getByRole("button", { name: "Enlist a new hero" }));
        const nameInput = screen.getByLabelText("Hero name") as HTMLInputElement;
        await user.type(nameInput, "Nova");
        await user.click(screen.getByRole("button", { name: "Create hero" }));
        expect(Object.keys(testStore.getState().players)).toHaveLength(3);
        expect(
            Object.values(testStore.getState().players).some((player) => player.name === "Nova")
        ).toBe(true);

        await user.click(screen.getByRole("tab", { name: "Stats" }));
        await user.click(screen.getByRole("button", { name: "Rename" }));
        const renameInput = screen.getByLabelText("Hero name") as HTMLInputElement;
        await user.clear(renameInput);
        await user.type(renameInput, "Alpha");
        await user.click(screen.getByRole("button", { name: "Save name" }));
        const activePlayerId = testStore.getState().activePlayerId;
        expect(activePlayerId).toBeTruthy();
        if (activePlayerId) {
            expect(testStore.getState().players[activePlayerId].name).toBe("Alpha");
        }

        await user.click(screen.getByRole("tab", { name: "Action" }));
        await user.click(screen.getByRole("button", { name: "Change" }));
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByRole("group", { name: "Select skill" })).toBeNull();
    });

    it("shows offline summary and handles system actions", async () => {
        const { user } = renderApp({ food: 1 });
        const summary: OfflineSummaryState = {
            durationMs: 20000,
            processedMs: 20000,
            ticks: 2,
            capped: false,
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
        expect(screen.getByText((_, element) => (
            element?.tagName === "LI"
            && Boolean(element?.textContent?.includes("Inventory changes:"))
            && Boolean(element?.textContent?.includes("+2 Bones"))
        ))).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Close" }));
        expect(testStore.getState().offlineSummary).toBeNull();

        await user.click(screen.getByRole("button", { name: "Open system telemetry" }));
        const systemDialog = await screen.findByRole("dialog");

        await user.click(within(systemDialog).getByRole("button", { name: "Simulate +30 min" }));
        expect(testRuntime.simulateOffline).toHaveBeenCalledWith(30 * 60 * 1000);

        const confirmSpy = vi.spyOn(window, "confirm");
        confirmSpy.mockReturnValueOnce(false).mockReturnValueOnce(true);

        await user.click(within(systemDialog).getByRole("button", { name: "Reset save" }));
        expect(testRuntime.reset).not.toHaveBeenCalled();
        await user.click(within(systemDialog).getByRole("button", { name: "Reset save" }));
        expect(testRuntime.reset).toHaveBeenCalled();
    });

    it("toggles the app shell modal class when overlays are open", async () => {
        const { user } = renderApp();
        const shell = document.querySelector(".app-shell");
        expect(shell).toBeTruthy();
        expect(shell?.className).not.toContain("is-modal-open");

        await user.click(screen.getByRole("button", { name: "Open system telemetry" }));
        const systemDialog = await screen.findByRole("dialog");
        await waitFor(() => {
            expect(document.querySelector(".app-shell")?.className).toContain("is-modal-open");
        });

        await user.click(within(systemDialog).getByRole("button", { name: "Close" }));
        await waitFor(() => {
            expect(document.querySelector(".app-shell")?.className).not.toContain("is-modal-open");
        });

        const summary: OfflineSummaryState = {
            durationMs: 20000,
            processedMs: 20000,
            ticks: 2,
            capped: false,
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
        await waitFor(() => {
            expect(document.querySelector(".app-shell")?.className).toContain("is-modal-open");
        });

        await user.click(await screen.findByRole("button", { name: "Close" }));
        await waitFor(() => {
            expect(document.querySelector(".app-shell")?.className).not.toContain("is-modal-open");
        });
    });

    it("renders the equipment panel and shows the active action label in telemetry", async () => {
        const { user } = renderApp({ food: 2 });

        await user.click(screen.getByRole("button", { name: "Change" }));
        await user.click(within(screen.getByRole("group", { name: "Select skill" })).getByRole("radio", { name: /Roaming/i }));
        await user.click(screen.getByRole("button", { name: "Start action" }));
        await user.click(screen.getByRole("button", { name: "Back" }));

        await user.click(screen.getByRole("tab", { name: "Equip" }));
        expect(screen.getByRole("heading", { name: "Equipment" })).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Open system telemetry" }));
        const dialogs = await screen.findAllByRole("dialog");
        const systemDialog = dialogs.at(-1);
        expect(systemDialog).toBeTruthy();
        if (!systemDialog) {
            throw new Error("System dialog not found");
        }
        expect(within(systemDialog).getByText(/Action: Roaming/)).toBeTruthy();
    });
});
