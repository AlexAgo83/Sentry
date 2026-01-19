import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { PersistenceLoadReport } from "../../adapters/persistence/loadReport";

type SafeModeModalProps = {
    report: PersistenceLoadReport;
    canCopyCurrentRawSave: boolean;
    canCopyLastGoodRawSave: boolean;
    onCopyCurrentRawSave: () => void;
    onCopyLastGoodRawSave: () => void;
    onResetSave: () => void;
    onClose: () => void;
};

const titleFor = (status: PersistenceLoadReport["status"]) => {
    if (status === "corrupt") {
        return "Save data looks corrupted";
    }
    if (status === "recovered_last_good") {
        return "Recovered your last good save";
    }
    if (status === "migrated") {
        return "Save upgraded";
    }
    return "Save status";
};

const messageFor = (status: PersistenceLoadReport["status"], allowRawExport: boolean) => {
    if (status === "corrupt") {
        return allowRawExport
            ? "The app could not load your save. Export the raw data if you want to investigate, or reset to continue."
            : "The app could not load your save. Reset to continue.";
    }
    if (status === "recovered_last_good") {
        return "A newer save could not be loaded. The app recovered a previous save snapshot.";
    }
    if (status === "migrated") {
        return "Your save was loaded from a legacy format and upgraded.";
    }
    return "Your save was loaded.";
};

export const SafeModeModal = memo(({
    report,
    canCopyCurrentRawSave,
    canCopyLastGoodRawSave,
    onCopyCurrentRawSave,
    onCopyLastGoodRawSave,
    onResetSave,
    onClose
}: SafeModeModalProps) => {
    const allowRawExport = Boolean(import.meta.env.DEV);

    return (
    <ModalShell kicker="Save" title={titleFor(report.status)} onClose={onClose}>
        <ul className="ts-list">
            <li>Status: {report.status}</li>
            <li>Recovered from last good: {report.recoveredFromLastGood ? "yes" : "no"}</li>
            <li>{messageFor(report.status, allowRawExport)}</li>
        </ul>
        <div className="ts-action-row">
            <button
                type="button"
                className="generic-field button ts-focusable"
                onClick={onClose}
            >
                OK
            </button>
            {allowRawExport ? (
                <>
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onCopyCurrentRawSave}
                        disabled={!canCopyCurrentRawSave}
                    >
                        Copy current save (raw)
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onCopyLastGoodRawSave}
                        disabled={!canCopyLastGoodRawSave}
                    >
                        Copy last good (raw)
                    </button>
                </>
            ) : null}
            {report.status !== "ok" ? (
                <button
                    type="button"
                    className="generic-field button ts-focusable"
                    onClick={onResetSave}
                >
                    Reset save
                </button>
            ) : null}
        </div>
    </ModalShell>
    );
});

SafeModeModal.displayName = "SafeModeModal";
