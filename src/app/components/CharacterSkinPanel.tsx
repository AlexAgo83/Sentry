import { memo, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { PlayerEquipmentState } from "../../core/types";
import { getFaceUrlByIndex } from "../ui/heroFaces";
import { getHairUrlByIndex } from "../ui/heroHair";
import { CollapseIcon } from "../ui/collapseIcon";
import { getEquipmentSkinVars } from "../ui/heroEquipmentSkins";
import {
    EditOffIcon,
    EditOnIcon,
    FaceIcon,
    HairIcon,
    HelmetOffIcon,
    HelmetOnIcon,
    RenameIcon
} from "../ui/heroSkinIcons";
import { Avatar } from "./Avatar";

type CharacterSkinPanelProps = {
    avatarColor: string;
    faceIndex: number;
    hairIndex: number;
    hairColor: string;
    skinColor: string;
    showHelmet: boolean;
    equipment: PlayerEquipmentState | null;
    skillBackgroundUrl?: string | null;
    progressPercent?: number;
    progressAnimation?: {
        key: string;
        intervalMs: number;
        currentIntervalMs: number;
        lastExecutionTimeMs: number | null;
    } | null;
    progressColor?: string;
    isStunned?: boolean;
    heroName?: string | null;
    isPlaceholder: boolean;
    isCollapsed: boolean;
    isEditMode: boolean;
    onRenameHero: () => void;
    canRenameHero: boolean;
    onNextFace: () => void;
    onNextHair: () => void;
    onHairColorChange: (color: string) => void;
    onToggleCollapsed: () => void;
    onSkinColorChange: (color: string) => void;
    onToggleEditMode: () => void;
    onToggleHelmet: () => void;
};

export const CharacterSkinPanel = memo(({
    avatarColor,
    faceIndex,
    hairIndex,
    hairColor,
    skinColor,
    showHelmet,
    equipment,
    skillBackgroundUrl,
    progressPercent = 0,
    progressAnimation = null,
    progressColor,
    isStunned = false,
    heroName,
    isPlaceholder,
    isCollapsed,
    isEditMode,
    onRenameHero,
    canRenameHero,
    onNextFace,
    onNextHair,
    onHairColorChange,
    onToggleCollapsed,
    onSkinColorChange,
    onToggleEditMode,
    onToggleHelmet
}: CharacterSkinPanelProps) => {
    const heroNameLength = heroName?.trim().length ?? 0;
    const heroNameSizeClass = heroNameLength > 16
        ? " is-long-name"
        : heroNameLength > 14
            ? " is-medium-long-name"
        : heroNameLength > 12
            ? " is-medium-name"
            : "";
    const avatarStyle = {
        "--ts-avatar-torso": avatarColor,
        "--ts-avatar-face": `url("${getFaceUrlByIndex(faceIndex)}")`,
        "--ts-avatar-hair": `url("${getHairUrlByIndex(hairIndex)}")`,
        "--ts-avatar-hair-color": hairColor,
        "--ts-avatar-skin": skinColor,
        ...getEquipmentSkinVars(equipment, { showHelmet })
    } as CSSProperties;
    const ringColor = isStunned
        ? "rgba(199, 74, 61, 0.8)"
        : (progressColor ?? avatarColor);
    const clampedProgress = Math.max(0, Math.min(100, progressPercent));
    const panelRef = useRef<HTMLElement | null>(null);
    const animationSeedRef = useRef<{ key: string | null; initialIntervalMs: number }>({
        key: null,
        initialIntervalMs: 0
    });
    const animationAnchorRef = useRef<{ key: string | null; anchorMs: number | null }>({
        key: null,
        anchorMs: null
    });
    const animationKey = progressAnimation?.key ?? null;
    const animationIntervalMs = progressAnimation?.intervalMs ?? null;
    const animationLastExecutionTimeMs = progressAnimation?.lastExecutionTimeMs ?? null;
    if (animationKey && animationSeedRef.current.key !== animationKey) {
        animationSeedRef.current = {
            key: animationKey,
            initialIntervalMs: Math.max(0, progressAnimation?.currentIntervalMs ?? 0)
        };
    }
    const panelStyle = {
        "--ts-skin-background": skillBackgroundUrl ? `url("${skillBackgroundUrl}")` : "none",
        "--ts-skin-progress-color": ringColor,
        ...(progressAnimation ? {} : { "--ts-skin-progress": `${clampedProgress}%` })
    } as CSSProperties;

    useEffect(() => {
        const panelElement = panelRef.current;
        if (!panelElement) {
            return;
        }
        const fallbackProgress = `${clampedProgress}%`;
        const canAnimate = !isCollapsed
            && Number.isFinite(animationIntervalMs)
            && (animationIntervalMs ?? 0) > 0;
        if (!canAnimate || !animationIntervalMs) {
            animationAnchorRef.current = { key: null, anchorMs: null };
            panelElement.style.setProperty("--ts-skin-progress", fallbackProgress);
            return;
        }

        const intervalMs = animationIntervalMs;
        let anchorMs: number;
        const hasExecutionTime = typeof animationLastExecutionTimeMs === "number"
            && Number.isFinite(animationLastExecutionTimeMs);
        if (hasExecutionTime) {
            anchorMs = animationLastExecutionTimeMs as number;
            animationAnchorRef.current = {
                key: animationKey,
                anchorMs
            };
        } else {
            if (animationAnchorRef.current.key !== animationKey || animationAnchorRef.current.anchorMs === null) {
                const seed = animationSeedRef.current.initialIntervalMs;
                const clampedSeed = Math.max(0, Math.min(seed, intervalMs));
                animationAnchorRef.current = {
                    key: animationKey,
                    anchorMs: Date.now() - clampedSeed
                };
            }
            anchorMs = animationAnchorRef.current.anchorMs ?? Date.now();
        }

        let rafId = 0;
        const getRawProgress = () => {
            const elapsedMs = Math.max(0, Date.now() - anchorMs);
            return ((elapsedMs % intervalMs) / intervalMs) * 100;
        };
        const SMOOTHING_TAU_MS = 120;
        const getCompensatedTargetProgress = () => {
            const elapsedMs = Math.max(0, Date.now() - anchorMs + SMOOTHING_TAU_MS);
            return ((elapsedMs % intervalMs) / intervalMs) * 100;
        };
        let displayedProgress = getRawProgress();
        let lastFrameTs: number | null = null;
        panelElement.style.setProperty("--ts-skin-progress", `${displayedProgress}%`);

        const updateProgress = (frameTs: number) => {
            const targetProgress = getCompensatedTargetProgress();
            if (lastFrameTs === null) {
                lastFrameTs = frameTs;
                displayedProgress = targetProgress;
            } else {
                const deltaMs = Math.max(0, Math.min(64, frameTs - lastFrameTs));
                lastFrameTs = frameTs;
                const alpha = 1 - Math.exp(-deltaMs / SMOOTHING_TAU_MS);
                const forwardDelta = targetProgress >= displayedProgress
                    ? targetProgress - displayedProgress
                    : (100 - displayedProgress) + targetProgress;
                displayedProgress = forwardDelta > 0.001
                    ? ((displayedProgress + forwardDelta * alpha) % 100)
                    : targetProgress;
            }
            panelElement.style.setProperty("--ts-skin-progress", `${displayedProgress}%`);
            rafId = window.requestAnimationFrame(updateProgress);
        };

        rafId = window.requestAnimationFrame(updateProgress);
        return () => {
            window.cancelAnimationFrame(rafId);
        };
    }, [
        clampedProgress,
        isCollapsed,
        animationKey,
        animationIntervalMs,
        animationLastExecutionTimeMs
    ]);

    return (
        <section
            ref={panelRef}
            className={`generic-panel ts-panel ts-panel-skin${isCollapsed ? " is-collapsed" : ""}`}
            style={panelStyle}
        >
            {!isCollapsed ? <span className="ts-skin-progress-ring" aria-hidden="true" /> : null}
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className={`ts-panel-title ts-skin-hero-title${heroNameSizeClass}`}>
                        {heroName ?? "Hero Skin"}
                    </h2>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className={`ts-icon-button ts-focusable ts-skin-edit-button${isEditMode ? " is-active" : ""}`}
                        onClick={onToggleEditMode}
                        disabled={!canRenameHero}
                        aria-pressed={isEditMode}
                        aria-label={isEditMode ? "Disable edit" : "Enable edit"}
                    >
                        <span className="ts-skin-action-icon">
                            {isEditMode ? <EditOnIcon /> : <EditOffIcon />}
                        </span>
                    </button>
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable"
                        onClick={onToggleCollapsed}
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <span className="ts-collapse-label">
                            <CollapseIcon isCollapsed={isCollapsed} />
                        </span>
                    </button>
                </div>
            </div>
            {!isCollapsed ? (
                <div className="ts-skin-panel">
                    <Avatar
                        style={avatarStyle}
                        variant="large"
                        isPlaceholder={isPlaceholder}
                    />
                <div className="ts-skin-overlay-actions">
                    {isEditMode ? (
                        <>
                            <button
                                type="button"
                                className="ts-icon-button ts-panel-action-button ts-focusable ts-skin-rename-button"
                                onClick={onRenameHero}
                                disabled={!canRenameHero}
                                aria-label="Rename"
                            >
                                <span className="ts-skin-action-icon">
                                    <RenameIcon />
                                </span>
                                <span className="ts-skin-action-label">Rename</span>
                            </button>
                            <button
                                type="button"
                                className="ts-icon-button ts-focusable ts-skin-cycle-button"
                                onClick={onNextFace}
                                disabled={!canRenameHero}
                                aria-label="Next face"
                            >
                                <span className="ts-skin-action-icon">
                                    <FaceIcon />
                                </span>
                                <span className="ts-skin-action-label">Face</span>
                            </button>
                            <span className="ts-color-picker">
                                <input
                                    type="color"
                                    className="ts-icon-button ts-hair-color-input"
                                    value={skinColor}
                                    onChange={(event) => onSkinColorChange(event.target.value)}
                                    disabled={!canRenameHero}
                                    aria-label="Skin color"
                                />
                                <span className="ts-skin-color-label">F</span>
                            </span>
                            <button
                                type="button"
                                className="ts-icon-button ts-focusable ts-skin-cycle-button"
                                onClick={onNextHair}
                                disabled={!canRenameHero}
                                aria-label="Next hair"
                            >
                                <span className="ts-skin-action-icon">
                                    <HairIcon />
                                </span>
                                <span className="ts-skin-action-label">Hair</span>
                            </button>
                            <span className="ts-color-picker">
                                <input
                                    type="color"
                                    className="ts-icon-button ts-hair-color-input"
                                    value={hairColor}
                                    onChange={(event) => onHairColorChange(event.target.value)}
                                    disabled={!canRenameHero}
                                    aria-label="Hair color"
                                />
                                <span className="ts-skin-color-label">H</span>
                            </span>
                            <button
                                type="button"
                                className={`ts-icon-button ts-focusable ts-skin-cycle-button${showHelmet ? " is-active" : ""}`}
                                onClick={onToggleHelmet}
                                disabled={!canRenameHero}
                                aria-pressed={showHelmet}
                                aria-label={showHelmet ? "Hide helmet" : "Show helmet"}
                            >
                                <span className="ts-skin-action-icon">
                                    {showHelmet ? <HelmetOnIcon /> : <HelmetOffIcon />}
                                </span>
                                <span className="ts-skin-action-label">Helmet</span>
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        ) : null}
    </section>
    );
});

CharacterSkinPanel.displayName = "CharacterSkinPanel";
