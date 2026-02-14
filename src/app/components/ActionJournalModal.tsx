import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { ActionJournalEntry } from "../../core/types";

type ActionJournalModalProps = {
    actionJournal: ActionJournalEntry[];
    onClose: () => void;
    closeLabel?: string;
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

const splitTimeAgoLabel = (value: string): { value: string; suffix: string } => {
    const match = value.match(/^(\d+)([mhd]\sago)$/u);
    if (!match) {
        return { value, suffix: "" };
    }
    return {
        value: match[1] ?? value,
        suffix: match[2] ?? ""
    };
};

type ActionJournalKind = "action" | "recipe" | "dungeon-start" | "dungeon-end" | "offline" | "event";

type ActionJournalMeta = {
    kind: ActionJournalKind;
    kindLabel: string;
    detail: string;
};

const formatJournalDetail = (detail: string): string => {
    return detail.replace(/->/g, "→");
};

const toIsoDate = (timestamp: number): string | undefined => {
    if (!Number.isFinite(timestamp)) {
        return undefined;
    }
    return new Date(timestamp).toISOString();
};

const parseJournalLabel = (label: string): ActionJournalMeta => {
    const trimmed = label.trim();
    if (trimmed.startsWith("Recipe:")) {
        return {
            kind: "recipe",
            kindLabel: "Recipe",
            detail: formatJournalDetail(trimmed.replace(/^Recipe:\s*/u, ""))
        };
    }
    if (trimmed.startsWith("Action:")) {
        return {
            kind: "action",
            kindLabel: "Action",
            detail: formatJournalDetail(trimmed.replace(/^Action:\s*/u, ""))
        };
    }
    if (trimmed.startsWith("Dungeon started:")) {
        return {
            kind: "dungeon-start",
            kindLabel: "Run Start",
            detail: trimmed.replace(/^Dungeon started:\s*/u, "")
        };
    }
    if (trimmed.startsWith("Dungeon ended:")) {
        return {
            kind: "dungeon-end",
            kindLabel: "Run End",
            detail: trimmed.replace(/^Dungeon ended:\s*/u, "")
        };
    }
    if (trimmed.startsWith("Offline summary:")) {
        return {
            kind: "offline",
            kindLabel: "Offline",
            detail: trimmed.replace(/^Offline summary:\s*/u, "")
        };
    }
    return {
        kind: "event",
        kindLabel: "Event",
        detail: formatJournalDetail(trimmed)
    };
};

export const ActionJournalModal = memo(({
    actionJournal,
    onClose,
    closeLabel,
}: ActionJournalModalProps) => (
    <ModalShell kicker="System" title="Journal" onClose={onClose} closeLabel={closeLabel}>
        <div className="ts-system-journal">
            <div className="ts-system-journal-header">
                <span>Latest activity</span>
                <span className="ts-system-journal-count">{actionJournal.length}</span>
            </div>
            {actionJournal.length > 0 ? (
                <ul className="ts-system-journal-list">
                    {actionJournal.map((entry) => {
                        const meta = parseJournalLabel(entry.label);
                        const timeAgo = formatTimeAgo(entry.at);
                        const timeParts = splitTimeAgoLabel(timeAgo);
                        return (
                            <li key={entry.id} className={`ts-system-journal-item is-${meta.kind}`}>
                                <span className="ts-system-journal-accent" aria-hidden="true" />
                                <div className="ts-system-journal-main">
                                    <span className={`ts-system-journal-kind is-${meta.kind}`}>{meta.kindLabel}</span>
                                    <span className="ts-system-journal-label">{meta.detail}</span>
                                </div>
                                <time className="ts-system-journal-time" dateTime={toIsoDate(entry.at)}>
                                    <span className="ts-system-journal-time-value">{timeParts.value}</span>
                                    <span className="ts-system-journal-time-suffix">{timeParts.suffix}</span>
                                </time>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <span className="ts-system-helper">No actions recorded yet.</span>
            )}
        </div>
    </ModalShell>
));

ActionJournalModal.displayName = "ActionJournalModal";
