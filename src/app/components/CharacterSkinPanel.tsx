import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";

type CharacterSkinPanelProps = {
    avatarColor: string;
    avatarSkillId: SkillId | null;
    isPlaceholder: boolean;
};

export const CharacterSkinPanel = memo(({
    avatarColor,
    avatarSkillId,
    isPlaceholder
}: CharacterSkinPanelProps) => {
    const avatarStyle = {
        "--ts-avatar-torso": avatarColor
    } as CSSProperties;
    const avatarClassName = `ts-player-avatar ts-player-avatar--large${isPlaceholder ? " is-placeholder" : ""}`;

    return (
        <section className="generic-panel ts-panel ts-panel-skin">
            <div className="ts-skin-panel">
                <div className={avatarClassName} style={avatarStyle} aria-hidden="true">
                    <span className="ts-player-avatar-layer ts-player-avatar-legs" />
                    <span className="ts-player-avatar-layer ts-player-avatar-head" />
                    <span className="ts-player-avatar-layer ts-player-avatar-torso" />
                    <span className="ts-player-avatar-layer ts-player-avatar-hands" />
                    <span className="ts-player-avatar-layer ts-player-avatar-feets" />
                    {avatarSkillId ? (
                        <span className="ts-player-avatar-skill">
                            <SkillIcon skillId={avatarSkillId} color="#0c111c" />
                        </span>
                    ) : null}
                </div>
                <div className="ts-skin-caption">Hero skin</div>
            </div>
        </section>
    );
});

CharacterSkinPanel.displayName = "CharacterSkinPanel";
