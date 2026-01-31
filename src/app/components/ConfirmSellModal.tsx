import { memo } from "react";
import { ModalShell } from "./ModalShell";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";

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

    const formattedCount = formatNumberCompact(count);
    const formattedCountFull = formatNumberFull(count);
    const formattedGoldGain = formatNumberCompact(goldGain);
    const formattedGoldGainFull = formatNumberFull(goldGain);

    return (
        <ModalShell kicker="Inventory" title="Confirm sale" onClose={onCancel} closeLabel="Cancel">
            <p className="ts-modal-copy">
                Sell <strong title={`x${formattedCountFull}`}>x{formattedCount}</strong> {itemName} for{" "}
                <strong title={`+${formattedGoldGainFull} gold`}>+{formattedGoldGain} gold</strong>?
            </p>
            <p className="ts-modal-copy ts-modal-copy-muted">
                This can’t be undone.
            </p>
            <div className="ts-modal-actions">
                <button
                    type="button"
                    className="generic-field button ts-inventory-sell ts-focusable"
                    onClick={onConfirm}
                    data-testid="inventory-confirm-sell"
                >
                    Sell
                </button>
            </div>
        </ModalShell>
    );
});

ConfirmSellModal.displayName = "ConfirmSellModal";
