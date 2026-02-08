import { memo } from "react";
import type { CSSProperties } from "react";
import type { SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";

type AvatarProps = {
    style?: CSSProperties;
    variant?: "default" | "large";
    isPlaceholder?: boolean;
    className?: string;
    skillId?: SkillId | null;
    skillColor?: string;
};

export const Avatar = memo(({
    style,
    variant = "default",
    isPlaceholder = false,
    className,
    skillId = null,
    skillColor = "#0c111c"
}: AvatarProps) => {
    const classes = [
        "ts-player-avatar",
        variant === "large" ? "ts-player-avatar--large" : "",
        isPlaceholder ? "is-placeholder" : "",
        className ?? ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes} style={style} aria-hidden="true">
            <span className="ts-player-avatar-figure">
                <span className="ts-player-avatar-layer ts-player-avatar-base-body" />
                <span className="ts-player-avatar-layer ts-player-avatar-gear-cape" />
                <span className="ts-player-avatar-layer ts-player-avatar-legs" />
                <span className="ts-player-avatar-layer ts-player-avatar-gear-legs" />
                <span className="ts-player-avatar-layer ts-player-avatar-head" />
                <span className="ts-player-avatar-layer ts-player-avatar-face" />
                <span className="ts-player-avatar-layer ts-player-avatar-hair" />
                <span className="ts-player-avatar-layer ts-player-avatar-gear-head" />
                <span className="ts-player-avatar-layer ts-player-avatar-torso" />
                <span className="ts-player-avatar-layer ts-player-avatar-gear-torso" />
                <span className="ts-player-avatar-layer ts-player-avatar-hands" />
                <span className="ts-player-avatar-layer ts-player-avatar-gear-hands" />
                <span className="ts-player-avatar-layer ts-player-avatar-feets" />
                <span className="ts-player-avatar-layer ts-player-avatar-gear-feets" />
            </span>
            {skillId ? (
                <span className="ts-player-avatar-skill">
                    <SkillIcon skillId={skillId} color={skillColor} />
                </span>
            ) : null}
        </div>
    );
});

Avatar.displayName = "Avatar";
