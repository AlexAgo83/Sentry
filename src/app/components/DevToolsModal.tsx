import { memo, useState } from "react";
import { ModalShell } from "./ModalShell";
import {
    getRenderCountsSnapshot,
    PROFILER_ENABLE_KEY,
    RENDER_COUNTS_ENABLE_KEY,
    resetRenderCounts,
    isDebugEnabled,
    setDebugEnabled
} from "../dev/renderDebug";

type DevToolsModalProps = {
    onSimulateOffline: () => void;
    onSimulateOfflineHour: () => void;
    onSimulateOfflineDay: () => void;
    onClose: () => void;
};

export const DevToolsModal = memo(({
    onSimulateOffline,
    onSimulateOfflineHour,
    onSimulateOfflineDay,
    onClose
}: DevToolsModalProps) => {
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
        <ModalShell kicker="Dev" title="Dev tools" onClose={onClose}>
            <ul className="ts-list">
                <li>renderCounts: {isRenderCountsEnabled ? "on" : "off"}</li>
                <li>profiler: {isProfilerEnabled ? "on" : "off"}</li>
            </ul>
            <div className="ts-action-row ts-system-actions ts-devtools-actions">
                <button
                    type="button"
                    className="generic-field button ts-devtools-button ts-focusable"
                    onClick={onSimulateOffline}
                >
                    Simulate +30 min
                </button>
                <button
                    type="button"
                    className="generic-field button ts-devtools-button ts-focusable"
                    onClick={onSimulateOfflineHour}
                >
                    Simulate +1h
                </button>
                <button
                    type="button"
                    className="generic-field button ts-devtools-button ts-focusable"
                    onClick={onSimulateOfflineDay}
                >
                    Simulate +24h
                </button>
            </div>
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
                <button
                    type="button"
                    className="generic-field button ts-devtools-button ts-focusable"
                    onClick={handleToggleProfiler}
                >
                    Toggle profiler
                </button>
            </div>
            <p>
                localStorage keys: <code>{RENDER_COUNTS_ENABLE_KEY}</code> / <code>{PROFILER_ENABLE_KEY}</code>
            </p>
        </ModalShell>
    );
});

DevToolsModal.displayName = "DevToolsModal";
