import { useMemo } from "react";
import type { CrashReport } from "../../observability/crashReporter";
import type { SkillId } from "../../core/types";
import { SystemModal } from "../components/SystemModal";
import { useGameStore } from "../hooks/useGameStore";
import { selectActivePlayer, selectVirtualScore } from "../selectors/gameSelectors";

export interface SystemModalContainerProps {
    version: string;
    getSkillLabel: (skillId: SkillId | "") => string;
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onOpenDevTools: () => void;
    onOpenLocalSave: () => void;
    onOpenCloudSave: () => void;
    onClose: () => void;
}

export const SystemModalContainer = (props: SystemModalContainerProps) => {
    const perf = useGameStore((state) => state.perf);
    const loop = useGameStore((state) => state.loop);
    const activePlayer = useGameStore(selectActivePlayer);
    const virtualScore = useGameStore(selectVirtualScore);
    const actionJournal = useGameStore((state) => state.actionJournal);

    const tickRate = (1000 / loop.loopInterval).toFixed(1);
    const driftLabel = useMemo(() => {
        const driftMs = Number.isFinite(perf.driftEmaMs) ? perf.driftEmaMs : perf.lastDriftMs;
        return `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;
    }, [perf.driftEmaMs, perf.lastDriftMs]);

    return (
        <SystemModal
            version={props.version}
            lastTick={loop.lastTick}
            lastTickDurationMs={perf.lastTickDurationMs}
            lastDeltaMs={perf.lastDeltaMs}
            lastDriftMs={perf.lastDriftMs}
            driftEmaMs={perf.driftEmaMs}
            driftLabel={driftLabel}
            lastOfflineTicks={perf.lastOfflineTicks}
            lastOfflineDurationMs={perf.lastOfflineDurationMs}
            tickRate={tickRate}
            loopInterval={loop.loopInterval}
            offlineInterval={loop.offlineInterval}
            virtualScore={virtualScore}
            activeActionLabel={activePlayer?.selectedActionId
                ? props.getSkillLabel(activePlayer.selectedActionId as SkillId)
                : "none"}
            actionJournal={actionJournal}
            crashReports={props.crashReports}
            onClearCrashReports={props.onClearCrashReports}
            onOpenDevTools={props.onOpenDevTools}
            onOpenLocalSave={props.onOpenLocalSave}
            onOpenCloudSave={props.onOpenCloudSave}
            onClose={props.onClose}
        />
    );
};
