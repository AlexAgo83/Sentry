import { getActionDefinition, getRecipeDefinition, isRecipeUnlocked } from "../data/definitions";
import { createActionProgress } from "./state";
import { XP_NEXT_MULTIPLIER } from "./constants";
import {
    GameState,
    InventoryState,
    ItemDelta,
    PlayerId,
    PlayerState,
    RecipeState,
    SkillState,
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
    if (!player.selectedActionId) {
        return { player, inventory, itemDeltas: {} };
    }

    const actionDef = getActionDefinition(player.selectedActionId);
    if (!actionDef) {
        return { player, inventory, itemDeltas: {} };
    }

    const skill = player.skills[actionDef.skillId];
    if (!skill) {
        return { player, inventory, itemDeltas: {} };
    }

    const selectedRecipeId = skill.selectedRecipeId;
    if (!selectedRecipeId) {
        return { player, inventory, itemDeltas: {} };
    }

    const recipe = skill.recipes[selectedRecipeId];
    if (!recipe) {
        return { player, inventory, itemDeltas: {} };
    }
    const recipeDef = getRecipeDefinition(actionDef.skillId, selectedRecipeId);
    if (recipeDef && !isRecipeUnlocked(recipeDef, skill.level)) {
        return { player, inventory, itemDeltas: {} };
    }

    const actionInterval = skill.baseInterval + (player.stamina <= 0 ? actionDef.stunTime : 0);
    if (actionInterval <= 0) {
        return { player, inventory, itemDeltas: {} };
    }

    let currentInterval = player.actionProgress.currentInterval + deltaMs;
    const completedActions = Math.floor(currentInterval / actionInterval);
    currentInterval %= actionInterval;

    let nextPlayer = { ...player };
    let nextSkill: SkillState = { ...skill };
    let nextRecipe: RecipeState = { ...recipe };

    let nextInventory = inventory;
    const itemDeltas: ItemDelta = {};
    let completedCount = 0;
    let shouldStop = false;

    if (completedActions > 0) {
        let stamina = nextPlayer.stamina;

        for (let i = 0; i < completedActions; i += 1) {
            if (stamina <= 0) {
                stamina = nextPlayer.staminaMax;
            }
            const itemCosts = recipeDef?.itemCosts ?? actionDef.itemCosts;
            const itemRewards = recipeDef?.itemRewards ?? actionDef.itemRewards;
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
            stamina -= actionDef.staminaCost;
            nextSkill = { ...nextSkill, xp: nextSkill.xp + actionDef.xpSkill };
            nextRecipe = { ...nextRecipe, xp: nextRecipe.xp + actionDef.xpRecipe };
            nextSkill = applyLevelUps(nextSkill);
            nextRecipe = applyLevelUps(nextRecipe);
            completedCount += 1;
        }

        nextPlayer = {
            ...nextPlayer,
            stamina
        };
    }

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
        return {
            player: {
                ...nextPlayer,
                skills: nextSkills,
                selectedActionId: null,
                actionProgress: createActionProgress()
            },
            inventory: nextInventory,
            itemDeltas
        };
    }

    return {
        player: {
            ...nextPlayer,
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

    return {
        ...state,
        players,
        inventory,
        loop: {
            ...state.loop,
            lastTick: timestamp
        },
        lastTickSummary
    };
};
