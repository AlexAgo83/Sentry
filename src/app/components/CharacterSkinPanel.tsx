import { memo } from "react";
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
    const avatarStyle = {
        "--ts-avatar-torso": avatarColor,
        "--ts-avatar-face": `url("${getFaceUrlByIndex(faceIndex)}")`,
        "--ts-avatar-hair": `url("${getHairUrlByIndex(hairIndex)}")`,
        "--ts-avatar-hair-color": hairColor,
        "--ts-avatar-skin": skinColor,
        ...getEquipmentSkinVars(equipment, { showHelmet })
    } as CSSProperties;
    const panelStyle = {
        "--ts-skin-background": skillBackgroundUrl ? `url("${skillBackgroundUrl}")` : "none"
    } as CSSProperties;
    return (
        <section className="generic-panel ts-panel ts-panel-skin" style={panelStyle}>
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
