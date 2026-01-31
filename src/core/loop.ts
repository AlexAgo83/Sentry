import { getActionDefinition, getRecipeDefinition, isRecipeUnlocked } from "../data/definitions";
import { getEquipmentModifiers } from "../data/equipment";
import { QUEST_CRAFT_ITEM_IDS, QUEST_DEFINITIONS, getQuestProgress, getSharedSkillLevels } from "../data/quests";
import { createActionProgress } from "./state";
import {
    DEFAULT_STAMINA_MAX,
    DEFAULT_STAMINA_REGEN,
    MIN_ACTION_INTERVAL_MS,
    MIN_STAMINA_COST,
    STAT_PERCENT_PER_POINT,
    XP_NEXT_MULTIPLIER
} from "./constants";
import { resolveEffectiveStats } from "./stats";
import {
    GameState,
    InventoryState,
    ItemDelta,
    PlayerId,
    PlayerState,
    RecipeState,
    SkillState,
    SkillId,
    TickSummaryState
} from "./types";

const clampProgress = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(100, value));
};

type LevelState = Pick<SkillState, "xp" | "xpNext" | "level" | "maxLevel">;

const applyLevelUps = <T extends LevelState>(entity: T): T => {
    let xp = entity.xp;
    let xpNext = entity.xpNext;
    let level = entity.level;

    while (xp >= xpNext && level < entity.maxLevel) {
        xp -= xpNext;
        level += 1;
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
    }

    return {
        ...entity,
        xp,
        xpNext,
        level
    };
};

const addItemDelta = (target: ItemDelta, itemId: string, amount: number) => {
    if (!amount) {
        return;
    }
    target[itemId] = (target[itemId] ?? 0) + amount;
};

const STRENGTH_SKILLS = new Set<SkillId>(["Combat", "Hunting", "Excavation", "MetalWork"]);
const INTELLECT_SKILLS = new Set<SkillId>([
    "Cooking",
    "Alchemy",
    "Herbalism",
    "Tailoring",
    "Carpentry",
    "Invocation"
]);
const LUCK_SKILLS = new Set<SkillId>(["Fishing"]);

const canAffordCosts = (inventory: InventoryState, costs?: ItemDelta): boolean => {
    if (!costs) {
        return true;
    }
    return Object.entries(costs).every(([itemId, amount]) => {
        const available = inventory.items[itemId] ?? 0;
        return available >= amount;
    });
};

const applyItemDelta = (
    inventory: InventoryState,
    deltas: ItemDelta | undefined,
    multiplier: number,
    summary: ItemDelta
): InventoryState => {
    if (!deltas) {
        return inventory;
    }
    const nextItems = { ...inventory.items };
    Object.entries(deltas).forEach(([itemId, amount]) => {
        const change = amount * multiplier;
        const nextValue = (nextItems[itemId] ?? 0) + change;
        nextItems[itemId] = Math.max(0, nextValue);
        addItemDelta(summary, itemId, change);
    });
    return {
        ...inventory,
        items: nextItems
    };
};

