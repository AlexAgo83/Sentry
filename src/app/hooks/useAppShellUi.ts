import { useCallback, useState } from "react";
import type { AppActiveScreen, AppActiveSidePanel } from "../AppView";

export const useAppShellUi = () => {
    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
    const [activeScreen, setActiveScreen] = useState<AppActiveScreen>("main");
    const [returnSidePanel, setReturnSidePanel] = useState<AppActiveSidePanel>("action");
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isDevToolsOpen, setDevToolsOpen] = useState(false);
    const [isLocalSaveOpen, setLocalSaveOpen] = useState(false);
    const [isCloudSaveOpen, setCloudSaveOpen] = useState(false);

    const openSystem = useCallback(() => {
        setDevToolsOpen(false);
        setLocalSaveOpen(false);
        setCloudSaveOpen(false);
        setSystemOpen(true);
    }, []);
    const closeSystem = useCallback(() => setSystemOpen(false), []);

    const openDevTools = useCallback(() => {
        if (!import.meta.env.DEV) {
            return;
        }
        setSystemOpen(false);
        setLocalSaveOpen(false);
        setCloudSaveOpen(false);
        setDevToolsOpen(true);
    }, []);
    const closeDevTools = useCallback(() => setDevToolsOpen(false), []);

    const openLocalSave = useCallback(() => {
        setSystemOpen(false);
        setDevToolsOpen(false);
        setCloudSaveOpen(false);
        setLocalSaveOpen(true);
    }, []);
    const closeLocalSave = useCallback(() => setLocalSaveOpen(false), []);

    const openCloudSave = useCallback(() => {
        setSystemOpen(false);
        setDevToolsOpen(false);
        setLocalSaveOpen(false);
        setCloudSaveOpen(true);
    }, []);
    const closeCloudSave = useCallback(() => setCloudSaveOpen(false), []);

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
    const showRosterScreen = useCallback(() => {
        setActiveScreen("roster");
    }, []);
    const showInventoryPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("inventory");
    }, []);
    const showEquipmentPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("equipment");
    }, []);
    const showShopPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("shop");
    }, []);
    const showQuestsPanel = useCallback(() => {
        setActiveScreen("main");
        setActiveSidePanel("quests");
    }, []);

    return {
        activeSidePanel,
        activeScreen,
        showActionPanel,
        showStatsPanel,
        showRosterScreen,
        showInventoryPanel,
        showEquipmentPanel,
        showShopPanel,
        showQuestsPanel,
        isSystemOpen,
        openSystem,
        closeSystem,
        isDevToolsOpen,
        openDevTools,
        closeDevTools,
        isLocalSaveOpen,
        openLocalSave,
        closeLocalSave,
        isCloudSaveOpen,
        openCloudSave,
        closeCloudSave,
        openActionSelection,
        closeActionSelection,
    };
};
