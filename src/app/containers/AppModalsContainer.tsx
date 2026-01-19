import type { OfflineSummaryState, SkillId } from "../../core/types";
import type { SwUpdateAvailableDetail } from "../../pwa/serviceWorker";
import type { PersistenceLoadReport } from "../../adapters/persistence/loadReport";
import type { CrashReport } from "../../observability/crashReporter";
import { HeroNameModal } from "../components/HeroNameModal";
import { OfflineSummaryModal } from "../components/OfflineSummaryModal";
import { SafeModeModal } from "../components/SafeModeModal";
import { ServiceWorkerUpdateModal } from "../components/ServiceWorkerUpdateModal";
import { DevToolsModal } from "../components/DevToolsModal";
import { LoadoutModalContainer } from "./LoadoutModalContainer";
import { SystemModalContainer } from "./SystemModalContainer";

type AppModalsContainerProps = {
    version: string;
    getSkillLabel: (skillId: SkillId | "") => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onSimulateOffline: () => void;
    onResetSave: () => void;
    onCloseSystem: () => void;
    onCloseOfflineSummary: () => void;
    offlineSummary: OfflineSummaryState | null;
    swUpdate: SwUpdateAvailableDetail | null;
    onReloadSwUpdate: () => void;
    onCloseSwUpdate: () => void;
    isSafeModeOpen: boolean;
    loadReport: PersistenceLoadReport;
    canCopyCurrentRawSave: boolean;
    canCopyLastGoodRawSave: boolean;
    onCopyCurrentRawSave: () => void;
    onCopyLastGoodRawSave: () => void;
    onCloseSafeMode: () => void;
    isLoadoutOpen: boolean;
    onCloseLoadout: () => void;
    isSystemOpen: boolean;
    isDevToolsOpen: boolean;
    onCloseDevTools: () => void;
    isRecruitOpen: boolean;
    newHeroName: string;
    onNewHeroNameChange: (value: string) => void;
    onCreateHero: () => void;
    onCloseRecruit: () => void;
    isRenameOpen: boolean;
    renameHeroName: string;
    onRenameHeroNameChange: (value: string) => void;
    onRenameHero: () => void;
    onCloseRename: () => void;
};

export const AppModalsContainer = ({
    version,
    getSkillLabel,
    getRecipeLabel,
    crashReports,
    onClearCrashReports,
    onExportSave,
    onImportSave,
    onSimulateOffline,
    onResetSave,
    onCloseSystem,
    onCloseOfflineSummary,
    offlineSummary,
    swUpdate,
    onReloadSwUpdate,
    onCloseSwUpdate,
    isSafeModeOpen,
    loadReport,
    canCopyCurrentRawSave,
    canCopyLastGoodRawSave,
    onCopyCurrentRawSave,
    onCopyLastGoodRawSave,
    onCloseSafeMode,
    isLoadoutOpen,
    onCloseLoadout,
    isSystemOpen,
    isDevToolsOpen,
    onCloseDevTools,
    isRecruitOpen,
    newHeroName,
    onNewHeroNameChange,
    onCreateHero,
    onCloseRecruit,
    isRenameOpen,
    renameHeroName,
    onRenameHeroNameChange,
    onRenameHero,
    onCloseRename,
}: AppModalsContainerProps) => {
    return (
        <>
            <LoadoutModalContainer
                isOpen={isLoadoutOpen}
                onClose={onCloseLoadout}
                getSkillLabel={getSkillLabel}
            />
            {isRecruitOpen ? (
                <HeroNameModal
                    kicker="Recruit"
                    title="New hero"
                    name={newHeroName}
                    submitLabel="Create hero"
                    isSubmitDisabled={newHeroName.trim().length === 0}
                    onNameChange={onNewHeroNameChange}
                    onSubmit={onCreateHero}
                    onClose={onCloseRecruit}
                />
            ) : null}
            {isRenameOpen ? (
                <HeroNameModal
                    kicker="Set name"
                    title="Rename"
                    name={renameHeroName}
                    submitLabel="Save name"
                    isSubmitDisabled={renameHeroName.trim().length === 0}
                    onNameChange={onRenameHeroNameChange}
                    onSubmit={onRenameHero}
                    onClose={onCloseRename}
                />
            ) : null}
            {isSystemOpen ? (
                <SystemModalContainer
                    version={version}
                    getSkillLabel={getSkillLabel}
                    crashReports={crashReports}
                    onClearCrashReports={onClearCrashReports}
                    onExportSave={onExportSave}
                    onImportSave={onImportSave}
                    onSimulateOffline={onSimulateOffline}
                    onResetSave={onResetSave}
                    onClose={onCloseSystem}
                />
            ) : null}
            {import.meta.env.DEV && isDevToolsOpen ? (
                <DevToolsModal onClose={onCloseDevTools} />
            ) : null}
            {offlineSummary ? (
                <OfflineSummaryModal
                    summary={offlineSummary}
                    offlineSeconds={Math.round(offlineSummary.durationMs / 1000)}
                    players={offlineSummary.players ?? []}
                    onClose={onCloseOfflineSummary}
                    getSkillLabel={getSkillLabel}
                    getRecipeLabel={getRecipeLabel}
                />
            ) : null}
            {swUpdate ? (
                <ServiceWorkerUpdateModal
                    version={swUpdate.version}
                    onReload={onReloadSwUpdate}
                    onClose={onCloseSwUpdate}
                />
            ) : null}
            {isSafeModeOpen ? (
                <SafeModeModal
                    report={loadReport}
                    canCopyCurrentRawSave={canCopyCurrentRawSave}
                    canCopyLastGoodRawSave={canCopyLastGoodRawSave}
                    onCopyCurrentRawSave={onCopyCurrentRawSave}
                    onCopyLastGoodRawSave={onCopyLastGoodRawSave}
                    onResetSave={onResetSave}
                    onClose={onCloseSafeMode}
                />
            ) : null}
        </>
    );
};
