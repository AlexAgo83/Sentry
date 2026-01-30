import { useEffect } from "react";
import type { OfflineSummaryState } from "../../core/types";

type UseCloseOverlaysOnOfflineSummaryOptions = {
    offlineSummary: OfflineSummaryState | null;
    closeActionSelection: () => void;
    closeAllHeroNameModals: () => void;
    closeSystem: () => void;
    closeDevTools: () => void;
    closeLocalSave: () => void;
    closeCloudSave: () => void;
};

export const useCloseOverlaysOnOfflineSummary = ({
    offlineSummary,
    closeActionSelection,
    closeAllHeroNameModals,
    closeSystem,
    closeDevTools,
    closeLocalSave,
    closeCloudSave,
}: UseCloseOverlaysOnOfflineSummaryOptions) => {
    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        closeActionSelection();
        closeAllHeroNameModals();
        closeSystem();
        closeDevTools();
        closeLocalSave();
        closeCloudSave();
    }, [
        closeActionSelection,
        closeAllHeroNameModals,
        closeDevTools,
        closeSystem,
        closeLocalSave,
        closeCloudSave,
        offlineSummary
    ]);
};
