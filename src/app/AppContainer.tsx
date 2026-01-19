import { useCallback, useEffect, useMemo, useState } from "react";
import { getRecipeDefinition, ITEM_DEFINITIONS, SKILL_DEFINITIONS } from "../data/definitions";
import type { SkillId } from "../core/types";
import { gameRuntime, gameStore } from "./game";
import { useGameStore } from "./hooks/useGameStore";
import { AppView, type AppActiveSidePanel } from "./AppView";
import { InventoryIconSprite } from "./ui/inventoryIcons";
import { HeroNameModal } from "./components/HeroNameModal";
import { OfflineSummaryModal } from "./components/OfflineSummaryModal";
import { SafeModeModal } from "./components/SafeModeModal";
import { ServiceWorkerUpdateModal } from "./components/ServiceWorkerUpdateModal";
import { SystemModal } from "./components/SystemModal";
import { useCrashReportsState } from "./hooks/useCrashReportsState";
import { useSafeModeState } from "./hooks/useSafeModeState";
import { useServiceWorkerUpdatePrompt } from "./hooks/useServiceWorkerUpdatePrompt";
import { toGameSave } from "../core/serialization";
import { createSaveEnvelopeV2, parseSaveEnvelopeOrLegacy } from "../adapters/persistence/saveEnvelope";
import { readRawLastGoodSave, readRawSave } from "../adapters/persistence/localStorageKeys";
import { EnsureSelectedRecipeEffect } from "./containers/EnsureSelectedRecipeEffect";
import { LoadoutModalContainer } from "./containers/LoadoutModalContainer";
import { RosterContainer } from "./containers/RosterContainer";
import { ActionPanelContainer } from "./containers/ActionPanelContainer";
import { StatsPanelContainer } from "./containers/StatsPanelContainer";
import { InventoryPanelContainer } from "./containers/InventoryPanelContainer";
import { EquipmentPanelContainer } from "./containers/EquipmentPanelContainer";
import { selectActivePlayer } from "./selectors/gameSelectors";
import { useRenderCount } from "./dev/renderDebug";

const copyTextToClipboard = (raw: string, promptLabel: string) => {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(raw).catch(() => {
            window.prompt(promptLabel, raw);
        });
        return;
    }
    window.prompt(promptLabel, raw);
};

