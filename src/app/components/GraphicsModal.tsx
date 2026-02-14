import { memo } from "react";
import { ModalShell } from "./ModalShell";
import { useGraphicsSettings } from "../hooks/useGraphicsSettings";

type GraphicsModalProps = {
    onClose: () => void;
    closeLabel?: string;
};

export const GraphicsModal = memo(({ onClose, closeLabel }: GraphicsModalProps) => {
    const {
        settings,
        setSmoothActionProgress,
        setForceCollapsedSkinPreview
    } = useGraphicsSettings();
    const smoothProgressLocked = settings.forceCollapsedSkinPreview;

    return (
        <ModalShell kicker="System" title="Graphics" onClose={onClose} closeLabel={closeLabel}>
            <div className="ts-system-entry-list ts-graphics-settings-list">
                <div className="ts-system-entry ts-graphics-settings-entry">
                    <label
                        className={`ts-graphics-setting-row${settings.smoothActionProgress ? " is-enabled" : ""}${smoothProgressLocked ? " is-disabled" : ""}`}
                    >
                        <span className="ts-graphics-setting-meta">
                            <span className="ts-graphics-setting-heading">
                                <span className="ts-graphics-setting-title">Smooth action progress</span>
                                <span className={`ts-graphics-setting-state${smoothProgressLocked ? " is-locked" : settings.smoothActionProgress ? " is-on" : " is-off"}`}>
                                    {smoothProgressLocked ? "Locked" : settings.smoothActionProgress ? "On" : "Off"}
                                </span>
                            </span>
                            <span className="ts-system-helper ts-graphics-setting-helper">
                                If disabled, action progress updates once per loop tick.
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            className="ts-graphics-setting-toggle"
                            checked={settings.smoothActionProgress}
                            onChange={(event) => setSmoothActionProgress(event.target.checked)}
                            disabled={smoothProgressLocked}
                            aria-label="Smooth action progress"
                            data-testid="graphics-smooth-progress-toggle"
                        />
                    </label>
                </div>
                <div className="ts-system-entry ts-graphics-settings-entry">
                    <label className={`ts-graphics-setting-row${settings.forceCollapsedSkinPreview ? " is-enabled" : ""}`}>
                        <span className="ts-graphics-setting-meta">
                            <span className="ts-graphics-setting-heading">
                                <span className="ts-graphics-setting-title">Disable character rendering</span>
                                <span className={`ts-graphics-setting-state${settings.forceCollapsedSkinPreview ? " is-on" : " is-off"}`}>
                                    {settings.forceCollapsedSkinPreview ? "On" : "Off"}
                                </span>
                            </span>
                            <span className="ts-system-helper ts-graphics-setting-helper">
                                Keep skin preview panels collapsed on screens.
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            className="ts-graphics-setting-toggle"
                            checked={settings.forceCollapsedSkinPreview}
                            onChange={(event) => setForceCollapsedSkinPreview(event.target.checked)}
                            aria-label="Disable character rendering"
                            data-testid="graphics-force-collapsed-skin-toggle"
                        />
                    </label>
                </div>
            </div>
        </ModalShell>
    );
});

GraphicsModal.displayName = "GraphicsModal";
