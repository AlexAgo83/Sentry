import { useCallback, useMemo } from "react";
import { getRecipeDefinition, SKILL_DEFINITIONS } from "../../data/definitions";
import type { SkillId } from "../../core/types";

export const useAppLabels = () => {
    const skillNameById = useMemo(() => SKILL_DEFINITIONS.reduce<Record<string, string>>((acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
    }, {}), []);

    const getSkillLabel = useCallback((skillId: SkillId | ""): string => {
        if (!skillId) {
            return "None";
        }
        return skillNameById[skillId] ?? skillId;
    }, [skillNameById]);

    const getRecipeLabel = useCallback((skillId: SkillId, recipeId: string | null): string => {
        if (!recipeId) {
            return "none";
        }
        const recipeDef = getRecipeDefinition(skillId, recipeId);
        return recipeDef?.name ?? recipeId;
    }, []);

    const getSkillLabelStrict = useCallback((skillId: SkillId): string => getSkillLabel(skillId), [getSkillLabel]);
    const getRecipeLabelNonNull = useCallback(
        (skillId: SkillId, recipeId: string): string => getRecipeLabel(skillId, recipeId),
        [getRecipeLabel]
    );

    return {
        getSkillLabel,
        getSkillLabelStrict,
        getRecipeLabel,
        getRecipeLabelNonNull,
    };
};
