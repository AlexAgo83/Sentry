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

    return (
        <ModalShell kicker="System" title="Graphics" onClose={onClose} closeLabel={closeLabel}>
            <div className="ts-system-entry-list ts-graphics-settings-list">
                <div className="ts-system-entry ts-graphics-settings-entry">
                    <label className="ts-graphics-setting-row">
                        <span className="ts-graphics-setting-meta">
                            <span className="ts-graphics-setting-title">Smooth action progress</span>
                            <span className="ts-system-helper ts-graphics-setting-helper">
                                If disabled, action progress updates once per loop tick.
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            className="ts-graphics-setting-toggle"
                            checked={settings.smoothActionProgress}
                            onChange={(event) => setSmoothActionProgress(event.target.checked)}
                            disabled={settings.forceCollapsedSkinPreview}
                            aria-label="Smooth action progress"
                            data-testid="graphics-smooth-progress-toggle"
                        />
                    </label>
                </div>
                <div className="ts-system-entry ts-graphics-settings-entry">
                    <label className="ts-graphics-setting-row">
                        <span className="ts-graphics-setting-meta">
                            <span className="ts-graphics-setting-title">Disable character rendering</span>
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
