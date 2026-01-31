import type { SkillId } from "../../core/types";
const SKILL_ICON_PATH = `${__ASSETS_PATH__}icons/skills/`;

const getSkillIconUrl = (skillId: SkillId | "") =>
    `${SKILL_ICON_PATH}${skillId ? skillId : "default"}.svg`;

export const SkillIcon = ({ skillId, color }: { skillId: SkillId | ""; color: string }) => (
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" style={{ color }}>
        <rect x="6" y="6" width="52" height="52" rx="12" fill="none" stroke={color} strokeWidth="4" />
        <use href={`${getSkillIconUrl(skillId)}#icon`} />
    </svg>
);
