import { useEffect } from "react";
import type { OfflineSummaryState } from "../../core/types";

type UseCloseOverlaysOnOfflineSummaryOptions = {
    offlineSummary: OfflineSummaryState | null;
    closeLoadout: () => void;
    closeAllHeroNameModals: () => void;
    closeSystem: () => void;
    closeDevTools: () => void;
};

export const useCloseOverlaysOnOfflineSummary = ({
    offlineSummary,
    closeLoadout,
    closeAllHeroNameModals,
    closeSystem,
    closeDevTools,
}: UseCloseOverlaysOnOfflineSummaryOptions) => {
    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        closeLoadout();
        closeAllHeroNameModals();
        closeSystem();
        closeDevTools();
    }, [closeAllHeroNameModals, closeDevTools, closeLoadout, closeSystem, offlineSummary]);
};