export const AppContainer = () => {
    useRenderCount("AppContainer");
    const { loadReport, isSafeModeOpen, refreshLoadReport, closeSafeMode } = useSafeModeState();
    useEffect(() => {
        gameRuntime.start();
        refreshLoadReport();
        return () => gameRuntime.stop();
    }, [refreshLoadReport]);

    const { crashReports, clearCrashReports } = useCrashReportsState();
    const { swUpdate, closeSwUpdate, reloadSwUpdate } = useServiceWorkerUpdatePrompt();

    const version = useGameStore((state) => state.version);
    const offlineSummary = useGameStore((state) => state.offlineSummary);

    const [activeSidePanel, setActiveSidePanel] = useState<AppActiveSidePanel>("action");
    const [isSystemOpen, setSystemOpen] = useState(false);
    const [isLoadoutOpen, setLoadoutOpen] = useState(false);
    const [isRecruitOpen, setRecruitOpen] = useState(false);
    const [isRenameOpen, setRenameOpen] = useState(false);
    const [renamePlayerId, setRenamePlayerId] = useState<string | null>(null);
    const [newHeroName, setNewHeroName] = useState("");
    const [renameHeroName, setRenameHeroName] = useState("");

    useEffect(() => {
        if (!offlineSummary) {
            return;
        }
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(false);
        setSystemOpen(false);
    }, [offlineSummary]);

    const skillNameById = useMemo(() => SKILL_DEFINITIONS.reduce<Record<string, string>>((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
    }, {}), []);
    const getSkillLabel = useCallback((skillId: SkillId | ""): string => {
        if (!skillId) {
            return "None";
        }
        return skillNameById[skillId] ?? skillId;
    }, [skillNameById]);
    const getRecipeLabel = useCallback((skillId: SkillId, recipeId: string | null): string => {
        if (!recipeId) {
            return "none";
        }
        const recipeDef = getRecipeDefinition(skillId, recipeId);
        return recipeDef?.name ?? recipeId;
    }, []);

    const handleAddPlayer = useCallback(() => {
        setLoadoutOpen(false);
        setRenameOpen(false);
        setRecruitOpen(true);
    }, []);

    const handleCloseRecruit = useCallback(() => {
        setRecruitOpen(false);
        setNewHeroName("");
    }, []);

    const handleCreateHero = useCallback(() => {
        const trimmed = newHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "addPlayer", name: trimmed });
        setRecruitOpen(false);
        setNewHeroName("");
    }, [newHeroName]);

    const handleOpenActiveRename = useCallback(() => {
        const state = gameStore.getState();
        const playerId = state.activePlayerId;
        if (!playerId) {
            return;
        }
        const player = state.players[playerId];
        if (!player) {
            return;
        }
        setRenamePlayerId(playerId);
        setRenameHeroName(player.name);
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(true);
    }, []);

    const handleCloseRename = useCallback(() => {
        setRenameOpen(false);
        setRenamePlayerId(null);
        setRenameHeroName("");
    }, []);

    const handleRenameHero = useCallback(() => {
        if (!renamePlayerId) {
            return;
        }
        const trimmed = renameHeroName.trim().slice(0, 20);
        if (!trimmed) {
            return;
        }
        gameStore.dispatch({ type: "renamePlayer", playerId: renamePlayerId, name: trimmed });
        handleCloseRename();
    }, [handleCloseRename, renameHeroName, renamePlayerId]);

    const handleOpenSystem = useCallback(() => {
        setSystemOpen(true);
    }, []);

    const handleCloseSystem = useCallback(() => {
        setSystemOpen(false);
    }, []);

    const handleOpenLoadout = useCallback(() => {
        setActiveSidePanel("action");
        setRecruitOpen(false);
        setRenameOpen(false);
        setLoadoutOpen(true);
    }, []);

    const showActionPanel = useCallback(() => setActiveSidePanel("action"), []);
    const showStatsPanel = useCallback(() => setActiveSidePanel("stats"), []);
    const showInventoryPanel = useCallback(() => setActiveSidePanel("inventory"), []);
    const showEquipmentPanel = useCallback(() => setActiveSidePanel("equipment"), []);

    const handleCloseLoadout = useCallback(() => {
        setLoadoutOpen(false);
    }, []);

    const handleSimulateOffline = useCallback(() => {
        gameRuntime.simulateOffline(30 * 60 * 1000);
    }, []);

    const handleCloseOfflineSummary = useCallback(() => {
        gameStore.dispatch({ type: "setOfflineSummary", summary: null });
    }, []);

    const handleResetSave = useCallback(() => {
        const confirmed = window.confirm("Reset save data? This cannot be undone.");
        if (!confirmed) {
            return;
        }
        setLoadoutOpen(false);
        setRecruitOpen(false);
        setRenameOpen(false);
        handleCloseOfflineSummary();
        gameRuntime.reset();
        closeSafeMode();
        refreshLoadReport();
    }, [closeSafeMode, handleCloseOfflineSummary, refreshLoadReport]);

    const handleExportSave = useCallback(() => {
        const save = toGameSave(gameStore.getState());
        const envelope = createSaveEnvelopeV2(save);
        const raw = JSON.stringify(envelope);
        copyTextToClipboard(raw, "Copy your save data:");
    }, []);

    const handleImportSave = useCallback(() => {
        const raw = window.prompt("Paste save data (JSON):", "");
        if (!raw) {
            return;
        }
        const parsed = parseSaveEnvelopeOrLegacy(raw);
        if (parsed.status === "ok" || parsed.status === "migrated" || parsed.status === "recovered_last_good") {
            gameRuntime.importSave(parsed.save);
            refreshLoadReport();
            return;
        }
        window.alert("Invalid save data.");
    }, [refreshLoadReport]);

    const canCopyCurrentRawSave = Boolean(isSafeModeOpen && readRawSave());
    const canCopyLastGoodRawSave = Boolean(isSafeModeOpen && readRawLastGoodSave());

    const handleCopyCurrentRawSave = useCallback(() => {
        const raw = readRawSave();
        if (!raw) {
            window.alert("No current save found.");
            return;
        }
        copyTextToClipboard(raw, "Copy current save (raw):");
    }, []);

    const handleCopyLastGoodRawSave = useCallback(() => {
        const raw = readRawLastGoodSave();
        if (!raw) {
            window.alert("No last good save found.");
            return;
        }
        copyTextToClipboard(raw, "Copy last good save (raw):");
    }, []);

    return (
        <div className="app-shell">
            <EnsureSelectedRecipeEffect />
            <InventoryIconSprite />
            <AppView
                version={version}
                onOpenSystem={handleOpenSystem}
                activeSidePanel={activeSidePanel}
                onShowAction={showActionPanel}
                onShowStats={showStatsPanel}
                onShowInventory={showInventoryPanel}
                onShowEquipment={showEquipmentPanel}
                roster={(
                    <RosterContainer
                        onAddPlayer={handleAddPlayer}
                        getSkillLabel={(skillId) => getSkillLabel(skillId)}
                        getRecipeLabel={(skillId, recipeId) => getRecipeLabel(skillId, recipeId)}
                    />
                )}
                actionPanel={(
                    <ActionPanelContainer
                        onChangeAction={handleOpenLoadout}
                        getSkillLabel={(skillId) => getSkillLabel(skillId)}
                        getRecipeLabel={(skillId, recipeId) => getRecipeLabel(skillId, recipeId)}
                    />
                )}
                statsPanel={(
                    <StatsPanelContainer
                        onRenameHero={handleOpenActiveRename}
                    />
                )}
                inventoryPanel={<InventoryPanelContainer />}
                equipmentPanel={<EquipmentPanelContainer />}
            />
            <LoadoutModalContainer
                isOpen={isLoadoutOpen}
                onClose={handleCloseLoadout}
                getSkillLabel={getSkillLabel}
            />
            {isRecruitOpen ? (
                <HeroNameModal
                    kicker="Recruit"
                    title="New hero"
                    name={newHeroName}
                    submitLabel="Create hero"
                    isSubmitDisabled={newHeroName.trim().length === 0}
                    onNameChange={setNewHeroName}
                    onSubmit={handleCreateHero}
                    onClose={handleCloseRecruit}
                />
            ) : null}
            {isRenameOpen ? (
                <HeroNameModal
                    kicker="Set name"
                    title="Rename"
                    name={renameHeroName}
                    submitLabel="Save name"
                    isSubmitDisabled={renameHeroName.trim().length === 0}
                    onNameChange={setRenameHeroName}
                    onSubmit={handleRenameHero}
                    onClose={handleCloseRename}
                />
            ) : null}
            {isSystemOpen ? (
                <SystemModalContainer
                    version={version}
                    getSkillLabel={getSkillLabel}
                    crashReports={crashReports}
                    onClearCrashReports={clearCrashReports}
                    onExportSave={handleExportSave}
                    onImportSave={handleImportSave}
                    onSimulateOffline={handleSimulateOffline}
                    onResetSave={handleResetSave}
                    onClose={handleCloseSystem}
                />
            ) : null}
            {offlineSummary ? (
                <OfflineSummaryModal
                    summary={offlineSummary}
                    offlineSeconds={Math.round(offlineSummary.durationMs / 1000)}
                    players={offlineSummary.players ?? []}
                    onClose={handleCloseOfflineSummary}
                    getSkillLabel={(skillId) => getSkillLabel(skillId as SkillId)}
                    getRecipeLabel={(skillId, recipeId) => getRecipeLabel(skillId as SkillId, recipeId)}
                />
            ) : null}
            {swUpdate ? (
                <ServiceWorkerUpdateModal
                    version={swUpdate.version}
                    onReload={reloadSwUpdate}
                    onClose={closeSwUpdate}
                />
            ) : null}
            {isSafeModeOpen ? (
                <SafeModeModal
                    report={loadReport}
                    canCopyCurrentRawSave={canCopyCurrentRawSave}
                    canCopyLastGoodRawSave={canCopyLastGoodRawSave}
                    onCopyCurrentRawSave={handleCopyCurrentRawSave}
                    onCopyLastGoodRawSave={handleCopyLastGoodRawSave}
                    onResetSave={handleResetSave}
                    onClose={closeSafeMode}
                />
            ) : null}
        </div>
    );
};

