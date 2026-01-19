import { useEffect } from "react";
import type { OfflineSummaryState } from "../../core/types";

type UseCloseOverlaysOnOfflineSummaryOptions = {
    offlineSummary: OfflineSummaryState | null;
    closeLoadout: () => void;
    closeAllHeroNameModals: () => void;
    closeSystem: () => void;
};

export const useCloseOverlaysOnOfflineSummary = ({
    offlineSummary,
    closeLoadout,
    closeAllHeroNameModals,
    closeSystem,
}: UseCloseOverlaysOnOfflineSummaryOptions) => {
    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        closeLoadout();
        closeAllHeroNameModals();
        closeSystem();
    }, [closeAllHeroNameModals, closeLoadout, closeSystem, offlineSummary]);
};

