import { useEffect } from "react";
import type { OfflineSummaryState } from "../../core/types";

type UseCloseOverlaysOnOfflineSummaryOptions = {
    offlineSummary: OfflineSummaryState | null;
    closeActionSelection: () => void;
    closeAllHeroNameModals: () => void;
    closeSystem: () => void;
    closeDevTools: () => void;
};

export const useCloseOverlaysOnOfflineSummary = ({
    offlineSummary,
    closeActionSelection,
    closeAllHeroNameModals,
    closeSystem,
    closeDevTools,
}: UseCloseOverlaysOnOfflineSummaryOptions) => {
    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        closeActionSelection();
        closeAllHeroNameModals();
        closeSystem();
        closeDevTools();
    }, [closeActionSelection, closeAllHeroNameModals, closeDevTools, closeSystem, offlineSummary]);
};
