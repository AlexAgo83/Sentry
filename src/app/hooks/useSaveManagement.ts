import { useCallback } from "react";
import { toGameSave } from "../../core/serialization";
import { gameRuntime, gameStore } from "../game";
import { createSaveEnvelopeV3, parseSaveEnvelopeOrLegacy, parseSaveEnvelopeV3 } from "../../adapters/persistence/saveEnvelope";
import { readRawLastGoodSave, readRawSave } from "../../adapters/persistence/localStorageKeys";

type UseSaveManagementOptions = {
    isSafeModeOpen: boolean;
    closeActionSelection: () => void;
    closeAllHeroNameModals: () => void;
    refreshLoadReport: () => void;
    closeSafeMode: () => void;
};

export type SaveCopyResult = "clipboard" | "prompt";

const copyTextToClipboard = async (raw: string, promptLabel: string): Promise<SaveCopyResult> => {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(raw);
            return "clipboard";
        } catch {
            window.prompt(promptLabel, raw);
            return "prompt";
        }
    }
    window.prompt(promptLabel, raw);
    return "prompt";
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

    const exportSave = useCallback(async () => {
        const save = toGameSave(gameStore.getState());
        const envelope = createSaveEnvelopeV3(save);
        const raw = JSON.stringify(envelope);
        return copyTextToClipboard(raw, "Copy your compressed save data:");
    }, []);

    const importSave = useCallback(() => {
        const raw = window.prompt("Paste save data:", "");
        if (!raw) {
            return;
        }
        const parsedV3 = parseSaveEnvelopeV3(raw);
        const parsed = parsedV3.status === "corrupt" ? parseSaveEnvelopeOrLegacy(raw) : parsedV3;
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
        void copyTextToClipboard(raw, "Copy current save (raw):");
    }, []);

    const copyLastGoodRawSave = useCallback(() => {
        const raw = readRawLastGoodSave();
        if (!raw) {
            window.alert("No last good save found.");
            return;
        }
        void copyTextToClipboard(raw, "Copy last good save (raw):");
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
