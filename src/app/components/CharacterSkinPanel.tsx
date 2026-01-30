import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";
import { getFaceUrlByIndex } from "../ui/heroFaces";
import { getHairColor, getHairUrlByIndex } from "../ui/heroHair";

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

type CharacterSkinPanelProps = {
    avatarColor: string;
    avatarSkillId: SkillId | null;
    faceIndex: number;
    hairIndex: number;
    hairSeed?: string | number | null;
    isPlaceholder: boolean;
    onRenameHero: () => void;
    canRenameHero: boolean;
    onNextFace: () => void;
    onNextHair: () => void;
};

export const CharacterSkinPanel = memo(({
    avatarColor,
    avatarSkillId,
    faceIndex,
    hairIndex,
    hairSeed,
    isPlaceholder,
    onRenameHero,
    canRenameHero,
    onNextFace,
    onNextHair
}: CharacterSkinPanelProps) => {
    const avatarStyle = {
        "--ts-avatar-torso": avatarColor,
        "--ts-avatar-face": `url("${getFaceUrlByIndex(faceIndex)}")`,
        "--ts-avatar-hair": `url("${getHairUrlByIndex(hairIndex)}")`,
        "--ts-avatar-hair-color": getHairColor(hairSeed ?? "default")
    } as CSSProperties;
    const avatarClassName = `ts-player-avatar ts-player-avatar--large${isPlaceholder ? " is-placeholder" : ""}`;

    return (
        <section className="generic-panel ts-panel ts-panel-skin">
            <div className="ts-panel-header">
                <div className="ts-panel-heading" />
                <div className="ts-panel-actions ts-panel-actions-inline">
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
                </div>
            </div>
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
            </div>
        </section>
    );
});

CharacterSkinPanel.displayName = "CharacterSkinPanel";
