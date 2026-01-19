import { useCallback, useState } from "react";
import type { AppActiveSidePanel } from "../AppView";

export const useAppShellUi = () => {
    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isLoadoutOpen, setLoadoutOpen] = useState(false);

    const openSystem = useCallback(() => setSystemOpen(true), []);
    const closeSystem = useCallback(() => setSystemOpen(false), []);

    const openLoadout = useCallback(() => {
        setActiveSidePanel("action");
        setLoadoutOpen(true);
    }, []);
    const closeLoadout = useCallback(() => setLoadoutOpen(false), []);

    const showActionPanel = useCallback(() => setActiveSidePanel("action"), []);
    const showStatsPanel = useCallback(() => setActiveSidePanel("stats"), []);
    const showInventoryPanel = useCallback(() => setActiveSidePanel("inventory"), []);
    const showEquipmentPanel = useCallback(() => setActiveSidePanel("equipment"), []);

    return {
        activeSidePanel,
        showActionPanel,
        showStatsPanel,
        showInventoryPanel,
        showEquipmentPanel,
        isSystemOpen,
        openSystem,
        closeSystem,
        isLoadoutOpen,
        openLoadout,
        closeLoadout,
    };
};

