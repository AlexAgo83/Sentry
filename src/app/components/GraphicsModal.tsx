import { memo } from "react";
import { ModalShell } from "./ModalShell";

type GraphicsModalProps = {
    onClose: () => void;
    closeLabel?: string;
};

export const GraphicsModal = memo(({ onClose, closeLabel }: GraphicsModalProps) => {
    return (
        <ModalShell kicker="System" title="Graphics" onClose={onClose} closeLabel={closeLabel}>
            <p className="ts-system-helper">Graphics settings will be available soon.</p>
        </ModalShell>
    );
});

GraphicsModal.displayName = "GraphicsModal";

