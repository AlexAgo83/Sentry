import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfflineSummaryModal } from "../../src/app/components/OfflineSummaryModal";

const buildBaseSummary = () => ({
    durationMs: 0,
    ticks: 3,
    players: [],
    totalItemDeltas: {}
});

describe("OfflineSummaryModal", () => {
    it("formats time away under one minute", () => {
        render(
            <OfflineSummaryModal
                summary={buildBaseSummary()}
                offlineSeconds={59}
                players={[]}
                onClose={vi.fn()}
                getSkillLabel={() => "Skill"}
                getRecipeLabel={() => "Recipe"}
            />
        );

        expect(screen.getByText("Time away: 59s")).toBeTruthy();
        expect(screen.getByText("Inventory changes: None")).toBeTruthy();
    });

    it("formats time away under one hour", () => {
        render(
            <OfflineSummaryModal
                summary={buildBaseSummary()}
                offlineSeconds={61}
                players={[]}
                onClose={vi.fn()}
                getSkillLabel={() => "Skill"}
                getRecipeLabel={() => "Recipe"}
            />
        );

        expect(screen.getByText("Time away: 1m 1s")).toBeTruthy();
    });

    it("formats time away over one hour", () => {
        render(
            <OfflineSummaryModal
                summary={buildBaseSummary()}
                offlineSeconds={3661}
                players={[]}
                onClose={vi.fn()}
                getSkillLabel={() => "Skill"}
                getRecipeLabel={() => "Recipe"}
            />
        );

        expect(screen.getByText("Time away: 1h 1m")).toBeTruthy();
    });

    it("renders action labels, level gains, and item deltas", () => {
        const summary = {
            durationMs: 10000,
            ticks: 5,
            players: [],
            totalItemDeltas: { bones: 1 }
        };
        const players = [
            {
                playerId: "1",
                playerName: "Player_1",
                actionId: "Hunting",
                recipeId: "hunt_small_game",
                skillXpGained: 10.2,
                recipeXpGained: 4,
                skillLevelGained: 2,
                recipeLevelGained: 1,
                itemDeltas: { bones: 2 }
            },
            {
                playerId: "3",
                playerName: "Astra",
                actionId: "Hunting",
                recipeId: null,
                skillXpGained: 1,
                recipeXpGained: 1,
                skillLevelGained: 0,
                recipeLevelGained: 0,
                itemDeltas: {}
            },
            {
                playerId: "2",
                playerName: "Nova",
                actionId: null,
                recipeId: null,
                skillXpGained: Number.NaN,
                recipeXpGained: Number.NaN,
                skillLevelGained: 0,
                recipeLevelGained: 0,
                itemDeltas: {}
            }
        ];

        render(
            <OfflineSummaryModal
                summary={summary}
                offlineSeconds={15}
                players={players}
                onClose={vi.fn()}
                getSkillLabel={() => "HuntingLabel"}
                getRecipeLabel={() => "RecipeLabel"}
            />
        );

        expect(screen.getByText(/Inventory changes: \+1 Bones/)).toBeTruthy();
        expect(screen.getByText("Action HuntingLabel - Recipe RecipeLabel")).toBeTruthy();
        expect(screen.getByText("Action HuntingLabel")).toBeTruthy();
        expect(screen.getByText("No action running")).toBeTruthy();
        expect(screen.getByText(/Items: \+2 Bones/)).toBeTruthy();
        expect(screen.getAllByText("Items: None").length).toBe(2);
        expect(screen.getByText(/- \+2 Lv/)).toBeTruthy();
        expect(screen.getByText(/- \+1 Lv/)).toBeTruthy();
        expect(screen.getByText(/Skill \+0 XP/)).toBeTruthy();
    });
});
