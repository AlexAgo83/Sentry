import { memo, useEffect, useMemo, useState } from "react";
import { ModalShell } from "./ModalShell";
import { cloudClient } from "../api/cloudClient";

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
    crashCount: number;
    onClose: () => void;
    closeLabel?: string;
};

type TelemetryLevel = "healthy" | "warning" | "critical";
type TelemetryTone = TelemetryLevel | "neutral";
type BackendState = "disabled" | "checking" | "online" | "offline" | "degraded";

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

const resolveBackendBadge = (state: BackendState): { label: string; tone: TelemetryTone } => {
    if (state === "online") {
        return { label: "Online", tone: "healthy" };
    }
    if (state === "degraded") {
        return { label: "Degraded", tone: "warning" };
    }
    if (state === "offline") {
        return { label: "Offline", tone: "critical" };
    }
    if (state === "checking") {
        return { label: "Checking", tone: "neutral" };
    }
    return { label: "Disabled", tone: "neutral" };
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
    crashCount,
    onClose,
    closeLabel
}: TelemetryModalProps) => {
    const backendBase = useMemo(() => {
        const base = cloudClient.getApiBase()?.trim() ?? "";
        return base.replace(/\/+$/u, "");
    }, []);
    const [backendState, setBackendState] = useState<BackendState>(() => {
        if (!backendBase) {
            return "disabled";
        }
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
            return "offline";
        }
        return "checking";
    });
    const [backendLatencyMs, setBackendLatencyMs] = useState<number | null>(null);

    useEffect(() => {
        if (!backendBase || typeof fetch !== "function") {
            return;
        }
        let active = true;
        const healthUrl = `${backendBase}/health`;

        const probe = async () => {
            if (!active) {
                return;
            }
            if (typeof navigator !== "undefined" && navigator.onLine === false) {
                setBackendState("offline");
                setBackendLatencyMs(null);
                return;
            }
            setBackendState((current) => (current === "online" ? current : "checking"));
            try {
                const startedAt = Date.now();
                const response = await fetch(healthUrl, {
                    method: "GET",
                    credentials: "omit",
                    cache: "no-store"
                });
                if (!active) {
                    return;
                }
                const latencyMs = Math.max(0, Date.now() - startedAt);
                setBackendLatencyMs(latencyMs);
                if (response.ok) {
                    setBackendState("online");
                    return;
                }
                if (response.status >= 500) {
                    setBackendState("degraded");
                    return;
                }
                setBackendState("offline");
            } catch {
                if (active) {
                    setBackendState("offline");
                    setBackendLatencyMs(null);
                }
            }
        };

        const handleOnline = () => {
            void probe();
        };
        const handleOffline = () => {
            setBackendState("offline");
            setBackendLatencyMs(null);
        };

        void probe();
        const intervalId = window.setInterval(() => {
            void probe();
        }, 30_000);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [backendBase]);

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
    const backendBadge = resolveBackendBadge(backendState);
    const backendLatencyLabel = backendLatencyMs !== null ? `${backendLatencyMs}ms` : "--";
    const backendHealthLabel = backendBase ? `${backendBase}/health` : "Not configured";

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
                        <h3 className="ts-telemetry-card-title">Backend</h3>
                        <span className={`ts-telemetry-state is-${backendBadge.tone}`}>{backendBadge.label}</span>
                    </header>
                    <dl className="ts-telemetry-kv">
                        <div className="ts-telemetry-row"><dt>Response time</dt><dd>{backendLatencyLabel}</dd></div>
                        <div className="ts-telemetry-row"><dt>Health URL</dt><dd>{backendHealthLabel}</dd></div>
                    </dl>
                </section>

                <section className="ts-telemetry-card">
                    <header className="ts-telemetry-card-header">
                        <h3 className="ts-telemetry-card-title">Last Tick</h3>
                        <span className="ts-telemetry-state is-neutral">{lastTickIso ? "Received" : "Pending"}</span>
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
