import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { ActionJournalEntry } from "../../core/types";

type ActionJournalModalProps = {
    actionJournal: ActionJournalEntry[];
    onClose: () => void;
};

const formatTimeAgo = (timestamp: number): string => {
    const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }
    if (diffMinutes < 1440) {
        return `${Math.round(diffMinutes / 60)}h ago`;
    }
    return `${Math.round(diffMinutes / 1440)}d ago`;
};

export const ActionJournalModal = memo(({
    actionJournal,
    onClose,
}: ActionJournalModalProps) => (
    <ModalShell kicker="System" title="Action journal" onClose={onClose}>
        <div className="ts-system-journal">
            <div className="ts-system-journal-header">Action journal</div>
            {actionJournal.length > 0 ? (
                <ul className="ts-system-journal-list">
                    {actionJournal.map((entry) => (
                        <li key={entry.id} className="ts-system-journal-item">
                            <span className="ts-system-journal-label">{entry.label}</span>
                            <span className="ts-system-journal-time">{formatTimeAgo(entry.at)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="ts-system-helper">No actions recorded yet.</span>
            )}
        </div>
    </ModalShell>
));

ActionJournalModal.displayName = "ActionJournalModal";
