import { memo } from "react";
import { ModalShell } from "./ModalShell";
import type { PersistenceLoadReport } from "../../adapters/persistence/loadReport";

type SafeModeModalProps = {
    report: PersistenceLoadReport;
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

const messageFor = (status: PersistenceLoadReport["status"]) => {
    if (status === "corrupt") {
        return "The app could not load your save. You can reset to continue.";
    }
    if (status === "recovered_last_good") {
        return "A newer save could not be loaded. The app recovered a previous save snapshot.";
    }
    if (status === "migrated") {
        return "Your save was loaded from a legacy format and upgraded.";
    }
    return "Your save was loaded.";
};

export const SafeModeModal = memo(({ report, onResetSave, onClose }: SafeModeModalProps) => (
    <ModalShell kicker="Save" title={titleFor(report.status)} onClose={onClose}>
        <ul className="ts-list">
            <li>Status: {report.status}</li>
            <li>{messageFor(report.status)}</li>
        </ul>
        <div className="ts-action-row">
            <button
                type="button"
                className="generic-field button ts-focusable"
                onClick={onClose}
            >
                OK
            </button>
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
));

SafeModeModal.displayName = "SafeModeModal";

