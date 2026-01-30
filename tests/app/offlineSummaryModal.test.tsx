import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfflineSummaryModal } from "../../src/app/components/OfflineSummaryModal";
import type { OfflinePlayerSummary } from "../../src/core/types";

const buildBaseSummary = () => ({
    durationMs: 0,
    processedMs: 0,
    ticks: 3,
    capped: false,
    players: [],
    totalItemDeltas: {}
});

describe("OfflineSummaryModal", () => {
    it("formats time away under one minute", () => {
        const summary = { ...buildBaseSummary(), durationMs: 59_000, processedMs: 59_000 };
        render(
            <OfflineSummaryModal
                summary={summary}
                players={[]}
                onClose={vi.fn()}
                getSkillLabel={() => "Skill"}
                getRecipeLabel={() => "Recipe"}
            />
        );

        expect(screen.getByText("Time away: 59s")).toBeTruthy();
        expect(screen.getByText((_, element) => (
            element?.tagName === "LI"
            && Boolean(element.textContent?.includes("Inventory changes:"))
            && Boolean(element.textContent?.includes("None"))
        ))).toBeTruthy();
    });

    it("formats time away under one hour", () => {
        const summary = { ...buildBaseSummary(), durationMs: 61_000, processedMs: 61_000 };
        render(
            <OfflineSummaryModal
                summary={summary}
                players={[]}
                onClose={vi.fn()}
                getSkillLabel={() => "Skill"}
                getRecipeLabel={() => "Recipe"}
            />
        );

        expect(screen.getByText("Time away: 1m 1s")).toBeTruthy();
    });

    it("formats time away over one hour", () => {
        const summary = { ...buildBaseSummary(), durationMs: 3_661_000, processedMs: 3_661_000 };
        render(
            <OfflineSummaryModal
                summary={summary}
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
            processedMs: 10000,
            ticks: 5,
            capped: false,
            players: [],
            totalItemDeltas: { bones: 1 }
        };
        const players: OfflinePlayerSummary[] = [
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
                players={players}
                onClose={vi.fn()}
                getSkillLabel={() => "HuntingLabel"}
                getRecipeLabel={() => "RecipeLabel"}
            />
        );

        expect(screen.getByText((_, element) => (
            element?.tagName === "LI"
            && Boolean(element.textContent?.includes("Inventory changes:"))
            && Boolean(element.textContent?.includes("+1 Bones"))
        ))).toBeTruthy();
        expect(screen.getByText("Action HuntingLabel - Recipe RecipeLabel")).toBeTruthy();
        expect(screen.getByText("Action HuntingLabel")).toBeTruthy();
        expect(screen.getByText("No action running")).toBeTruthy();
        expect(screen.getByText((_, element) => (
            element?.classList?.contains("ts-offline-gains")
            && Boolean(element.textContent?.includes("Items:"))
            && Boolean(element.textContent?.includes("+2 Bones"))
        ))).toBeTruthy();
        expect(screen.getAllByText((_, element) => (
            element?.classList?.contains("ts-offline-gains")
            && Boolean(element.textContent?.includes("Items:"))
            && Boolean(element.textContent?.includes("None"))
        )).length).toBe(2);
        expect(screen.getByText(/- \+2 Lv/)).toBeTruthy();
        expect(screen.getByText(/- \+1 Lv/)).toBeTruthy();
        expect(screen.getByText(/Skill \+0 XP/)).toBeTruthy();
    });

    it("shows processed time when the recap is capped", () => {
        const summary = {
            durationMs: 60_000,
            processedMs: 10_000,
            ticks: 20,
            capped: true,
            players: [],
            totalItemDeltas: {}
        };

        render(
            <OfflineSummaryModal
                summary={summary}
                players={[]}
                onClose={vi.fn()}
                getSkillLabel={() => "Skill"}
                getRecipeLabel={() => "Recipe"}
            />
        );

        expect(screen.getByText("Time away: 1m 0s")).toBeTruthy();
        expect(screen.getByText("Processed: 10s (capped)")).toBeTruthy();
    });
});
