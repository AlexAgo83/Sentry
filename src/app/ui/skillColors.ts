import type { SkillId } from "../../core/types";

const SKILL_ICON_COLORS: Record<SkillId, string> = {
    Combat: "#f2c14e",
    Hunting: "#5dd9c1",
    Cooking: "#f07f4f",
    Excavation: "#9aa7c3",
    MetalWork: "#c68130",
    Alchemy: "#7fd1b9",
    Herbalism: "#8ac926",
    Tailoring: "#f4d35e",
    Fishing: "#4cc9f0",
    Carpentry: "#c97c5d",
    Leatherworking: "#a26769",
    Invocation: "#6f93ff"
};

const DEFAULT_SKILL_COLOR = "#f2c14e";
const IDLE_SKILL_COLOR = "#5d6a82";

export const getSkillIconColor = (skillId: SkillId | "" | null | undefined): string => {
    if (!skillId) {
        return IDLE_SKILL_COLOR;
    }
    return SKILL_ICON_COLORS[skillId] ?? DEFAULT_SKILL_COLOR;
};
