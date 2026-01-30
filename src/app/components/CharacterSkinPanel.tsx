import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";
import { getFaceUrlByIndex } from "../ui/heroFaces";
import { getHairUrlByIndex } from "../ui/heroHair";
import { CollapseIcon } from "../ui/collapseIcon";

const FaceIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="10" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 20c1.6-3 3.8-4.5 5-4.5s3.4 1.5 5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 10h.01M14 10h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.5 12.5c.8.6 2.2.6 3 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

const HairIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M6 12c0-4 3-7 6-7s6 3 6 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path
            d="M5 12c0 5 3.5 8 7 8s7-3 7-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path
            d="M8 8c1.4 1.6 3 2.2 4 2.2S14.6 9.6 16 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
);

const EditOnIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M4 16.5V20h3.5L19 8.5l-3.5-3.5L4 16.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M14.5 5l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const EditOffIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d="M4 16.5V20h3.5L19 8.5l-3.5-3.5L4 16.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

type CharacterSkinPanelProps = {
    avatarColor: string;
    avatarSkillId: SkillId | null;
    faceIndex: number;
    hairIndex: number;
    hairColor: string;
    skinColor: string;
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
};

export const CharacterSkinPanel = memo(({
    avatarColor,
    avatarSkillId,
    faceIndex,
    hairIndex,
    hairColor,
    skinColor,
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
    onToggleEditMode
}: CharacterSkinPanelProps) => {
    const avatarStyle = {
        "--ts-avatar-torso": avatarColor,
        "--ts-avatar-face": `url("${getFaceUrlByIndex(faceIndex)}")`,
        "--ts-avatar-hair": `url("${getHairUrlByIndex(hairIndex)}")`,
        "--ts-avatar-hair-color": hairColor,
        "--ts-avatar-skin": skinColor
    } as CSSProperties;
    const avatarClassName = `ts-player-avatar ts-player-avatar--large${isPlaceholder ? " is-placeholder" : ""}`;

    return (
        <section className="generic-panel ts-panel ts-panel-skin">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">{heroName ?? "Hero Skin"}</h2>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className={`ts-icon-button ts-focusable${isEditMode ? " is-active" : ""}`}
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
                    <div className={avatarClassName} style={avatarStyle} aria-hidden="true">
                        <span className="ts-player-avatar-layer ts-player-avatar-legs" />
                        <span className="ts-player-avatar-layer ts-player-avatar-head" />
                        <span className="ts-player-avatar-layer ts-player-avatar-face" />
                        <span className="ts-player-avatar-layer ts-player-avatar-hair" />
                        <span className="ts-player-avatar-layer ts-player-avatar-torso" />
                        <span className="ts-player-avatar-layer ts-player-avatar-hands" />
                        <span className="ts-player-avatar-layer ts-player-avatar-feets" />
                        {avatarSkillId ? (
                            <span className="ts-player-avatar-skill">
                                <SkillIcon skillId={avatarSkillId} color="#0c111c" />
                            </span>
                    ) : null}
                </div>
                <div className="ts-skin-overlay-actions">
                    {isEditMode ? (
                        <>
                            <button
                                type="button"
                                className="ts-icon-button ts-panel-action-button ts-focusable"
                                onClick={onRenameHero}
                                disabled={!canRenameHero}
                            >
                                Rename
                            </button>
                            <button
                                type="button"
                                className="ts-icon-button ts-focusable"
                                onClick={onNextFace}
                                disabled={!canRenameHero}
                                aria-label="Next face"
                            >
                                <span className="ts-skin-action-icon">
                                    <FaceIcon />
                                </span>
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
                                className="ts-icon-button ts-focusable"
                                onClick={onNextHair}
                                disabled={!canRenameHero}
                                aria-label="Next hair"
                            >
                                <span className="ts-skin-action-icon">
                                    <HairIcon />
                                </span>
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
                        </>
                    ) : null}
                </div>
            </div>
        ) : null}
    </section>
    );
});

CharacterSkinPanel.displayName = "CharacterSkinPanel";
