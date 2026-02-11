import { memo, useEffect, useState } from "react";
import { ModalShell } from "./ModalShell";
import type { SaveCopyResult } from "../hooks/useSaveManagement";

type LocalSaveModalProps = {
    onExportSave: () => void | Promise<SaveCopyResult>;
    onImportSave: () => void;
    onResetSave: () => void;
    onClose: () => void;
    closeLabel?: string;
};

export const LocalSaveModal = memo(({
    onExportSave,
    onImportSave,
    onResetSave,
    onClose,
    closeLabel
}: LocalSaveModalProps) => {
    const [exportFeedback, setExportFeedback] = useState<string | null>(null);

    useEffect(() => {
        if (!exportFeedback) {
            return;
        }
        const timeout = setTimeout(() => {
            setExportFeedback(null);
        }, 2400);
        return () => clearTimeout(timeout);
    }, [exportFeedback]);

    return (
        <ModalShell title="Local save" onClose={onClose} closeLabel={closeLabel}>
            <div className="ts-system-entry-list">
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={() => {
                                Promise.resolve(onExportSave()).then((result) => {
                                    if (result === "clipboard") {
                                        setExportFeedback("Save copied to clipboard.");
                                    }
                                }).catch(() => {});
                            }}
                        >
                            Export save
                        </button>
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-focusable"
                            onClick={onImportSave}
                        >
                            Import save
                        </button>
                    </div>
                    <span className="ts-system-helper">
                        {"Export, import, or reset this device's save."}
                    </span>
                    {exportFeedback ? (
                        <span className="ts-system-helper ts-system-helper-success" data-testid="local-export-feedback">
                            {exportFeedback}
                        </span>
                    ) : null}
                </div>
                <div className="ts-system-entry">
                    <div className="ts-action-row">
                        <button
                            type="button"
                            className="generic-field button ts-devtools-button ts-reset ts-focusable"
                            onClick={onResetSave}
                        >
                            Reset save
                        </button>
                    </div>
                    <span className="ts-system-helper">This cannot be undone.</span>
                </div>
            </div>
        </ModalShell>
    );
});

LocalSaveModal.displayName = "LocalSaveModal";
