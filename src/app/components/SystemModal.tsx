import { memo } from "react";
import { ModalShell } from "./ModalShell";

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
                className="generic-field button ts-reset ts-focusable"
                onClick={onResetSave}
            >
                Reset save
            </button>
        </div>
    </ModalShell>
));

SystemModal.displayName = "SystemModal";
