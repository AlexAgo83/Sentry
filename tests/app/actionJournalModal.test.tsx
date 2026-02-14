import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionJournalModal } from "../../src/app/components/ActionJournalModal";
import type { ActionJournalEntry } from "../../src/core/types";

describe("ActionJournalModal", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("renders parsed labels with right-arrow formatting and split relative time", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-02-12T00:00:00.000Z"));

        const entries: ActionJournalEntry[] = [
            {
                id: "entry-1",
                at: Date.now() - (2 * 60 * 1000),
                label: "Recipe: Tobin Frostmere -> Hunting / Mountain Stag",
            },
            {
                id: "entry-2",
                at: Date.now() - (20 * 60 * 1000),
                label: "Action: Nora Briar -> Herbalism",
            },
            {
                id: "entry-3",
                at: Date.now() - (3 * 60 * 60 * 1000),
                label: "Dungeon started: Damp Ruins",
            },
        ];

        const { container } = render(<ActionJournalModal actionJournal={entries} onClose={vi.fn()} />);

        expect(screen.getByRole("heading", { name: "Journal" })).toBeTruthy();
        expect(screen.getByText("Latest activity")).toBeTruthy();
        const countNode = container.querySelector(".ts-system-journal-count");
        expect(countNode?.textContent).toBe("3");

        expect(screen.getByText("Recipe")).toBeTruthy();
        expect(screen.getByText("Action")).toBeTruthy();
        expect(screen.getByText("Run Start")).toBeTruthy();
        expect(screen.getByText(`Tobin Frostmere \u2192 Hunting / Mountain Stag`)).toBeTruthy();
        expect(screen.getByText(`Nora Briar \u2192 Herbalism`)).toBeTruthy();
        expect(screen.getByText("Damp Ruins")).toBeTruthy();

        const valueNode = container.querySelector(".ts-system-journal-time-value");
        const suffixNode = container.querySelector(".ts-system-journal-time-suffix");
        expect(valueNode?.textContent).toBe("2");
        expect(suffixNode?.textContent).toBe("m ago");
    });
});
