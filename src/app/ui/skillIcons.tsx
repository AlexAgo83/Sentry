import type { SkillId } from "../../core/types";
import type { ReactElement } from "react";

const skillIconStroke = {
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
} as const;

const SKILL_ICON_SHAPES: Record<SkillId, ReactElement> = {
    Combat: (
        <g {...skillIconStroke}>
            <path d="M20 44l12-12" />
            <path d="M44 44l-12-12" />
            <path d="M18 46l6 6" />
            <path d="M46 46l-6 6" />
            <circle cx="20" cy="44" r="2" />
            <circle cx="44" cy="44" r="2" />
        </g>
    ),
    Hunting: (
        <g {...skillIconStroke}>
            <circle cx="40" cy="24" r="6" />
            <circle cx="40" cy="24" r="2" />
            <path d="M16 48l18-18" />
            <path d="M34 30l10-4l-4 10" />
        </g>
    ),
    Cooking: (
        <g {...skillIconStroke}>
            <rect x="18" y="30" width="28" height="14" rx="3" />
            <path d="M22 26h20" />
            <path d="M28 22h8" />
            <path d="M24 16c-2 4 2 6 0 10" />
            <path d="M32 14c-2 4 2 6 0 10" />
            <path d="M40 16c-2 4 2 6 0 10" />
        </g>
    ),
    Excavation: (
        <g {...skillIconStroke}>
            <path d="M22 42l20-20" />
            <path d="M42 18c-8 0-16 6-20 12" />
            <path d="M18 46l6 6" />
        </g>
    ),
    MetalWork: (
        <g {...skillIconStroke}>
            <path d="M18 28h20l6 6h-32z" />
            <path d="M18 34h28l-4 10H22z" />
            <path d="M30 22h14" />
        </g>
    ),
    Alchemy: (
        <g {...skillIconStroke}>
            <path d="M22 12h20" />
            <path d="M26 12v8l-8 14c0 6 6 10 14 10s14-4 14-10l-8-14v-8" />
            <path d="M24 30h16" />
        </g>
    ),
    Herbalism: (
        <g {...skillIconStroke}>
            <path d="M18 40c12-16 28-16 28 0c-8 8-20 8-28 0z" />
            <path d="M32 20v20" />
        </g>
    ),
    Tailoring: (
        <g {...skillIconStroke}>
            <path d="M22 46l20-20" />
            <circle cx="44" cy="22" r="3" />
            <path d="M18 48c-6 4-4 10 4 10" />
        </g>
    ),
    Fishing: (
        <g {...skillIconStroke}>
            <path d="M32 10v18" />
            <path d="M32 28c0 8-10 8-10 2" />
            <path d="M42 38c6-4 10-4 14 0c-4 4-8 4-14 0z" />
        </g>
    ),
    Carpentry: (
        <g {...skillIconStroke}>
            <rect x="28" y="16" width="14" height="8" rx="2" />
            <path d="M30 24l-12 18" />
            <path d="M22 38l4 4" />
        </g>
    ),
    Leatherworking: (
        <g {...skillIconStroke}>
            <path d="M20 14c-4 0-6 4-4 8l2 6l-2 8c-2 6 4 10 10 8l6-2l6 2c6 2 12-2 10-8l-2-8l2-6c2-4 0-8-4-8l-4 2l-6-2l-6 2z" />
        </g>
    ),
    Invocation: (
        <g {...skillIconStroke}>
            <rect x="20" y="10" width="24" height="40" rx="4" />
            <path d="M26 20h12" />
            <path d="M26 28h12" />
            <path d="M26 36h12" />
            <path d="M30 44l4-6l4 6" />
        </g>
    )
};

const getSkillIconShape = (skillId: SkillId | ""): ReactElement => {
    if (!skillId) {
        return (
            <g {...skillIconStroke}>
                <circle cx="32" cy="32" r="12" />
                <path d="M32 20v24" />
                <path d="M20 32h24" />
            </g>
        );
    }
    return SKILL_ICON_SHAPES[skillId];
};

export const SkillIcon = ({ skillId, color }: { skillId: SkillId | ""; color: string }) => (
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" style={{ color }}>
        <rect x="6" y="6" width="52" height="52" rx="12" fill="none" stroke={color} strokeWidth="4" />
        {getSkillIconShape(skillId)}
    </svg>
);
