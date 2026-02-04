import { useEffect } from "react";
import type { OfflineSummaryState } from "../../core/types";

type UseCloseOverlaysOnOfflineSummaryOptions = {
    offlineSummary: OfflineSummaryState | null;
    closeActionSelection: () => void;
    closeDungeonScreen: () => void;
    closeAllHeroNameModals: () => void;
    closeSystem: () => void;
    closeDevTools: () => void;
    closeLocalSave: () => void;
    closeCloudSave: () => void;
};

export const useCloseOverlaysOnOfflineSummary = ({
    offlineSummary,
    closeActionSelection,
    closeDungeonScreen,
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
        closeDungeonScreen();
        closeAllHeroNameModals();
        closeSystem();
        closeDevTools();
        closeLocalSave();
        closeCloudSave();
    }, [
        closeActionSelection,
        closeDungeonScreen,
        closeAllHeroNameModals,
        closeDevTools,
        closeSystem,
        closeLocalSave,
        closeCloudSave,
        offlineSummary
    ]);
};
