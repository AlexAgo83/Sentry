import { memo } from "react";
import { ModalShell } from "./ModalShell";

type CloudLoginPromptModalProps = {
    onLogin: () => void;
    onNotNow: () => void;
    onDisable: () => void;
};

export const CloudLoginPromptModal = memo(({ onLogin, onNotNow, onDisable }: CloudLoginPromptModalProps) => {
    return (
        <ModalShell
            kicker="Cloud"
            title={(
                <>
                    <span className="ts-cloud-login-prompt-title-full">Cloud Save</span>
                    <span className="ts-cloud-login-prompt-title-mobile">Save</span>
                </>
            )}
            onClose={onNotNow}
            closeLabel="Not now"
        >
            <div className="ts-system-cloud-login-prompt">
                <p className="ts-system-helper">
                    Log in to enable cloud backups and sync across devices.
                </p>
                <div className="ts-action-row ts-system-cloud-login-prompt-actions">
                    <button
                        type="button"
                        className="generic-field button ts-devtools-button ts-focusable"
                        onClick={onLogin}
                        title="Log in"
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-devtools-button ts-focusable"
                        onClick={onDisable}
                        title="Don't ask again"
                    >
                        Don&apos;t ask again
                    </button>
                </div>
            </div>
        </ModalShell>
    );
});

CloudLoginPromptModal.displayName = "CloudLoginPromptModal";
