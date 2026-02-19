import { useCallback, useEffect, useRef, useState } from "react";
import { gameRuntime, gameStore } from "./game";
import { useGameStore } from "./hooks/useGameStore";
import { useCrashReportsState } from "./hooks/useCrashReportsState";
import { useSafeModeState } from "./hooks/useSafeModeState";
import { useServiceWorkerUpdatePrompt } from "./hooks/useServiceWorkerUpdatePrompt";
import { EnsureSelectedRecipeEffect } from "./containers/EnsureSelectedRecipeEffect";
import { useRenderCount } from "./dev/renderDebug";
import { useAppLabels } from "./hooks/useAppLabels";
import { useHeroNameModals } from "./hooks/useHeroNameModals";
import { useSaveManagement } from "./hooks/useSaveManagement";
import { useAppShellUi } from "./hooks/useAppShellUi";
import { AppViewContainer } from "./containers/AppViewContainer";
import { AppModalsContainer } from "./containers/AppModalsContainer";
import { useCloseOverlaysOnOfflineSummary } from "./hooks/useCloseOverlaysOnOfflineSummary";
import { useGameRuntimeLifecycle } from "./hooks/useGameRuntimeLifecycle";
import { useInventoryNewBadges } from "./hooks/useInventoryNewBadges";
import { generateUniqueEnglishHeroNames } from "./ui/heroNames";
import { StartupSplashScreen } from "./components/StartupSplashScreen";
import { startSilentBackendWarmup } from "./backendWarmup";
import { resolveAutoDungeonOpenDecision } from "./autoDungeonOpen";
import { useCloudSave } from "./hooks/useCloudSave";
import {
    resolveActiveDungeonRunIdForPlayer,
    resolveRosterSelectionDungeonNavigation
} from "./rosterSelectionNavigation";