const applyActionTick = (
    player: PlayerState,
    inventory: InventoryState,
    deltaMs: number,
    timestamp: number
): { player: PlayerState; inventory: InventoryState; itemDeltas: ItemDelta } => {
    const equipmentModifiers = getEquipmentModifiers(player.equipment);
    const { stats: cleanedStats, effective } = resolveEffectiveStats(player.stats, timestamp, equipmentModifiers);
    const staminaMax = Math.ceil(DEFAULT_STAMINA_MAX * (1 + effective.Endurance * STAT_PERCENT_PER_POINT));
    const regenRate = DEFAULT_STAMINA_REGEN * (1 + effective.Endurance * STAT_PERCENT_PER_POINT);
    const regenAmount = Math.floor((deltaMs / 1000) * regenRate);
    let stamina = Math.min(staminaMax, Math.max(0, player.stamina + regenAmount));
    let nextPlayer: PlayerState = {
        ...player,
        stats: cleanedStats,
        staminaMax,
        stamina
    };

    if (!player.selectedActionId) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }

    const actionDef = getActionDefinition(player.selectedActionId);
    if (!actionDef) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }

    const skill = player.skills[actionDef.skillId];
    if (!skill) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }

    const selectedRecipeId = skill.selectedRecipeId;
    if (!selectedRecipeId) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }

    const recipe = skill.recipes[selectedRecipeId];
    if (!recipe) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }
    const recipeDef = getRecipeDefinition(actionDef.skillId, selectedRecipeId);
    if (recipeDef && !isRecipeUnlocked(recipeDef, skill.level)) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }

    const intervalMultiplier = 1 - effective.Agility * STAT_PERCENT_PER_POINT;
    const baseInterval = Math.ceil(skill.baseInterval * intervalMultiplier);
    const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval)
        + (stamina <= 0 ? actionDef.stunTime : 0);
    if (actionInterval <= 0) {
        return { player: nextPlayer, inventory, itemDeltas: {} };
    }

    let currentInterval = player.actionProgress.currentInterval + deltaMs;
    const completedActions = Math.floor(currentInterval / actionInterval);
    currentInterval %= actionInterval;

    const staminaCostMultiplier = STRENGTH_SKILLS.has(actionDef.skillId)
        ? 1 - effective.Strength * STAT_PERCENT_PER_POINT
        : 1;
    const staminaCost = Math.max(MIN_STAMINA_COST, Math.ceil(actionDef.staminaCost * staminaCostMultiplier));
    const xpMultiplier = INTELLECT_SKILLS.has(actionDef.skillId)
        ? 1 + effective.Intellect * STAT_PERCENT_PER_POINT
        : 1;
    const luckChance = LUCK_SKILLS.has(actionDef.skillId)
        ? Math.min(0.25, effective.Luck * 0.005)
        : 0;
    let nextSkill: SkillState = { ...skill };
    let nextRecipe: RecipeState = { ...recipe };

    let nextInventory = inventory;
    const itemDeltas: ItemDelta = {};
    let completedCount = 0;
    let shouldStop = false;

    if (completedActions > 0) {
        for (let i = 0; i < completedActions; i += 1) {
            if (stamina <= 0) {
                stamina = nextPlayer.staminaMax;
            }
            const itemCosts = recipeDef?.itemCosts ?? actionDef.itemCosts;
            const itemRewards = recipeDef?.itemRewards ?? actionDef.itemRewards;
            const rareRewards = recipeDef?.rareRewards ?? actionDef.rareRewards;
            const goldReward = recipeDef?.goldReward ?? actionDef.goldReward;
            if (!canAffordCosts(nextInventory, itemCosts)) {
                shouldStop = true;
                break;
            }
            nextInventory = applyItemDelta(nextInventory, itemCosts, -1, itemDeltas);
            if (goldReward) {
                nextInventory = applyItemDelta(nextInventory, { gold: goldReward }, 1, itemDeltas);
            }
            nextInventory = applyItemDelta(nextInventory, itemRewards, 1, itemDeltas);
            if (rareRewards && luckChance > 0 && Math.random() < luckChance) {
                nextInventory = applyItemDelta(nextInventory, rareRewards, 1, itemDeltas);
            }
            stamina -= staminaCost;
            nextSkill = { ...nextSkill, xp: nextSkill.xp + actionDef.xpSkill * xpMultiplier };
            nextRecipe = { ...nextRecipe, xp: nextRecipe.xp + actionDef.xpRecipe * xpMultiplier };
            nextSkill = applyLevelUps(nextSkill);
            nextRecipe = applyLevelUps(nextRecipe);
            completedCount += 1;
        }

        nextPlayer = {
            ...nextPlayer,
            stamina
        };
    }

    const applyTabletCharges = (candidate: PlayerState, count: number): PlayerState => {
        if (count <= 0) {
            return candidate;
        }
        const tabletId = candidate.equipment.slots.Tablet;
        if (!tabletId) {
            return candidate;
        }
        const currentCharges = candidate.equipment.charges.Tablet;
        const resolvedCharges = typeof currentCharges === "number" && currentCharges > 0 ? currentCharges : 100;
        const nextCharges = Math.max(0, resolvedCharges - count);
        const nextEquipment = {
            ...candidate.equipment,
            slots: {
                ...candidate.equipment.slots,
                Tablet: nextCharges > 0 ? tabletId : null
            },
            charges: {
                ...candidate.equipment.charges,
                Tablet: nextCharges
            }
        };
        return {
            ...candidate,
            equipment: nextEquipment
        };
    };

    const progressPercent = clampProgress((currentInterval / actionInterval) * 100);
    const nextSkills = {
        ...nextPlayer.skills,
        [nextSkill.id]: {
            ...nextSkill,
            recipes: {
                ...nextSkill.recipes,
                [nextRecipe.id]: nextRecipe
            }
        }
    };

    if (shouldStop) {
        const updatedPlayer = applyTabletCharges(nextPlayer, completedCount);
        return {
            player: {
                ...updatedPlayer,
                skills: nextSkills,
                selectedActionId: null,
                actionProgress: createActionProgress()
            },
            inventory: nextInventory,
            itemDeltas
        };
    }

    const updatedPlayer = applyTabletCharges(nextPlayer, completedCount);

    return {
        player: {
            ...updatedPlayer,
            skills: nextSkills,
            actionProgress: {
                currentInterval,
                progressPercent,
                lastExecutionTime: completedCount > 0 ? timestamp : nextPlayer.actionProgress.lastExecutionTime
            }
        },
        inventory: nextInventory,
        itemDeltas
    };
};

