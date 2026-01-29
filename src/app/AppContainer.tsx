import { useCallback } from "react";
import { gameRuntime } from "./game";
import { useGameStore } from "./hooks/useGameStore";
import { InventoryIconSprite } from "./ui/inventoryIcons";
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

export const AppContainer = () => {
    useRenderCount("AppContainer");
    const { loadReport, isSafeModeOpen, refreshLoadReport, closeSafeMode } = useSafeModeState();
    useGameRuntimeLifecycle(refreshLoadReport);

    const { crashReports, clearCrashReports } = useCrashReportsState();
    const { swUpdate, closeSwUpdate, reloadSwUpdate } = useServiceWorkerUpdatePrompt();

    const version = useGameStore((state) => state.version);
    const offlineSummary = useGameStore((state) => state.offlineSummary);

    const {
        activeSidePanel,
        activeScreen,
        showActionPanel,
        showStatsPanel,
        showInventoryPanel,
        showEquipmentPanel,
        showShopPanel,
        isSystemOpen,
        openSystem,
        closeSystem,
        isDevToolsOpen,
        openDevTools,
        closeDevTools,
        openActionSelection,
        closeActionSelection
    } = useAppShellUi();

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
        closeAllHeroNameModals,
        closeSystem,
        closeDevTools,
    });

    const handleOpenActionSelection = useCallback(() => {
        closeAllHeroNameModals();
        openActionSelection();
    }, [closeAllHeroNameModals, openActionSelection]);

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
        || isRecruitOpen
        || isRenameOpen
        || offlineSummary
        || swUpdate
        || isSafeModeOpen
    );

    return (
        <div className={`app-shell${isAnyModalOpen ? " is-modal-open" : ""}`}>
            <EnsureSelectedRecipeEffect />
            <InventoryIconSprite />
            <AppViewContainer
                version={version}
                onOpenSystem={openSystem}
                onOpenDevTools={openDevTools}
                activeScreen={activeScreen}
                activeSidePanel={activeSidePanel}
                onShowAction={showActionPanel}
                onShowStats={showStatsPanel}
                onShowInventory={showInventoryPanel}
                onShowEquipment={showEquipmentPanel}
                onShowShop={showShopPanel}
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
