import { memo } from "react";
import { ModalShell } from "./ModalShell";

type ConfirmSellModalProps = {
    isOpen: boolean;
    itemName: string;
    count: number;
    goldGain: number;
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmSellModal = memo(({
    isOpen,
    itemName,
    count,
    goldGain,
    onConfirm,
    onCancel
}: ConfirmSellModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <ModalShell kicker="Inventory" title="Confirm sale" onClose={onCancel} closeLabel="Cancel">
            <p className="ts-modal-copy">
                Sell <strong>x{count}</strong> {itemName} for <strong>+{goldGain} gold</strong>?
            </p>
            <p className="ts-modal-copy ts-modal-copy-muted">
                This can’t be undone.
            </p>
            <div className="ts-modal-actions">
                <button
                    type="button"
                    className="generic-field button ts-inventory-sell ts-focusable"
                    onClick={onConfirm}
                >
                    Sell
                </button>
            </div>
        </ModalShell>
    );
});

ConfirmSellModal.displayName = "ConfirmSellModal";