export const applyTick = (state: GameState, deltaMs: number, timestamp: number): GameState => {
    const sortedIds = Object.keys(state.players).sort((a, b) => Number(a) - Number(b));
    const players = {} as Record<PlayerId, PlayerState>;
    let inventory = state.inventory;
    const totalItemDeltas: ItemDelta = {};
    const playerItemDeltas: Record<PlayerId, ItemDelta> = {};

    sortedIds.forEach((id) => {
        const player = state.players[id];
        const result = applyActionTick(player, inventory, deltaMs, timestamp);
        players[id] = result.player;
        inventory = result.inventory;
        if (Object.keys(result.itemDeltas).length > 0) {
            playerItemDeltas[id] = result.itemDeltas;
            Object.entries(result.itemDeltas).forEach(([itemId, amount]) => {
                addItemDelta(totalItemDeltas, itemId, amount);
            });
        }
    });

    const lastTickSummary: TickSummaryState = {
        totalItemDeltas,
        playerItemDeltas
    };

    const nextCraftCounts = { ...state.quests.craftCounts };
    Object.entries(totalItemDeltas).forEach(([itemId, amount]) => {
        if (!QUEST_CRAFT_ITEM_IDS.has(itemId) || amount <= 0) {
            return;
        }
        nextCraftCounts[itemId] = (nextCraftCounts[itemId] ?? 0) + amount;
    });

    const sharedSkillLevels = getSharedSkillLevels(players);
    const nextCompleted = { ...state.quests.completed };
    let questGoldReward = 0;

    QUEST_DEFINITIONS.forEach((quest) => {
        const progress = getQuestProgress(quest, nextCraftCounts, sharedSkillLevels);
        if (progress.isComplete && !nextCompleted[quest.id]) {
            nextCompleted[quest.id] = true;
            questGoldReward += quest.rewardGold;
        }
    });

    if (questGoldReward > 0) {
        inventory = applyItemDelta(inventory, { gold: questGoldReward }, 1, totalItemDeltas);
    }

    return {
        ...state,
        players,
        inventory,
        quests: {
            craftCounts: nextCraftCounts,
            completed: nextCompleted
        },
        loop: {
            ...state.loop,
            lastTick: timestamp
        },
        lastTickSummary
    };
};