interface SystemModalContainerProps {
    version: string;
    getSkillLabel: (skillId: SkillId | "") => string;
    crashReports: ReturnType<typeof useCrashReportsState>["crashReports"];
    onClearCrashReports: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onSimulateOffline: () => void;
    onResetSave: () => void;
    onClose: () => void;
}

const SystemModalContainer = (props: SystemModalContainerProps) => {
    const perf = useGameStore((state) => state.perf);
    const loop = useGameStore((state) => state.loop);
    const activePlayer = useGameStore(selectActivePlayer);

    const tickRate = (1000 / loop.loopInterval).toFixed(1);
    const hasDelta = perf.lastDeltaMs > 0;
    const driftMs = hasDelta ? perf.lastDeltaMs - loop.loopInterval : 0;
    const driftLabel = `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;

    return (
        <SystemModal
            version={props.version}
            lastTick={loop.lastTick}
            lastTickDurationMs={perf.lastTickDurationMs}
            lastDeltaMs={perf.lastDeltaMs}
            driftLabel={driftLabel}
            lastOfflineTicks={perf.lastOfflineTicks}
            lastOfflineDurationMs={perf.lastOfflineDurationMs}
            tickRate={tickRate}
            loopInterval={loop.loopInterval}
            offlineInterval={loop.offlineInterval}
            activeActionLabel={activePlayer?.selectedActionId
                ? props.getSkillLabel(activePlayer.selectedActionId as SkillId)
                : "none"}
            crashReports={props.crashReports}
            onClearCrashReports={props.onClearCrashReports}
            onExportSave={props.onExportSave}
            onImportSave={props.onImportSave}
            onSimulateOffline={props.onSimulateOffline}
            onResetSave={props.onResetSave}
            onClose={props.onClose}
        />
    );
};
