import { memo } from "react";
import { ModalShell } from "./ModalShell";

type SaveOptionsModalProps = {
    onOpenLocalSave: () => void;
    onOpenCloudSave: () => void;
    onClose: () => void;
    closeLabel?: string;
};

export const SaveOptionsModal = memo(({
    onOpenLocalSave,
    onOpenCloudSave,
    onClose,
    closeLabel
}: SaveOptionsModalProps) => (
    <ModalShell kicker="System" title="Save" onClose={onClose} closeLabel={closeLabel}>
        <div className="ts-system-entry-list">
            <div className="ts-system-entry">
                <div className="ts-action-row ts-action-stack">
                    <button
                        type="button"
                        className="generic-field button ts-devtools-button ts-focusable"
                        onClick={onOpenLocalSave}
                        data-testid="open-local-save"
                    >
                        Local save
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-devtools-button ts-focusable"
                        onClick={onOpenCloudSave}
                        data-testid="open-cloud-save"
                    >
                        Cloud save
                    </button>
                </div>
                <span className="ts-system-helper">
                    Export, import, reset, or sync your save data.
                </span>
            </div>
        </div>
    </ModalShell>
));

SaveOptionsModal.displayName = "SaveOptionsModal";
