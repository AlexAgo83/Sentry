import { memo } from "react";
import { ModalShell } from "./ModalShell";

type TelemetryModalProps = {
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
    crashCount: number;
    onClose: () => void;
};

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

export const TelemetryModal = memo(({
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
    crashCount,
    onClose,
}: TelemetryModalProps) => {
    const lastTickIso = lastTick !== null ? new Date(lastTick).toISOString() : null;

    return (
        <ModalShell kicker="System" title="Telemetry" onClose={onClose}>
            <p className="ts-system-helper">Runtime loop, performance drift, and score diagnostics.</p>
            <ul className="ts-list">
                <li>v{version} • Action: {activeActionLabel} • Crashes: {crashCount}</li>
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
        </ModalShell>
    );
});

TelemetryModal.displayName = "TelemetryModal";
