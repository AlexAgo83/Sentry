import { memo } from "react";
import { ModalShell } from "./ModalShell";

type LocalSaveModalProps = {
    onExportSave: () => void;
    onImportSave: () => void;
    onResetSave: () => void;
    onClose: () => void;
};

export const LocalSaveModal = memo(({
    onExportSave,
    onImportSave,
    onResetSave,
    onClose,
}: LocalSaveModalProps) => (
    <ModalShell kicker="Local" title="Local save" onClose={onClose}>
        <div className="ts-system-entry-list">
            <div className="ts-system-entry">
                <div className="ts-action-row">
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onExportSave}
                    >
                        Export save
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-focusable"
                        onClick={onImportSave}
                    >
                        Import save
                    </button>
                </div>
                <span className="ts-system-helper">
                    Export, import, or reset this device's save.
                </span>
            </div>
            <div className="ts-system-entry">
                <div className="ts-action-row">
                    <button
                        type="button"
                        className="generic-field button ts-reset ts-focusable"
                        onClick={onResetSave}
                    >
                        Reset save
                    </button>
                </div>
                <span className="ts-system-helper">This cannot be undone.</span>
            </div>
        </div>
    </ModalShell>
));

LocalSaveModal.displayName = "LocalSaveModal";
