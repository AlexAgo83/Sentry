import { lazy, memo, Suspense, useState } from "react";
import { ModalShell } from "./ModalShell";
import type { CrashReport } from "../../observability/crashReporter";
import type { ActionJournalEntry } from "../../core/types";
import type { SaveCopyResult } from "../hooks/useSaveManagement";

const LazyActionJournalModal = lazy(async () => {
    const mod = await import("./ActionJournalModal");
    return { default: mod.ActionJournalModal };
});

const LazyCloudSaveModal = lazy(async () => {
    const mod = await import("./CloudSaveModal");
    return { default: mod.CloudSaveModal };
});

const LazyChangelogsModal = lazy(async () => {
    const mod = await import("./ChangelogsModal");
    return { default: mod.ChangelogsModal };
});

const LazyCrashReportsModal = lazy(async () => {
    const mod = await import("./CrashReportsModal");
    return { default: mod.CrashReportsModal };
});

const LazyDevToolsModal = lazy(async () => {
    const mod = await import("./DevToolsModal");
    return { default: mod.DevToolsModal };
});

const LazyGraphicsModal = lazy(async () => {
    const mod = await import("./GraphicsModal");
    return { default: mod.GraphicsModal };
});

const LazyLeaderboardModal = lazy(async () => {
    const mod = await import("./LeaderboardModal");
    return { default: mod.LeaderboardModal };
});

const LazyLocalSaveModal = lazy(async () => {
    const mod = await import("./LocalSaveModal");
    return { default: mod.LocalSaveModal };
});

const LazySaveOptionsModal = lazy(async () => {
    const mod = await import("./SaveOptionsModal");
    return { default: mod.SaveOptionsModal };
});

const LazyTelemetryModal = lazy(async () => {
    const mod = await import("./TelemetryModal");
    return { default: mod.TelemetryModal };
});

type SystemModalView =
    | "settings"
    | "actionJournal"
    | "telemetry"
    | "graphics"
    | "saveOptions"
    | "localSave"
    | "cloudSave"
    | "leaderboard"
    | "changelogs"
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

    const loadingFallback = (
        <ModalShell kicker={`System - v${version}`} title="Loading" onClose={closeCurrentView} closeLabel="Back">
            <p className="ts-system-helper">Loading...</p>
        </ModalShell>
    );

    if (currentView === "actionJournal") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyActionJournalModal
                    actionJournal={actionJournal}
                    onClose={closeCurrentView}
                    closeLabel="Back"
                />
            </Suspense>
        );
    }

    if (currentView === "telemetry") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyTelemetryModal
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
            </Suspense>
        );
    }

    if (currentView === "graphics") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyGraphicsModal onClose={closeCurrentView} closeLabel="Back" />
            </Suspense>
        );
    }

    if (currentView === "saveOptions") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazySaveOptionsModal
                    onOpenLocalSave={() => openView("localSave")}
                    onOpenCloudSave={() => openView("cloudSave")}
                    onClose={closeCurrentView}
                    closeLabel="Back"
                />
            </Suspense>
        );
    }

    if (currentView === "localSave") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyLocalSaveModal
                    onExportSave={onExportSave}
                    onImportSave={onImportSave}
                    onResetSave={onResetSave}
                    onClose={closeCurrentView}
                    closeLabel="Back"
                />
            </Suspense>
        );
    }

    if (currentView === "cloudSave") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyCloudSaveModal onClose={closeCurrentView} closeLabel="Back" />
            </Suspense>
        );
    }

    if (currentView === "leaderboard") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyLeaderboardModal onClose={closeCurrentView} closeLabel="Back" />
            </Suspense>
        );
    }

    if (currentView === "changelogs") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyChangelogsModal onClose={closeCurrentView} closeLabel="Back" />
            </Suspense>
        );
    }

    if (currentView === "crashReports") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyCrashReportsModal
                    crashReports={crashReports}
                    onClearCrashReports={onClearCrashReports}
                    onClose={closeCurrentView}
                    closeLabel="Back"
                />
            </Suspense>
        );
    }

    if (currentView === "devTools") {
        return (
            <Suspense fallback={loadingFallback}>
                <LazyDevToolsModal
                    onClose={closeCurrentView}
                    onSimulateOffline={onSimulateOffline}
                    onSimulateOfflineHour={onSimulateOfflineHour}
                    onSimulateOfflineDay={onSimulateOfflineDay}
                    closeLabel="Back"
                />
            </Suspense>
        );
    }

    return (
        <ModalShell kicker={`System - v${version}`} title="Settings" onClose={onClose}>
            <div className="ts-system-entry-list">
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => openView("actionJournal")}
                            data-testid="open-action-journal"
                            title="Action journal"
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
                            title="Telemetry"
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
                            title="Graphics"
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
                            title="Save options"
                        >
                            Save options
                        </button>
                    </div>
                </div>
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => openView("leaderboard")}
                            data-testid="open-leaderboard"
                            title="Leaderboard"
                        >
                            Leaderboard
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
                                title="Crash reports"
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
                                title="Dev tools"
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
                            onClick={() => openView("changelogs")}
                            data-testid="open-changelogs"
                            title="Changelogs"
                        >
                            Changelogs
                        </button>
                    </div>
                </div>
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => window.open("https://github.com/AlexAgo83/Sentry", "_blank", "noopener,noreferrer")}
                            data-testid="open-about-link"
                            title="About"
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
