import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";

type SystemModalProps = {
    version: string;
    lastTick: number | null;
    lastTickDurationMs: number;
    lastDeltaMs: number;
    driftLabel: string;
    lastOfflineTicks: number;
    lastOfflineDurationMs: number;
    tickRate: string;
    loopInterval: number;
    offlineInterval: number;
    activeActionLabel: string;
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onSimulateOffline: () => void;
    onResetSave: () => void;
    onClose: () => void;
};

export const SystemModal = memo(({
    version,
    lastTick,
    lastTickDurationMs,
    lastDeltaMs,
    driftLabel,
    lastOfflineTicks,
    lastOfflineDurationMs,
    tickRate,
    loopInterval,
    offlineInterval,
    activeActionLabel,
    crashReports,
    onClearCrashReports,
    onExportSave,
    onImportSave,
    onSimulateOffline,
    onResetSave,
    onClose
}: SystemModalProps) => (
    <ModalShell kicker="System" title="Telemetry" onClose={onClose}>
        <ul className="ts-list">
            <li>Version: {version}</li>
            <li>Last tick: {lastTick ?? "awaiting"}</li>
            <li>Tick duration: {lastTickDurationMs.toFixed(2)}ms</li>
            <li>Last delta: {lastDeltaMs}ms (drift {driftLabel}ms)</li>
            <li>Offline catch-up: {lastOfflineTicks} ticks / {lastOfflineDurationMs}ms</li>
            <li>Expected tick rate: {tickRate}/s</li>
            <li>Loop interval: {loopInterval}ms</li>
            <li>Offline interval: {offlineInterval}ms</li>
            <li>Active action: {activeActionLabel}</li>
            <li>Crash reports: {crashReports.length}</li>
        </ul>
        {crashReports.length > 0 ? (
            <div className="ts-panel-body">
                <ul className="ts-list">
                    {crashReports.slice(0, 3).map((report) => (
                        <li key={report.id}>
                            [{report.kind}] {report.message}
                        </li>
                    ))}
                </ul>
                <div className="ts-action-row ts-system-actions">
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onClearCrashReports}
                    >
                        Clear crash reports
                    </button>
                </div>
            </div>
        ) : null}
        <div className="ts-action-row ts-system-actions">
            <button
                type="button"
                className="generic-field button ts-simulate ts-focusable"
                onClick={onSimulateOffline}
            >
                Simulate +30 min
            </button>
        </div>
        <div className="ts-action-row ts-system-actions">
            <button
                type="button"
                className="generic-field button ts-focusable"
                onClick={onExportSave}
            >
                Export save
            </button>
            <button
                type="button"
                className="generic-field button ts-focusable"
                onClick={onImportSave}
            >
                Import save
            </button>
        </div>
        <div className="ts-action-row ts-system-actions">
            <button
                type="button"
                className="generic-field button ts-reset ts-focusable"
                onClick={onResetSave}
            >
                Reset save
            </button>
        </div>
    </ModalShell>
));

SystemModal.displayName = "SystemModal";
