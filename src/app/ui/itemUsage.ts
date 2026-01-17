import { ITEM_DEFINITIONS, SKILL_DEFINITIONS, getActionDefinition, getRecipesForSkill } from "../../data/definitions";

export type ItemUsage = {
    usedBy: string[];
    obtainedBy: string[];
};

const addUsageLabel = (target: string[], label: string) => {
    if (!target.includes(label)) {
        target.push(label);
    }
};

const addItemUsage = (
    usageMap: Record<string, ItemUsage>,
    itemId: string,
    bucket: keyof ItemUsage,
    label: string
) => {
    const entry = usageMap[itemId];
    if (!entry) {
        return;
    }
    addUsageLabel(entry[bucket], label);
};

const buildItemUsageMap = (): Record<string, ItemUsage> => {
    const usage = ITEM_DEFINITIONS.reduce<Record<string, ItemUsage>>((acc, item) => {
        acc[item.id] = { usedBy: [], obtainedBy: [] };
        return acc;
    }, {});

    SKILL_DEFINITIONS.forEach((skill) => {
        const actionDef = getActionDefinition(skill.id);
        if (actionDef?.itemCosts) {
            Object.keys(actionDef.itemCosts).forEach((itemId) => {
                addItemUsage(usage, itemId, "usedBy", `Action: ${skill.name}`);
            });
        }
        if (actionDef?.itemRewards) {
            Object.keys(actionDef.itemRewards).forEach((itemId) => {
                addItemUsage(usage, itemId, "obtainedBy", `Action: ${skill.name}`);
            });
        }
        if (actionDef?.goldReward) {
            addItemUsage(usage, "gold", "obtainedBy", `Action: ${skill.name}`);
        }

        getRecipesForSkill(skill.id).forEach((recipe) => {
            const label = `${skill.name} - ${recipe.name}`;
            if (recipe.itemCosts) {
                Object.keys(recipe.itemCosts).forEach((itemId) => {
                    addItemUsage(usage, itemId, "usedBy", label);
                });
            }
            if (recipe.itemRewards) {
                Object.keys(recipe.itemRewards).forEach((itemId) => {
                    addItemUsage(usage, itemId, "obtainedBy", label);
                });
            }
            if (recipe.goldReward) {
                addItemUsage(usage, "gold", "obtainedBy", label);
            }
        });
    });

    return usage;
};

export const ITEM_USAGE_MAP = buildItemUsageMap();
