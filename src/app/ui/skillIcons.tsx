import type { SkillId } from "../../core/types";
const SKILL_ICON_PATH = `${__ASSETS_PATH__}icons/skills/`;
const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

const getSkillIconUrl = (skillId: SkillId | "") =>
    `${SKILL_ICON_PATH}${skillId ? skillId : "default"}.svg`;

export const SkillIcon = ({ skillId, color }: { skillId: SkillId | ""; color: string }) => (
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" style={{ color }}>
        <use href={`${UI_ICON_PATH}skill-frame.svg#icon`} />
        <use href={`${getSkillIconUrl(skillId)}#icon`} />
    </svg>
);
