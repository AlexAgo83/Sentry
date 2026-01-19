import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";

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
    lastDriftMs,
    driftEmaMs,
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

    return (
        <ModalShell kicker="System" title="Telemetry" onClose={onClose}>
            <ul className="ts-list">
                <li>v{version} • Action: {activeActionLabel} • Crashes: {crashReports.length}</li>
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
        </ModalShell>
    );
});

SystemModal.displayName = "SystemModal";
