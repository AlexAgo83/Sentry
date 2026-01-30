import { memo } from "react";
import { ModalShell } from "./ModalShell";
import { CloudSavePanelContainer } from "../containers/CloudSavePanelContainer";

type CloudSaveModalProps = {
    onClose: () => void;
};

export const CloudSaveModal = memo(({ onClose }: CloudSaveModalProps) => (
    <ModalShell kicker="Cloud" title="Cloud save" onClose={onClose}>
        <div className="ts-system-cloud-modal">
            <CloudSavePanelContainer />
        </div>
    </ModalShell>
));

CloudSaveModal.displayName = "CloudSaveModal";
