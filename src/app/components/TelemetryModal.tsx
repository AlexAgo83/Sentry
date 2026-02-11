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
    closeLabel?: string;
};

type TelemetryLevel = "healthy" | "warning" | "critical";

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

const formatPercent = (value: number, decimals = 1): string => {
    if (!Number.isFinite(value)) {
        return "0%";
    }
    const factor = 10 ** decimals;
    const rounded = Math.round(value * factor) / factor;
    return `${rounded.toFixed(decimals)}%`;
};

const resolveLevelLabel = (level: TelemetryLevel): string => {
    if (level === "critical") {
        return "Critical";
    }
    if (level === "warning") {
        return "Warning";
    }
    return "Healthy";
};

const formatRelativeTime = (timestamp: number | null): string => {
    if (timestamp === null) {
        return "awaiting";
    }
    const diffMs = Math.max(0, Date.now() - timestamp);
    if (diffMs < 1000) {
        return `${Math.round(diffMs)}ms ago`;
    }
    const seconds = diffMs / 1000;
    if (seconds < 60) {
        const decimals = seconds < 10 ? 1 : 0;
        return `${seconds.toFixed(decimals)}s ago`;
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
        return `${Math.round(minutes)}m ago`;
    }
    const hours = minutes / 60;
    if (hours < 24) {
        return `${hours.toFixed(1)}h ago`;
    }
    const days = hours / 24;
    return `${days.toFixed(1)}d ago`;
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
    closeLabel
}: TelemetryModalProps) => {
    const lastTickIso = lastTick !== null ? new Date(lastTick).toISOString() : null;
    const tickBudgetMs = Math.max(1, loopInterval);
    const tickBudgetUsage = (lastTickDurationMs / tickBudgetMs) * 100;
    const driftAbs = Math.abs(Number.isFinite(driftEmaMs) ? driftEmaMs : lastDriftMs);
    const catchUpBurst = lastOfflineTicks > 0 || lastOfflineDurationMs > 0;

    const crashLevel: TelemetryLevel = crashCount >= 3 ? "critical" : crashCount > 0 ? "warning" : "healthy";
    const tickLevel: TelemetryLevel = tickBudgetUsage >= 80 ? "critical" : tickBudgetUsage >= 35 ? "warning" : "healthy";
    const driftLevel: TelemetryLevel = driftAbs >= 12 ? "critical" : driftAbs >= 4 ? "warning" : "healthy";
    const catchUpLevel: TelemetryLevel = lastOfflineDurationMs >= 5000 ? "critical" : catchUpBurst ? "warning" : "healthy";
    const relativeTick = formatRelativeTime(lastTick);

    return (
        <ModalShell kicker="System" title="Telemetry" onClose={onClose} closeLabel={closeLabel}>
            <p className="ts-system-helper">Runtime loop, performance drift, and score diagnostics.</p>
            <div className="ts-telemetry-grid">
                <section className="ts-telemetry-card">
                    <header className="ts-telemetry-card-header">
                        <h3 className="ts-telemetry-card-title">Overview</h3>
                        <span className={`ts-telemetry-state is-${crashLevel}`}>{resolveLevelLabel(crashLevel)}</span>
                    </header>
                    <dl className="ts-telemetry-kv">
                        <div className="ts-telemetry-row"><dt>Version</dt><dd>v{version}</dd></div>
                        <div className="ts-telemetry-row"><dt>Action</dt><dd>{activeActionLabel}</dd></div>
                        <div className="ts-telemetry-row"><dt>Crashes</dt><dd>{crashCount}</dd></div>
                        <div className="ts-telemetry-row"><dt>Virtual score</dt><dd>{virtualScore}</dd></div>
                    </dl>
                </section>

                <section className="ts-telemetry-card">
                    <header className="ts-telemetry-card-header">
                        <h3 className="ts-telemetry-card-title">Tick</h3>
                        <span className={`ts-telemetry-state is-${tickLevel}`}>{resolveLevelLabel(tickLevel)}</span>
                    </header>
                    <dl className="ts-telemetry-kv">
                        <div className="ts-telemetry-row"><dt>Delta</dt><dd>{lastDeltaMs}ms</dd></div>
                        <div className="ts-telemetry-row"><dt>Tick cost</dt><dd>{lastTickDurationMs.toFixed(2)}ms</dd></div>
                        <div className="ts-telemetry-row"><dt>Budget use</dt><dd>{formatPercent(tickBudgetUsage)} of {tickBudgetMs}ms</dd></div>
                    </dl>
                </section>

                <section className="ts-telemetry-card">
                    <header className="ts-telemetry-card-header">
                        <h3 className="ts-telemetry-card-title">Drift</h3>
                        <span className={`ts-telemetry-state is-${driftLevel}`}>{resolveLevelLabel(driftLevel)}</span>
                    </header>
                    <dl className="ts-telemetry-kv">
                        <div className="ts-telemetry-row"><dt>Current</dt><dd>{driftLabel}ms</dd></div>
                        <div className="ts-telemetry-row"><dt>Last</dt><dd>{formatMs(lastDriftMs, { plus: true })}ms</dd></div>
                        <div className="ts-telemetry-row"><dt>EMA</dt><dd>{formatMs(driftEmaMs, { decimals: 1 })}ms</dd></div>
                    </dl>
                </section>

                <section className="ts-telemetry-card">
                    <header className="ts-telemetry-card-header">
                        <h3 className="ts-telemetry-card-title">Loop</h3>
                        <span className={`ts-telemetry-state is-${catchUpLevel}`}>{resolveLevelLabel(catchUpLevel)}</span>
                    </header>
                    <dl className="ts-telemetry-kv">
                        <div className="ts-telemetry-row"><dt>Loop interval</dt><dd>{loopInterval}ms ({tickRate}/s)</dd></div>
                        <div className="ts-telemetry-row"><dt>Offline interval</dt><dd>{offlineInterval}ms</dd></div>
                        <div className="ts-telemetry-row"><dt>Catch-up</dt><dd>{lastOfflineTicks} ticks / {lastOfflineDurationMs}ms</dd></div>
                    </dl>
                </section>

                <section className="ts-telemetry-card">
                    <header className="ts-telemetry-card-header">
                        <h3 className="ts-telemetry-card-title">Last Tick</h3>
                        <span className="ts-telemetry-state is-neutral">{lastTickIso ? "Online" : "Pending"}</span>
                    </header>
                    <dl className="ts-telemetry-kv">
                        <div className="ts-telemetry-row"><dt>Relative</dt><dd>{relativeTick}</dd></div>
                        <div className="ts-telemetry-row">
                            <dt>Timestamp</dt>
                            <dd>
                                {lastTickIso ? (
                                    <span title={String(lastTick)}>{lastTickIso}</span>
                                ) : (
                                    "awaiting"
                                )}
                            </dd>
                        </div>
                    </dl>
                </section>
            </div>
        </ModalShell>
    );
});

TelemetryModal.displayName = "TelemetryModal";
