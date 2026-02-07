import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";
import type { ActionJournalEntry } from "../../core/types";

type SystemModalProps = {
    version: string;
    lastTick: number | null;
    lastTickDurationMs: number;
    lastDeltaMs: number;
    lastDriftMs: number;
    driftEmaMs: number;
    driftLabel: string;
    lastOfflineTicks: number;
    lastOfflineDurationMs: number;
    tickRate: string;
    loopInterval: number;
    offlineInterval: number;
    virtualScore: number;
    activeActionLabel: string;
    actionJournal: ActionJournalEntry[];
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onOpenDevTools: () => void;
    onOpenLocalSave: () => void;
    onOpenCloudSave: () => void;
    onClose: () => void;
};

export const SystemModal = memo(({
    version,
    lastTick,
    lastTickDurationMs,
    lastDeltaMs,
    lastDriftMs,
    driftEmaMs,
    driftLabel,
    lastOfflineTicks,
    lastOfflineDurationMs,
    tickRate,
    loopInterval,
    offlineInterval,
    virtualScore,
    activeActionLabel,
    actionJournal,
    crashReports,
    onClearCrashReports,
    onOpenDevTools,
    onOpenLocalSave,
    onOpenCloudSave,
    onClose,
}: SystemModalProps) => {
    const formatMs = (value: number, options?: { decimals?: number; plus?: boolean }) => {
        const decimals = options?.decimals ?? 0;
        const plus = options?.plus ?? false;
        if (!Number.isFinite(value)) {
            return "0";
        }
        const factor = 10 ** decimals;
        const rounded = Math.round(value * factor) / factor;
        const sign = plus && rounded > 0 ? "+" : "";
        return decimals > 0 ? `${sign}${rounded.toFixed(decimals)}` : `${sign}${Math.round(rounded)}`;
    };

    const lastTickIso = lastTick !== null ? new Date(lastTick).toISOString() : null;
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

    return (
        <ModalShell kicker="System" title="Telemetry" onClose={onClose}>
            <ul className="ts-list">
                <li>v{version} • Action: {activeActionLabel} • Crashes: {crashReports.length}</li>
                <li>Virtual score: {virtualScore}</li>
                <li>
                    Tick: Δ{lastDeltaMs}ms • tick {lastTickDurationMs.toFixed(2)}ms • drift {driftLabel}ms (last{" "}
                    {formatMs(lastDriftMs, { plus: true })}ms, ema {formatMs(driftEmaMs, { decimals: 1 })}ms)
                </li>
                <li>
                    Loop: {loopInterval}ms ({tickRate}/s) • Offline: {offlineInterval}ms • Catch-up:{" "}
                    {lastOfflineTicks} / {lastOfflineDurationMs}ms
                </li>
                <li>
                    Last tick:{" "}
                    {lastTickIso ? (
                        <span title={String(lastTick)}>{lastTickIso}</span>
                    ) : (
                        "awaiting"
                    )}
                </li>
            </ul>
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
            <div className="ts-system-entry-list">
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={onOpenLocalSave}
                            data-testid="open-local-save"
                        >
                            Local save
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={onOpenCloudSave}
                            data-testid="open-cloud-save"
                        >
                            Cloud save
                        </button>
                    </div>
                    <span className="ts-system-helper">
                        Export, import, reset, or sync your save data.
                    </span>
                </div>
            </div>
            {import.meta.env.DEV ? (
                <div className="ts-action-row ts-system-actions">
                    <button
                        type="button"
                        className="generic-field button ts-devtools-button ts-focusable"
                        onClick={onOpenDevTools}
                    >
                        Dev tools
                    </button>
                </div>
            ) : null}
            {crashReports.length > 0 ? (
                <div className="ts-panel-body">
                    <ul className="ts-list ts-crash-list">
                        {crashReports.slice(0, 3).map((report) => (
                            <li key={report.id}>
                                [{report.kind}] {report.message}
                            </li>
                        ))}
                    </ul>
                    <div className="ts-action-row ts-system-actions ts-crash-actions">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={onClearCrashReports}
                        >
                            Clear crash reports
                        </button>
                    </div>
                </div>
            ) : null}
        </ModalShell>
    );
});

SystemModal.displayName = "SystemModal";
