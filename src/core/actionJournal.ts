import type { ActionJournalEntry, GameState } from "./types";

export const ACTION_JOURNAL_LIMIT = 20;

const isOfflineSummaryEntry = (entry: ActionJournalEntry | undefined) => {
    return Boolean(entry && entry.label.trim().startsWith("Offline summary:"));
};

export const appendActionJournalEntry = (
    state: GameState,
    entry: ActionJournalEntry
): GameState => {
    const currentEntries = state.actionJournal ?? [];
    const nextEntries = isOfflineSummaryEntry(entry) && isOfflineSummaryEntry(currentEntries[0])
        ? [entry, ...currentEntries.slice(1)]
        : [entry, ...currentEntries];

    return {
        ...state,
        actionJournal: nextEntries.slice(0, ACTION_JOURNAL_LIMIT)
    };
};
