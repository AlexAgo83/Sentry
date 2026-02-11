import { memo, useState } from "react";
import { ActionJournalModal } from "./ActionJournalModal";
import { CrashReportsModal } from "./CrashReportsModal";
import { ModalShell } from "./ModalShell";
import { SaveOptionsModal } from "./SaveOptionsModal";
import { TelemetryModal } from "./TelemetryModal";
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
    const [isActionJournalOpen, setActionJournalOpen] = useState(false);
    const [isCrashReportsOpen, setCrashReportsOpen] = useState(false);
    const [isTelemetryOpen, setTelemetryOpen] = useState(false);
    const [isSaveOptionsOpen, setSaveOptionsOpen] = useState(false);

    return (
        <>
            <ModalShell kicker="System" title="Settings" onClose={onClose}>
                <div className="ts-system-entry-list">
                    <div className="ts-system-entry">
                        <div className="ts-action-row">
                            <button
                                type="button"
                                className="generic-field button ts-devtools-button ts-focusable"
                                onClick={() => setActionJournalOpen(true)}
                                data-testid="open-action-journal"
                            >
                                Action journal
                            </button>
                        </div>
                    </div>
                    <div className="ts-system-entry">
                        <div className="ts-action-row">
                            <button
                                type="button"
                                className="generic-field button ts-devtools-button ts-focusable"
                                onClick={() => setTelemetryOpen(true)}
                                data-testid="open-telemetry"
                            >
                                Telemetry
                            </button>
                        </div>
                    </div>
                    <div className="ts-system-entry">
                        <div className="ts-action-row">
                            <button
                                type="button"
                                className="generic-field button ts-devtools-button ts-focusable"
                                onClick={() => setSaveOptionsOpen(true)}
                                data-testid="open-save-options"
                            >
                                Save options
                            </button>
                        </div>
                    </div>
                    {crashReports.length > 0 ? (
                        <div className="ts-system-entry">
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-devtools-button ts-focusable"
                                    onClick={() => setCrashReportsOpen(true)}
                                    data-testid="open-crash-reports"
                                >
                                    Crash reports
                                </button>
                            </div>
                        </div>
                    ) : null}
                    {import.meta.env.DEV ? (
                        <div className="ts-system-entry">
                            <div className="ts-action-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-devtools-button ts-focusable"
                                    onClick={onOpenDevTools}
                                >
                                    Dev tools
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </ModalShell>
            {isTelemetryOpen ? (
                <TelemetryModal
                    version={version}
                    lastTick={lastTick}
                    lastTickDurationMs={lastTickDurationMs}
                    lastDeltaMs={lastDeltaMs}
                    lastDriftMs={lastDriftMs}
                    driftEmaMs={driftEmaMs}
                    driftLabel={driftLabel}
                    lastOfflineTicks={lastOfflineTicks}
                    lastOfflineDurationMs={lastOfflineDurationMs}
                    tickRate={tickRate}
                    loopInterval={loopInterval}
                    offlineInterval={offlineInterval}
                    virtualScore={virtualScore}
                    activeActionLabel={activeActionLabel}
                    crashCount={crashReports.length}
                    onClose={() => setTelemetryOpen(false)}
                />
            ) : null}
            {isActionJournalOpen ? (
                <ActionJournalModal
                    actionJournal={actionJournal}
                    onClose={() => setActionJournalOpen(false)}
                />
            ) : null}
            {isCrashReportsOpen ? (
                <CrashReportsModal
                    crashReports={crashReports}
                    onClearCrashReports={onClearCrashReports}
                    onClose={() => setCrashReportsOpen(false)}
                />
            ) : null}
            {isSaveOptionsOpen ? (
                <SaveOptionsModal
                    onOpenLocalSave={onOpenLocalSave}
                    onOpenCloudSave={onOpenCloudSave}
                    onClose={() => setSaveOptionsOpen(false)}
                />
            ) : null}
        </>
    );
});

SystemModal.displayName = "SystemModal";