export const AppContainer = () => {
    useRenderCount("AppContainer");
    const { loadReport, isSafeModeOpen, refreshLoadReport, closeSafeMode } = useSafeModeState();
    useGameRuntimeLifecycle(refreshLoadReport);

    const { crashReports, clearCrashReports } = useCrashReportsState();
    const { swUpdate, closeSwUpdate, reloadSwUpdate } = useServiceWorkerUpdatePrompt();

    const version = useGameStore((state) => state.version);
    const appReady = useGameStore((state) => state.appReady);
    const offlineSummary = useGameStore((state) => state.offlineSummary);
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const playerCount = useGameStore((state) => Object.keys(state.players).length);
    const isDungeonRunActive = useGameStore((state) => Boolean(state.dungeon.activeRunId));
    const dungeonOnboardingRequired = useGameStore((state) => state.dungeon.onboardingRequired);
    const persistence = useGameStore((state) => state.persistence);
    const cloudLoginPromptDisabled = useGameStore((state) => Boolean(state.ui.cloud.loginPromptDisabled));
    const cloud = useCloudSave();

    const {
        activeSidePanel,
        activeScreen,
        showActionPanel,
        showLastHeroPanel,
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
        closeDevTools,
        isLocalSaveOpen,
        closeLocalSave,
        isCloudSaveOpen,
        openCloudSave,
        closeCloudSave,
        openActionSelection,
        closeActionSelection,
        openDungeonScreen,
        closeDungeonScreen
    } = useAppShellUi();

    const [onboardingHeroName, setOnboardingHeroName] = useState("");
    const [didAutoOpenDungeon, setDidAutoOpenDungeon] = useState(false);
    const [heroMenuOpenSignal, setHeroMenuOpenSignal] = useState(0);
    const [isRosterDrawerOpen, setRosterDrawerOpen] = useState(false);
    const [hasContinued, setHasContinued] = useState(false);
    const [isCloudLoginPromptOpen, setCloudLoginPromptOpen] = useState(false);
    const cloudLoginPromptShownThisSessionRef = useRef(false);
    const isOnboardingOpen = dungeonOnboardingRequired && playerCount < 4;

    useEffect(() => {
        if (!appReady || hasContinued) {
            return;
        }
        const autoContinueDelayMs = (import.meta.env.MODE === "test" || import.meta.env.VITE_E2E)
            ? 0
            : 2000;
        if (autoContinueDelayMs <= 0) {
            setHasContinued(true);
            return;
        }
        const timeoutId = window.setTimeout(() => {
            setHasContinued(true);
        }, autoContinueDelayMs);
        return () => window.clearTimeout(timeoutId);
    }, [appReady, hasContinued]);

    useEffect(() => {
        if (import.meta.env.DEV || import.meta.env.MODE === "test" || import.meta.env.VITE_E2E) {
            return;
        }
        const rawBase = (__PROD_RENDER_API_BASE__ || import.meta.env.VITE_PROD_RENDER_API_BASE || "").trim();
        const stopWarmup = startSilentBackendWarmup(rawBase);
        return stopWarmup ?? undefined;
    }, []);

    const {
        newItemIds: newInventoryItemIds,
        hasNewItems: hasNewInventoryItems,
        markItemSeen: markInventoryItemSeen,
        markMenuSeen: markInventoryMenuSeen
    } = useInventoryNewBadges(inventoryItems, version);

    useEffect(() => {
        if (!dungeonOnboardingRequired || playerCount !== 0) {
            return;
        }
        const livePlayerCount = Object.keys(gameStore.getState().players).length;
        if (livePlayerCount !== 0) {
            return;
        }
        const starterNames = generateUniqueEnglishHeroNames(3);
        starterNames.forEach((name) => {
            gameStore.dispatch({ type: "addPlayer", name });
        });
    }, [dungeonOnboardingRequired, playerCount]);

    useEffect(() => {
        if (!isOnboardingOpen || onboardingHeroName.trim().length > 0) {
            return;
        }
        const existingNames = new Set(
            Object.values(gameStore.getState().players)
                .map((player) => player.name.trim().toLowerCase())
                .filter(Boolean)
        );
        const candidate = generateUniqueEnglishHeroNames(8).find((name) => !existingNames.has(name.toLowerCase()));
        if (!candidate) {
            return;
        }
        setOnboardingHeroName(candidate);
    }, [isOnboardingOpen, onboardingHeroName]);

    useEffect(() => {
        const decision = resolveAutoDungeonOpenDecision({
            isDungeonRunActive,
            didAutoOpenDungeon,
            activeScreen,
            isOnboardingOpen
        });
        if (decision.nextDidAutoOpenDungeon !== didAutoOpenDungeon) {
            setDidAutoOpenDungeon(decision.nextDidAutoOpenDungeon);
        }
        if (decision.shouldOpenDungeon) {
            openDungeonScreen();
        }
    }, [activeScreen, didAutoOpenDungeon, isDungeonRunActive, isOnboardingOpen, openDungeonScreen]);

    const handleOpenDungeonScreen = useCallback(() => {
        setDidAutoOpenDungeon(true);
        const state = gameStore.getState();
        const nextActiveRunId = resolveActiveDungeonRunIdForPlayer({
            playerId: state.activePlayerId,
            dungeon: state.dungeon
        });
        if (nextActiveRunId && nextActiveRunId !== state.dungeon.activeRunId) {
            gameStore.dispatch({ type: "dungeonSetActiveRun", runId: nextActiveRunId });
        }
        openDungeonScreen();
    }, [openDungeonScreen]);

    useEffect(() => {
        if (
            activeSidePanel === "inventory"
            || activeSidePanel === "equipment"
            || activeSidePanel === "shop"
            || activeSidePanel === "quests"
        ) {
            markInventoryMenuSeen();
        }
    }, [activeSidePanel, markInventoryMenuSeen]);

    const { getSkillLabel, getSkillLabelStrict, getRecipeLabel, getRecipeLabelNonNull } = useAppLabels();

    const {
        isRecruitOpen,
        newHeroName,
        setNewHeroName,
        openRecruit,
        closeRecruit,
        createHero,
        isRenameOpen,
        renameHeroName,
        setRenameHeroName,
        openActiveRename,
        closeRename,
        renameHero,
        closeAllHeroNameModals
    } = useHeroNameModals({
        onBeforeOpenRecruit: closeActionSelection,
        onBeforeOpenRename: closeActionSelection,
    });

    useCloseOverlaysOnOfflineSummary({
        offlineSummary,
        closeActionSelection,
        closeDungeonScreen,
        closeAllHeroNameModals,
        closeSystem,
        closeDevTools,
        closeLocalSave,
        closeCloudSave,
    });

    useEffect(() => {
        if (!isOnboardingOpen) {
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
        closeCloudSave,
        closeDevTools,
        closeLocalSave,
        closeSystem,
        isOnboardingOpen
    ]);

    const handleOpenActionSelection = useCallback(() => {
        closeAllHeroNameModals();
        openActionSelection();
    }, [closeAllHeroNameModals, openActionSelection]);

    const handleCreateOnboardingHero = useCallback(() => {
        const trimmed = onboardingHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "addPlayer", name: trimmed });
        setOnboardingHeroName("");
        const nextPlayerCount = Object.keys(gameStore.getState().players).length;
        if (nextPlayerCount >= 4) {
            openActionSelection();
        }
    }, [onboardingHeroName, openActionSelection]);

    const handleSimulateOffline = useCallback(() => {
        gameRuntime.simulateOffline(30 * 60 * 1000);
    }, []);

    const handleSimulateOfflineHour = useCallback(() => {
        gameRuntime.simulateOffline(60 * 60 * 1000);
    }, []);

    const handleSimulateOfflineDay = useCallback(() => {
        gameRuntime.simulateOffline(24 * 60 * 60 * 1000);
    }, []);

    const handleRosterPlayerSelect = useCallback((playerId: string) => {
        setHeroMenuOpenSignal((current) => current + 1);
        setRosterDrawerOpen(false);
        const state = gameStore.getState();
        const navigationDecision = resolveRosterSelectionDungeonNavigation({
            activeScreen,
            selectedPlayerId: playerId,
            dungeon: state.dungeon
        });
        if (navigationDecision.nextActiveRunId) {
            gameStore.dispatch({ type: "dungeonSetActiveRun", runId: navigationDecision.nextActiveRunId });
            return;
        }
        if (navigationDecision.shouldExitDungeonToAction) {
            showActionPanel();
        }
    }, [activeScreen, showActionPanel]);

    const {
        closeOfflineSummary,
        resetSave,
        exportSave,
        importSave,
        canCopyCurrentRawSave,
        canCopyLastGoodRawSave,
        copyCurrentRawSave,
        copyLastGoodRawSave
    } = useSaveManagement({
        isSafeModeOpen,
        closeActionSelection,
        closeAllHeroNameModals,
        refreshLoadReport,
        closeSafeMode,
    });

    const isAnyModalOpen = Boolean(
        isSystemOpen
        || isDevToolsOpen
        || isLocalSaveOpen
        || isCloudSaveOpen
        || isCloudLoginPromptOpen
        || isOnboardingOpen
        || isRecruitOpen
        || isRenameOpen
        || offlineSummary
        || swUpdate
        || isSafeModeOpen
        || !hasContinued
    );

    const isAnyBlockingModalOpen = Boolean(
        isSystemOpen
        || isDevToolsOpen
        || isLocalSaveOpen
        || isCloudSaveOpen
        || isOnboardingOpen
        || isRecruitOpen
        || isRenameOpen
        || offlineSummary
        || swUpdate
        || isSafeModeOpen
        || !hasContinued
    );

    useEffect(() => {
        if (!hasContinued) {
            return;
        }
        if (cloudLoginPromptShownThisSessionRef.current) {
            return;
        }
        if (cloudLoginPromptDisabled) {
            return;
        }
        if (cloud.accessToken) {
            return;
        }
        if (isAnyBlockingModalOpen) {
            return;
        }

        const backendOnline = cloud.isAvailable
            && cloud.isBackendAwake
            && cloud.status !== "warming"
            && cloud.status !== "authenticating";

        if (!backendOnline) {
            return;
        }

        cloudLoginPromptShownThisSessionRef.current = true;
        setCloudLoginPromptOpen(true);
    }, [
        cloud.accessToken,
        cloud.isAvailable,
        cloud.isBackendAwake,
        cloud.status,
        cloudLoginPromptDisabled,
        hasContinued,
        isAnyBlockingModalOpen
    ]);

    useEffect(() => {
        if (!isCloudLoginPromptOpen) {
            return;
        }
        if (cloud.accessToken) {
            setCloudLoginPromptOpen(false);
        }
    }, [cloud.accessToken, isCloudLoginPromptOpen]);

    return (
        <div className={`app-shell${isAnyModalOpen ? " is-modal-open" : ""}`}>
            <EnsureSelectedRecipeEffect />
            {!hasContinued ? (
                <StartupSplashScreen
                    isReady={appReady}
                    onContinue={() => setHasContinued(true)}
                />
            ) : null}
            {persistence.disabled ? (
                <div className="ts-persistence-banner" role="status">
                    <div className="ts-persistence-banner-content">
                        <strong>Saving paused.</strong>
                        <span>{persistence.error ?? "Local save failed. Please retry."}</span>
                    </div>
                    <div className="ts-persistence-banner-actions">
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={() => gameRuntime.retryPersistence()}
                        >
                            Retry save
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-focusable"
                            onClick={exportSave}
                        >
                            Export save
                        </button>
                    </div>
                </div>
            ) : null}
            <AppViewContainer
                version={version}
                onOpenSystem={openSystem}
                isRosterDrawerOpen={isRosterDrawerOpen}
                onOpenRosterDrawer={() => setRosterDrawerOpen(true)}
                onCloseRosterDrawer={() => setRosterDrawerOpen(false)}
                activeScreen={activeScreen}
                activeSidePanel={activeSidePanel}
                onShowHero={showLastHeroPanel}
                onShowAction={showActionPanel}
                onShowDungeon={handleOpenDungeonScreen}
                isDungeonLocked={playerCount < 4}
                onShowStats={showStatsPanel}
                onShowRoster={showRosterScreen}
                onShowInventory={showInventoryPanel}
                onShowEquipment={showEquipmentPanel}
                onShowShop={showShopPanel}
                onShowQuests={showQuestsPanel}
                heroMenuOpenSignal={heroMenuOpenSignal}
                isDungeonRunActive={isDungeonRunActive}
                hasNewInventoryItems={hasNewInventoryItems}
                newInventoryItemIds={newInventoryItemIds}
                onMarkInventoryItemSeen={markInventoryItemSeen}
                onAddPlayer={openRecruit}
                onRosterPlayerSelect={handleRosterPlayerSelect}
                onChangeAction={handleOpenActionSelection}
                onCloseActionSelection={closeActionSelection}
                onRenameHero={openActiveRename}
                getSkillLabel={getSkillLabelStrict}
                getRecipeLabel={getRecipeLabel}
                getRecipeLabelNonNull={getRecipeLabelNonNull}
            />
            <AppModalsContainer
                version={version}
                getSkillLabel={getSkillLabel}
                getRecipeLabel={getRecipeLabel}
                crashReports={crashReports}
                onClearCrashReports={clearCrashReports}
                onExportSave={exportSave}
                onImportSave={importSave}
                onSimulateOffline={handleSimulateOffline}
                onSimulateOfflineHour={handleSimulateOfflineHour}
                onSimulateOfflineDay={handleSimulateOfflineDay}
                onResetSave={resetSave}
                onCloseSystem={closeSystem}
                isLocalSaveOpen={isLocalSaveOpen}
                onCloseLocalSave={closeLocalSave}
                isCloudSaveOpen={isCloudSaveOpen}
                onCloseCloudSave={closeCloudSave}
                isCloudLoginPromptOpen={isCloudLoginPromptOpen}
                onCloseCloudLoginPrompt={() => setCloudLoginPromptOpen(false)}
                onCloudLoginPromptLogin={() => {
                    setCloudLoginPromptOpen(false);
                    openCloudSave();
                }}
                onCloudLoginPromptDisable={() => {
                    setCloudLoginPromptOpen(false);
                    gameStore.dispatch({ type: "uiSetCloudLoginPromptDisabled", disabled: true });
                }}
                isOnboardingOpen={isOnboardingOpen}
                onboardingTitle={playerCount >= 3 ? "Create your 4th hero" : "Create your hero"}
                onboardingHelperText={playerCount >= 3
                    ? "Your party needs a fourth hero to unlock Dungeon mode."
                    : "Pick a name to begin your journey."}
                onboardingSubmitLabel={playerCount >= 3 ? "Create 4th hero" : "Create hero"}
                onboardingHeroName={onboardingHeroName}
                onOnboardingHeroNameChange={setOnboardingHeroName}
                onCreateOnboardingHero={handleCreateOnboardingHero}
                onCloseOfflineSummary={closeOfflineSummary}
                offlineSummary={offlineSummary}
                swUpdate={swUpdate}
                onReloadSwUpdate={reloadSwUpdate}
                onCloseSwUpdate={closeSwUpdate}
                isSafeModeOpen={isSafeModeOpen}
                loadReport={loadReport}
                canCopyCurrentRawSave={canCopyCurrentRawSave}
                canCopyLastGoodRawSave={canCopyLastGoodRawSave}
                onCopyCurrentRawSave={copyCurrentRawSave}
                onCopyLastGoodRawSave={copyLastGoodRawSave}
                onCloseSafeMode={closeSafeMode}
                isSystemOpen={isSystemOpen}
                isDevToolsOpen={isDevToolsOpen}
                onCloseDevTools={closeDevTools}
                isRecruitOpen={isRecruitOpen}
                newHeroName={newHeroName}
                onNewHeroNameChange={setNewHeroName}
                onCreateHero={createHero}
                onCloseRecruit={closeRecruit}
                isRenameOpen={isRenameOpen}
                renameHeroName={renameHeroName}
                onRenameHeroNameChange={setRenameHeroName}
                onRenameHero={renameHero}
                onCloseRename={closeRename}
            />
        </div>
    );
};
