import type { ActionJournalEntry, GameState } from "./types";

export const ACTION_JOURNAL_LIMIT = 10;

export const appendActionJournalEntry = (
    state: GameState,
    entry: ActionJournalEntry
): GameState => {
    const nextEntries = [entry, ...(state.actionJournal ?? [])].slice(0, ACTION_JOURNAL_LIMIT);
    return {
        ...state,
        actionJournal: nextEntries
    };
};
