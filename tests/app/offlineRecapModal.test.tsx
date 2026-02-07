import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("App offline recap on startup", () => {
    beforeEach(() => {
        const state = createInitialGameState("0.4.0");
        testStore = createGameStore(state);
        testRuntime = {
            start: vi.fn(),
            stop: vi.fn(),
            simulateOffline: vi.fn(),
            reset: vi.fn()
        };
    });

    it("shows offline recap modal when summary exists at mount", async () => {
        const summary: OfflineSummaryState = {
            durationMs: 10000,
            processedMs: 10000,
            ticks: 5,
            capped: false,
            players: [
                {
                    playerId: "1",
                    playerName: "Player_1",
                    actionId: "Hunting",
                    recipeId: "hunt_small_game",
                    skillXpGained: 1,
                    recipeXpGained: 2,
                    skillLevelGained: 0,
                    recipeLevelGained: 0,
                    itemDeltas: { bones: 1 },
                    dungeonGains: { combatXp: {}, itemDeltas: {} }
                }
            ],
            totalItemDeltas: { bones: 1 }
        };
        testStore.dispatch({ type: "setOfflineSummary", summary });

        render(<App />);

        expect(await screen.findByText("Offline recap")).toBeTruthy();
        expect(screen.getByText((_, element) => (
            element?.tagName === "LI"
            && Boolean(element.textContent?.includes("Inventory changes:"))
            && Boolean(element.textContent?.includes("+1 Bones"))
        ))).toBeTruthy();
    });
});
