import type { SkillId } from "../../core/types";

const SKILL_BACKGROUNDS: Record<SkillId, string> = {
    CombatMelee: "combat",
    CombatRanged: "combat",
    CombatMagic: "combat",
    Roaming: "roaming",
    Hunting: "hunting",
    Cooking: "cooking",
    Excavation: "excavation",
    MetalWork: "metalwork",
    Alchemy: "alchemy",
    Herbalism: "herbalism",
    Tailoring: "tailoring",
    Fishing: "fishing",
    Carpentry: "carpentry",
    Leatherworking: "tanning",
    Invocation: "invocation"
};

export const getSkillBackgroundUrl = (skillId: SkillId | "" | null | undefined): string | null => {
    if (!skillId) {
        return null;
    }
    const slug = SKILL_BACKGROUNDS[skillId];
    return slug ? `/img/backgrounds/${slug}.svg` : null;
};
