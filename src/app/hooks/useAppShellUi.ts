import { useCallback, useState } from "react";
import type { AppActiveScreen, AppActiveSidePanel } from "../AppView";

export const useAppShellUi = () => {
    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
    const [activeScreen, setActiveScreen] = useState<AppActiveScreen>("main");
    const [returnSidePanel, setReturnSidePanel] = useState<AppActiveSidePanel>("action");
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isDevToolsOpen, setDevToolsOpen] = useState(false);

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

    const openActionSelection = useCallback(() => {
        setReturnSidePanel(activeSidePanel);
        setActiveScreen("actionSelection");
    }, [activeSidePanel]);
    const closeActionSelection = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel(returnSidePanel);
    }, [returnSidePanel]);

    const showActionPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("action");
    }, []);
    const showStatsPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("stats");
    }, []);
    const showInventoryPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("inventory");
    }, []);
    const showEquipmentPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("equipment");
    }, []);

    return {
        activeSidePanel,
        activeScreen,
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
        openActionSelection,
        closeActionSelection,
    };
};
