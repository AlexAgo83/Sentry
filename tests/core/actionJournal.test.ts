import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/core/state";
import { appendActionJournalEntry } from "../../src/core/actionJournal";

describe("appendActionJournalEntry", () => {
    it("keeps the last 10 entries (newest first)", () => {
        let state = createInitialGameState("test", { seedHero: false });
        for (let i = 0; i < 12; i += 1) {
            state = appendActionJournalEntry(state, {
                id: `entry-${i}`,
                at: i,
                label: `Event ${i}`
            });
        }

        expect(state.actionJournal).toHaveLength(10);
        expect(state.actionJournal[0]?.id).toBe("entry-11");
        expect(state.actionJournal[9]?.id).toBe("entry-2");
    });
});
