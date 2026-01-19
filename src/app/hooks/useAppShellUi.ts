import { useCallback, useState } from "react";
import type { AppActiveSidePanel } from "../AppView";

export const useAppShellUi = () => {
    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isDevToolsOpen, setDevToolsOpen] = useState(false);
    const [isLoadoutOpen, setLoadoutOpen] = useState(false);

    const openSystem = useCallback(() => {
        setDevToolsOpen(false);
        setSystemOpen(true);
    }, []);
    const closeSystem = useCallback(() => setSystemOpen(false), []);

    const openDevTools = useCallback(() => {
        if (!import.meta.env.DEV) {
            return;
        }
        setSystemOpen(false);
        setDevToolsOpen(true);
    }, []);
    const closeDevTools = useCallback(() => setDevToolsOpen(false), []);

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
        isDevToolsOpen,
        openDevTools,
        closeDevTools,
        isLoadoutOpen,
        openLoadout,
        closeLoadout,
    };
};
