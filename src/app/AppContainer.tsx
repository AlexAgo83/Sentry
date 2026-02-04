import { useCallback, useEffect, useState } from "react";
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

export const AppContainer = () => {
    useRenderCount("AppContainer");
    const { loadReport, isSafeModeOpen, refreshLoadReport, closeSafeMode } = useSafeModeState();
    useGameRuntimeLifecycle(refreshLoadReport);

    const { crashReports, clearCrashReports } = useCrashReportsState();
    const { swUpdate, closeSwUpdate, reloadSwUpdate } = useServiceWorkerUpdatePrompt();

    const version = useGameStore((state) => state.version);
    const offlineSummary = useGameStore((state) => state.offlineSummary);
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const playerCount = useGameStore((state) => Object.keys(state.players).length);
    const isDungeonRunActive = useGameStore((state) => Boolean(state.dungeon.activeRunId));
    const dungeonOnboardingRequired = useGameStore((state) => state.dungeon.onboardingRequired);
    const persistence = useGameStore((state) => state.persistence);

    const {
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
        openDungeonScreen,
        closeDungeonScreen
    } = useAppShellUi();

    const [onboardingHeroName, setOnboardingHeroName] = useState("");
    const [didAutoOpenDungeon, setDidAutoOpenDungeon] = useState(false);
    const isOnboardingOpen = dungeonOnboardingRequired && playerCount < 4;

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
        if (!isDungeonRunActive) {
            setDidAutoOpenDungeon(false);
            return;
        }
        if (didAutoOpenDungeon || isOnboardingOpen || activeScreen !== "main") {
            return;
        }
        openDungeonScreen();
        setDidAutoOpenDungeon(true);
    }, [activeScreen, didAutoOpenDungeon, isDungeonRunActive, isOnboardingOpen, openDungeonScreen]);

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
        || isOnboardingOpen
        || isRecruitOpen
        || isRenameOpen
        || offlineSummary
        || swUpdate
        || isSafeModeOpen
    );

    return (
        <div className={`app-shell${isAnyModalOpen ? " is-modal-open" : ""}`}>
            <EnsureSelectedRecipeEffect />
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
                activeScreen={activeScreen}
                activeSidePanel={activeSidePanel}
                onShowAction={showActionPanel}
                onShowDungeon={openDungeonScreen}
                isDungeonLocked={playerCount < 4}
                onShowStats={showStatsPanel}
                onShowRoster={showRosterScreen}
                onShowInventory={showInventoryPanel}
                onShowEquipment={showEquipmentPanel}
                onShowShop={showShopPanel}
                onShowQuests={showQuestsPanel}
                isDungeonRunActive={isDungeonRunActive}
                hasNewInventoryItems={hasNewInventoryItems}
                newInventoryItemIds={newInventoryItemIds}
                onMarkInventoryItemSeen={markInventoryItemSeen}
                onAddPlayer={openRecruit}
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
                onResetSave={resetSave}
                onCloseSystem={closeSystem}
                onOpenDevTools={openDevTools}
                onOpenLocalSave={openLocalSave}
                onOpenCloudSave={openCloudSave}
                isLocalSaveOpen={isLocalSaveOpen}
                onCloseLocalSave={closeLocalSave}
                isCloudSaveOpen={isCloudSaveOpen}
                onCloseCloudSave={closeCloudSave}
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
