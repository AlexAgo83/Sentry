import { memo, useState } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";
import {
    getRenderCountsSnapshot,
    PROFILER_ENABLE_KEY,
    RENDER_COUNTS_ENABLE_KEY,
    resetRenderCounts,
    isDebugEnabled,
    setDebugEnabled
} from "../dev/renderDebug";

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
}: SystemModalProps) => {
    const [isRenderCountsEnabled, setIsRenderCountsEnabled] = useState(() => (
        import.meta.env.DEV ? isDebugEnabled(RENDER_COUNTS_ENABLE_KEY) : false
    ));
    const [isProfilerEnabled, setIsProfilerEnabled] = useState(() => (
        import.meta.env.DEV ? isDebugEnabled(PROFILER_ENABLE_KEY) : false
    ));

    const handleToggleRenderCounts = () => {
        const next = !isRenderCountsEnabled;
        setDebugEnabled(RENDER_COUNTS_ENABLE_KEY, next);
        setIsRenderCountsEnabled(next);
    };

    const handleToggleProfiler = () => {
        const next = !isProfilerEnabled;
        setDebugEnabled(PROFILER_ENABLE_KEY, next);
        setIsProfilerEnabled(next);
    };

    const handlePrintRenderCounts = () => {
        console.debug("[renderCounts]", getRenderCountsSnapshot());
    };

    const handleResetRenderCounts = () => {
        resetRenderCounts();
        console.debug("[renderCounts] reset");
    };

    return (
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
            {import.meta.env.DEV ? (
                <div className="ts-panel-body">
                    <h3>Dev tools</h3>
                    <ul className="ts-list">
                        <li>renderCounts: {isRenderCountsEnabled ? "on" : "off"}</li>
                        <li>profiler: {isProfilerEnabled ? "on" : "off"}</li>
                    </ul>
                    <div className="ts-action-row ts-system-actions ts-action-stack ts-devtools-actions">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={handleToggleRenderCounts}
                        >
                            Toggle renderCounts
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={handlePrintRenderCounts}
                            disabled={!isRenderCountsEnabled}
                        >
                            Print renderCounts
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={handleResetRenderCounts}
                            disabled={!isRenderCountsEnabled}
                        >
                            Reset renderCounts
                        </button>
                    </div>
                    <div className="ts-action-row ts-system-actions">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={handleToggleProfiler}
                        >
                            Toggle profiler
                        </button>
                    </div>
                    <p>
                        localStorage keys: <code>{RENDER_COUNTS_ENABLE_KEY}</code> /{" "}
                        <code>{PROFILER_ENABLE_KEY}</code>
                    </p>
                </div>
            ) : null}
        </ModalShell>
    );
});

SystemModal.displayName = "SystemModal";
