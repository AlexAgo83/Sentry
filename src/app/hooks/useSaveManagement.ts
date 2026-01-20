import { useCallback } from "react";
import { toGameSave } from "../../core/serialization";
import { gameRuntime, gameStore } from "../game";
import { createSaveEnvelopeV2, parseSaveEnvelopeOrLegacy } from "../../adapters/persistence/saveEnvelope";
import { readRawLastGoodSave, readRawSave } from "../../adapters/persistence/localStorageKeys";

type UseSaveManagementOptions = {
    isSafeModeOpen: boolean;
    closeActionSelection: () => void;
    closeAllHeroNameModals: () => void;
    refreshLoadReport: () => void;
    closeSafeMode: () => void;
};

const copyTextToClipboard = (raw: string, promptLabel: string) => {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(raw).catch(() => {
            window.prompt(promptLabel, raw);
        });
        return;
    }
    window.prompt(promptLabel, raw);
};

export const useSaveManagement = ({
    isSafeModeOpen,
    closeActionSelection,
    closeAllHeroNameModals,
    refreshLoadReport,
    closeSafeMode,
}: UseSaveManagementOptions) => {
    const closeOfflineSummary = useCallback(() => {
        gameStore.dispatch({ type: "setOfflineSummary", summary: null });
    }, []);

    const resetSave = useCallback(() => {
        const confirmed = window.confirm("Reset save data? This cannot be undone.");
        if (!confirmed) {
            return;
        }
        closeActionSelection();
        closeAllHeroNameModals();
        closeOfflineSummary();
        gameRuntime.reset();
        closeSafeMode();
        refreshLoadReport();
    }, [closeActionSelection, closeAllHeroNameModals, closeOfflineSummary, closeSafeMode, refreshLoadReport]);

    const exportSave = useCallback(() => {
        const save = toGameSave(gameStore.getState());
        const envelope = createSaveEnvelopeV2(save);
        const raw = JSON.stringify(envelope);
        copyTextToClipboard(raw, "Copy your save data:");
    }, []);

    const importSave = useCallback(() => {
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

    const copyCurrentRawSave = useCallback(() => {
        const raw = readRawSave();
        if (!raw) {
            window.alert("No current save found.");
            return;
        }
        copyTextToClipboard(raw, "Copy current save (raw):");
    }, []);

    const copyLastGoodRawSave = useCallback(() => {
        const raw = readRawLastGoodSave();
        if (!raw) {
            window.alert("No last good save found.");
            return;
        }
        copyTextToClipboard(raw, "Copy last good save (raw):");
    }, []);

    return {
        closeOfflineSummary,
        resetSave,
        exportSave,
        importSave,
        canCopyCurrentRawSave,
        canCopyLastGoodRawSave,
        copyCurrentRawSave,
        copyLastGoodRawSave,
    };
};
