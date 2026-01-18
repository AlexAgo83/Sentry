import { memo } from "react";
import { ModalShell } from "./ModalShell";

type ServiceWorkerUpdateModalProps = {
    version: string;
    onReload: () => void;
    onClose: () => void;
};

export const ServiceWorkerUpdateModal = memo(({
    version,
    onReload,
    onClose
}: ServiceWorkerUpdateModalProps) => (
    <ModalShell kicker="Update available" title="A new version is ready" onClose={onClose}>
        <ul className="ts-list">
            <li>Current version: {version}</li>
            <li>Reload to activate the latest assets and logic.</li>
        </ul>
        <div className="ts-action-row">
            <button
                type="button"
                className="generic-field button ts-focusable"
                onClick={onReload}
            >
                Reload now
            </button>
            <button
                type="button"
                className="generic-field button ts-focusable"
                onClick={onClose}
            >
                Later
            </button>
        </div>
    </ModalShell>
));

ServiceWorkerUpdateModal.displayName = "ServiceWorkerUpdateModal";
