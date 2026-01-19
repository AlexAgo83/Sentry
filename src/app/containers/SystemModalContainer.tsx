import type { CrashReport } from "../../observability/crashReporter";
import type { SkillId } from "../../core/types";
import { SystemModal } from "../components/SystemModal";
import { useGameStore } from "../hooks/useGameStore";
import { selectActivePlayer } from "../selectors/gameSelectors";

export interface SystemModalContainerProps {
    version: string;
    getSkillLabel: (skillId: SkillId | "") => string;
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onSimulateOffline: () => void;
    onResetSave: () => void;
    onClose: () => void;
}

export const SystemModalContainer = (props: SystemModalContainerProps) => {
    const perf = useGameStore((state) => state.perf);
    const loop = useGameStore((state) => state.loop);
    const activePlayer = useGameStore(selectActivePlayer);

    const tickRate = (1000 / loop.loopInterval).toFixed(1);
    const hasDelta = perf.lastDeltaMs > 0;
    const driftMs = hasDelta ? perf.lastDeltaMs - loop.loopInterval : 0;
    const driftLabel = `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;

    return (
        <SystemModal
            version={props.version}
            lastTick={loop.lastTick}
            lastTickDurationMs={perf.lastTickDurationMs}
            lastDeltaMs={perf.lastDeltaMs}
            driftLabel={driftLabel}
            lastOfflineTicks={perf.lastOfflineTicks}
            lastOfflineDurationMs={perf.lastOfflineDurationMs}
            tickRate={tickRate}
            loopInterval={loop.loopInterval}
            offlineInterval={loop.offlineInterval}
            activeActionLabel={activePlayer?.selectedActionId
                ? props.getSkillLabel(activePlayer.selectedActionId as SkillId)
                : "none"}
            crashReports={props.crashReports}
            onClearCrashReports={props.onClearCrashReports}
            onExportSave={props.onExportSave}
            onImportSave={props.onImportSave}
            onSimulateOffline={props.onSimulateOffline}
            onResetSave={props.onResetSave}
            onClose={props.onClose}
        />
    );
};

