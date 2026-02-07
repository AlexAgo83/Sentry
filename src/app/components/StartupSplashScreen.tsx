import { memo } from "react";

type StartupSplashScreenProps = {
    isReady: boolean;
    onContinue: () => void;
};

export const StartupSplashScreen = memo(({ isReady, onContinue }: StartupSplashScreenProps) => {
    return (
        <div className="ts-startup-splash" role="dialog" aria-modal="true">
            <div className="ts-startup-card">
                <span className="ts-startup-kicker">Sentry</span>
                <h1 className="ts-startup-title">Loading</h1>
                <p className="ts-startup-status">
                    {isReady ? "Ready to continue." : "Preparing your save and assets..."}
                </p>
                <div className="ts-startup-actions">
                    <button
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
