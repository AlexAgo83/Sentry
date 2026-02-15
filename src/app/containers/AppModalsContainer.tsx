import { lazy, Suspense } from "react";
import type { OfflineSummaryState, SkillId } from "../../core/types";
import type { SwUpdateAvailableDetail } from "../../pwa/serviceWorker";
import type { PersistenceLoadReport } from "../../adapters/persistence/loadReport";
import type { CrashReport } from "../../observability/crashReporter";
import { HeroNameModal } from "../components/HeroNameModal";
import { ModalShell } from "../components/ModalShell";
import { OfflineSummaryModal } from "../components/OfflineSummaryModal";
import { SafeModeModal } from "../components/SafeModeModal";
import { ServiceWorkerUpdateModal } from "../components/ServiceWorkerUpdateModal";
import { OnboardingHeroModal } from "../components/OnboardingHeroModal";
import { CloudLoginPromptModal } from "../components/CloudLoginPromptModal";

const LazySystemModalContainer = lazy(async () => {
    const mod = await import("./SystemModalContainer");
    return { default: mod.SystemModalContainer };
});

const LazyLocalSaveModal = lazy(async () => {
    const mod = await import("../components/LocalSaveModal");
    return { default: mod.LocalSaveModal };
});

const LazyCloudSaveModal = lazy(async () => {
    const mod = await import("../components/CloudSaveModal");
    return { default: mod.CloudSaveModal };
});

const LazyDevToolsModal = lazy(async () => {
    const mod = await import("../components/DevToolsModal");
    return { default: mod.DevToolsModal };
});

const LoadingModal = ({ onClose }: { onClose: () => void }) => (
    <ModalShell kicker="System" title="Loading" onClose={onClose}>
        <p className="ts-system-helper">Loading...</p>
    </ModalShell>
);

type AppModalsContainerProps = {
    version: string;
    getSkillLabel: (skillId: SkillId | "") => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
    crashReports: CrashReport[];
    onClearCrashReports: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onSimulateOffline: () => void;
    onSimulateOfflineHour: () => void;
    onSimulateOfflineDay: () => void;
    onResetSave: () => void;
    onCloseSystem: () => void;
    isLocalSaveOpen: boolean;
    onCloseLocalSave: () => void;
    isCloudSaveOpen: boolean;
    onCloseCloudSave: () => void;
    isCloudLoginPromptOpen: boolean;
    onCloseCloudLoginPrompt: () => void;
    onCloudLoginPromptLogin: () => void;
    onCloudLoginPromptDisable: () => void;
    isOnboardingOpen: boolean;
    onboardingTitle?: string;
    onboardingHelperText?: string;
    onboardingSubmitLabel?: string;
    onboardingHeroName: string;
    onOnboardingHeroNameChange: (value: string) => void;
    onCreateOnboardingHero: () => void;
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
    onSimulateOfflineHour,
    onSimulateOfflineDay,
    onResetSave,
    onCloseSystem,
    isLocalSaveOpen,
    onCloseLocalSave,
    isCloudSaveOpen,
    onCloseCloudSave,
    isCloudLoginPromptOpen,
    onCloseCloudLoginPrompt,
    onCloudLoginPromptLogin,
    onCloudLoginPromptDisable,
    isOnboardingOpen,
    onboardingTitle,
    onboardingHelperText,
    onboardingSubmitLabel,
    onboardingHeroName,
    onOnboardingHeroNameChange,
    onCreateOnboardingHero,
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
            {isCloudLoginPromptOpen ? (
                <CloudLoginPromptModal
                    onLogin={onCloudLoginPromptLogin}
                    onNotNow={onCloseCloudLoginPrompt}
                    onDisable={onCloudLoginPromptDisable}
                />
            ) : null}
            {isOnboardingOpen ? (
                <OnboardingHeroModal
                    title={onboardingTitle}
                    helperText={onboardingHelperText}
                    submitLabel={onboardingSubmitLabel}
                    name={onboardingHeroName}
                    isSubmitDisabled={onboardingHeroName.trim().length === 0}
                    onNameChange={onOnboardingHeroNameChange}
                    onSubmit={onCreateOnboardingHero}
                />
            ) : null}
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
                <Suspense fallback={<LoadingModal onClose={onCloseSystem} />}>
                    <LazySystemModalContainer
                        version={version}
                        crashReports={crashReports}
                        onExportSave={onExportSave}
                        onImportSave={onImportSave}
                        onResetSave={onResetSave}
                        onSimulateOffline={onSimulateOffline}
                        onSimulateOfflineHour={onSimulateOfflineHour}
                        onSimulateOfflineDay={onSimulateOfflineDay}
                        onClearCrashReports={onClearCrashReports}
                        onClose={onCloseSystem}
                    />
                </Suspense>
            ) : null}
            {isLocalSaveOpen ? (
                <Suspense fallback={<LoadingModal onClose={onCloseLocalSave} />}>
                    <LazyLocalSaveModal
                        onExportSave={onExportSave}
                        onImportSave={onImportSave}
                        onResetSave={onResetSave}
                        onClose={onCloseLocalSave}
                    />
                </Suspense>
            ) : null}
            {isCloudSaveOpen ? (
                <Suspense fallback={<LoadingModal onClose={onCloseCloudSave} />}>
                    <LazyCloudSaveModal onClose={onCloseCloudSave} />
                </Suspense>
            ) : null}
            {import.meta.env.DEV && isDevToolsOpen ? (
                <Suspense fallback={<LoadingModal onClose={onCloseDevTools} />}>
                    <LazyDevToolsModal
                        onClose={onCloseDevTools}
                        onSimulateOffline={onSimulateOffline}
                        onSimulateOfflineHour={onSimulateOfflineHour}
                        onSimulateOfflineDay={onSimulateOfflineDay}
                    />
                </Suspense>
            ) : null}
            {offlineSummary ? (
                <OfflineSummaryModal
                    summary={offlineSummary}
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
