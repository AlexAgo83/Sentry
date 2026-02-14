import { memo, useState } from "react";
import { ActionJournalModal } from "./ActionJournalModal";
import { CloudSaveModal } from "./CloudSaveModal";
import { CrashReportsModal } from "./CrashReportsModal";
import { DevToolsModal } from "./DevToolsModal";
import { GraphicsModal } from "./GraphicsModal";
import { LocalSaveModal } from "./LocalSaveModal";
import { ModalShell } from "./ModalShell";
import { SaveOptionsModal } from "./SaveOptionsModal";
import { TelemetryModal } from "./TelemetryModal";
import type { CrashReport } from "../../observability/crashReporter";
import type { ActionJournalEntry } from "../../core/types";
import type { SaveCopyResult } from "../hooks/useSaveManagement";

type SystemModalView =
    | "settings"
    | "actionJournal"
    | "telemetry"
    | "graphics"
    | "saveOptions"
    | "localSave"
    | "cloudSave"
    | "crashReports"
    | "devTools";

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
    actionJournal: ActionJournalEntry[];
    crashReports: CrashReport[];
    onExportSave: () => void | Promise<SaveCopyResult>;
    onImportSave: () => void;
    onResetSave: () => void;
    onSimulateOffline: () => void;
    onSimulateOfflineHour: () => void;
    onSimulateOfflineDay: () => void;
    onClearCrashReports: () => void;
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
    actionJournal,
    crashReports,
    onExportSave,
    onImportSave,
    onResetSave,
    onSimulateOffline,
    onSimulateOfflineHour,
    onSimulateOfflineDay,
    onClearCrashReports,
    onClose,
}: SystemModalProps) => {
    const [viewStack, setViewStack] = useState<SystemModalView[]>(["settings"]);
    const currentView = viewStack[viewStack.length - 1] ?? "settings";

    const openView = (view: SystemModalView) => {
        setViewStack((prev) => [...prev, view]);
    };

    const closeCurrentView = () => {
        setViewStack((prev) => {
            if (prev.length <= 1) {
                onClose();
                return prev;
            }
            return prev.slice(0, -1);
        });
    };

    if (currentView === "actionJournal") {
        return (
            <ActionJournalModal
                actionJournal={actionJournal}
                onClose={closeCurrentView}
                closeLabel="Back"
            />
        );
    }

    if (currentView === "telemetry") {
        return (
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
                crashCount={crashReports.length}
                onClose={closeCurrentView}
                closeLabel="Back"
            />
        );
    }

    if (currentView === "graphics") {
        return <GraphicsModal onClose={closeCurrentView} closeLabel="Back" />;
    }

    if (currentView === "saveOptions") {
        return (
            <SaveOptionsModal
                onOpenLocalSave={() => openView("localSave")}
                onOpenCloudSave={() => openView("cloudSave")}
                onClose={closeCurrentView}
                closeLabel="Back"
            />
        );
    }

    if (currentView === "localSave") {
        return (
            <LocalSaveModal
                onExportSave={onExportSave}
                onImportSave={onImportSave}
                onResetSave={onResetSave}
                onClose={closeCurrentView}
                closeLabel="Back"
            />
        );
    }

    if (currentView === "cloudSave") {
        return <CloudSaveModal onClose={closeCurrentView} closeLabel="Back" />;
    }

    if (currentView === "crashReports") {
        return (
            <CrashReportsModal
                crashReports={crashReports}
                onClearCrashReports={onClearCrashReports}
                onClose={closeCurrentView}
                closeLabel="Back"
            />
        );
    }

    if (currentView === "devTools") {
        return (
            <DevToolsModal
                onClose={closeCurrentView}
                onSimulateOffline={onSimulateOffline}
                onSimulateOfflineHour={onSimulateOfflineHour}
                onSimulateOfflineDay={onSimulateOfflineDay}
                closeLabel="Back"
            />
        );
    }

    return (
        <ModalShell kicker="System" title="Settings" onClose={onClose}>
            <div className="ts-system-entry-list">
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => openView("actionJournal")}
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
                            onClick={() => openView("telemetry")}
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
                            onClick={() => openView("graphics")}
                            data-testid="open-graphics"
                        >
                            Graphics
                        </button>
                    </div>
                </div>
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => openView("saveOptions")}
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
                                onClick={() => openView("crashReports")}
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
                                onClick={() => openView("devTools")}
                            >
                                Dev tools
                            </button>
                        </div>
                    </div>
                ) : null}
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => window.open("https://github.com/AlexAgo83/Sentry", "_blank", "noopener,noreferrer")}
                            data-testid="open-about-link"
                        >
                            About
                        </button>
                    </div>
                </div>
            </div>
        </ModalShell>
    );
});

SystemModal.displayName = "SystemModal";
