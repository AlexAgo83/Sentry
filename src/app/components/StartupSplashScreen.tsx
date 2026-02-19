import { memo, useId, useRef } from "react";
import { useDialogFocusManagement } from "../hooks/useDialogFocusManagement";

type StartupSplashScreenProps = {
    isReady: boolean;
    onContinue: () => void;
};

export const StartupSplashScreen = memo(({ isReady, onContinue }: StartupSplashScreenProps) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const continueButtonRef = useRef<HTMLButtonElement | null>(null);
    const titleId = useId();
    const statusId = useId();

    useDialogFocusManagement({
        dialogRef,
        initialFocusRef: continueButtonRef,
        isOpen: true,
        restoreFocus: false
    });

    return (
        <div className="ts-startup-splash">
            <div
                ref={dialogRef}
                className="ts-startup-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={statusId}
                tabIndex={-1}
            >
                <span className="ts-startup-kicker">Sentry</span>
                <h1 id={titleId} className="ts-startup-title">Loading</h1>
                <p id={statusId} className="ts-startup-status">
                    {isReady ? "Ready to continue." : "Preparing your save and assets..."}
                </p>
                <div className="ts-startup-actions">
                    <button
                        ref={continueButtonRef}
                        type="button"
                        className="generic-field button ts-startup-button ts-focusable"
                        onClick={onContinue}
                        disabled={!isReady}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
});

StartupSplashScreen.displayName = "StartupSplashScreen";
