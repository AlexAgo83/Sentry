import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { createInitialGameState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import type { OfflineSummaryState } from "../../src/core/types";

let testStore: ReturnType<typeof createGameStore>;
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

describe("Smoke: offline recap modal", () => {
    it("shows and can be acknowledged when offlineSummary exists", async () => {
        const state = createInitialGameState("0.4.0");
        testStore = createGameStore(state);
        testRuntime = {
            start: vi.fn(),
            stop: vi.fn(),
            simulateOffline: vi.fn(),
            reset: vi.fn()
        };

        const summary: OfflineSummaryState = {
            durationMs: 15000,
            processedMs: 15000,
            ticks: 3,
            capped: false,
            players: [
                {
                    playerId: "1",
                    playerName: "Player_1",
                    actionId: "Hunting",
                    recipeId: "hunt_small_game",
                    skillXpGained: 3,
                    recipeXpGained: 6,
                    skillLevelGained: 0,
                    recipeLevelGained: 0,
                    itemDeltas: { bones: 2 },
                    dungeonGains: { combatXp: {}, itemDeltas: {} }
                }
            ],
            totalItemDeltas: { bones: 2 }
        };

        testStore.dispatch({ type: "setOfflineSummary", summary });

        render(<App />);

        expect(await screen.findByText("Offline recap")).toBeTruthy();
        expect(screen.getByText((_, element) => (
            element?.tagName === "LI"
            && Boolean(element.textContent?.includes("Inventory changes:"))
            && Boolean(element.textContent?.includes("+2 Bones"))
        ))).toBeTruthy();
        await screen.findByRole("button", { name: "Close" });
    });
});
