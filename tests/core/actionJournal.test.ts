import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/core/state";
import { ACTION_JOURNAL_LIMIT, appendActionJournalEntry } from "../../src/core/actionJournal";

describe("appendActionJournalEntry", () => {
    it("keeps the latest entries (newest first) up to the configured limit", () => {
        let state = createInitialGameState("test", { seedHero: false });
        for (let i = 0; i < ACTION_JOURNAL_LIMIT + 2; i += 1) {
            state = appendActionJournalEntry(state, {
                id: `entry-${i}`,
                at: i,
                label: `Event ${i}`
            });
        }

        expect(state.actionJournal).toHaveLength(ACTION_JOURNAL_LIMIT);
        expect(state.actionJournal[0]?.id).toBe(`entry-${ACTION_JOURNAL_LIMIT + 1}`);
        expect(state.actionJournal[ACTION_JOURNAL_LIMIT - 1]?.id).toBe("entry-2");
    });

    it("replaces latest entry when consecutive offline summaries are appended", () => {
        let state = createInitialGameState("test", { seedHero: false });
        state = appendActionJournalEntry(state, {
            id: "offline-1",
            at: 1,
            label: "Offline summary: 12m"
        });
        state = appendActionJournalEntry(state, {
            id: "offline-2",
            at: 2,
            label: "Offline summary: 42m"
        });

        expect(state.actionJournal).toHaveLength(1);
        expect(state.actionJournal[0]?.id).toBe("offline-2");
        expect(state.actionJournal[0]?.label).toBe("Offline summary: 42m");
    });
});
