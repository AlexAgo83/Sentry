import { getActionDefinition, getRecipeDefinition, isRecipeUnlocked } from "../data/definitions";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType, getEquipmentModifiers } from "../data/equipment";
import {
    QUEST_COLLECT_ITEM_IDS,
    QUEST_CRAFT_ITEM_IDS,
    QUEST_DEFINITIONS,
    getQuestProgress,
    getSharedSkillLevels
} from "../data/quests";
import { createActionProgress } from "./state";
import { applyProgressionDelta, createProgressionState } from "./progression";
import {
    DEFAULT_HP_MAX,
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
    SkillId
} from "./types";
import { hashStringToSeed, seededRandom } from "./rng";
import { applyDungeonTick, getActiveDungeonRuns } from "./dungeon";

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

const STRENGTH_SKILLS = new Set<SkillId>([
    "CombatMelee",
    "CombatRanged",
    "CombatMagic",
    "Roaming",
    "Hunting",
    "Excavation",
    "MetalWork"
]);
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
): {
    player: PlayerState;
    inventory: InventoryState;
    itemDeltas: ItemDelta;
    xpGained: number;
    activeMs: number;
    idleMs: number;
    skillId: SkillId | null;
} => {
    const equipmentModifiers = getEquipmentModifiers(player.equipment);
    const { stats: cleanedStats, effective } = resolveEffectiveStats(player.stats, timestamp, equipmentModifiers);
    const hpMax = Math.ceil(DEFAULT_HP_MAX * (1 + effective.Endurance * STAT_PERCENT_PER_POINT));
    const hp = Math.max(0, Math.min(player.hp, hpMax));
    const staminaMax = Math.ceil(DEFAULT_STAMINA_MAX * (1 + effective.Endurance * STAT_PERCENT_PER_POINT));
    const regenRate = DEFAULT_STAMINA_REGEN * (1 + effective.Endurance * STAT_PERCENT_PER_POINT);
    const regenAmount = Math.floor((deltaMs / 1000) * regenRate);
    let stamina = Math.min(staminaMax, Math.max(0, player.stamina + regenAmount));
    let nextPlayer: PlayerState = {
        ...player,
        stats: cleanedStats,
        hpMax,
        hp,
        staminaMax,
        stamina
    };

    const idleResult = {
        player: nextPlayer,
        inventory,
        itemDeltas: {},
        xpGained: 0,
        activeMs: 0,
        idleMs: deltaMs,
        skillId: null
    };

    if (!player.selectedActionId) {
        return idleResult;
    }

    const actionDef = getActionDefinition(player.selectedActionId);
    if (!actionDef) {
        return idleResult;
    }

    const skill = player.skills[actionDef.skillId];
    if (!skill) {
        return idleResult;
    }

    const selectedRecipeId = skill.selectedRecipeId;
    if (!selectedRecipeId) {
        return idleResult;
    }

    const recipe = skill.recipes[selectedRecipeId];
    if (!recipe) {
        return idleResult;
    }
    const recipeDef = getRecipeDefinition(actionDef.skillId, selectedRecipeId);
    if (recipeDef && !isRecipeUnlocked(recipeDef, skill.level)) {
        return idleResult;
    }

    const intervalMultiplier = 1 - effective.Agility * STAT_PERCENT_PER_POINT;
    const baseInterval = Math.ceil(skill.baseInterval * intervalMultiplier);
    const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval)
        + (stamina <= 0 ? actionDef.stunTime : 0);
    if (actionInterval <= 0) {
        return idleResult;
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

    const rareSeed = hashStringToSeed(`${player.id}-${timestamp}-${actionDef.skillId}-${recipe.id}`);
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
            if (rareRewards && luckChance > 0 && seededRandom(rareSeed + i) < luckChance) {
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

    const xpPerAction = (actionDef.xpSkill + actionDef.xpRecipe) * xpMultiplier;
    const xpGained = completedCount * xpPerAction;
    const activeResultBase = {
        xpGained,
        activeMs: deltaMs,
        idleMs: 0,
        skillId: actionDef.skillId
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
            itemDeltas,
            ...activeResultBase
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
        itemDeltas,
        ...activeResultBase
    };
};

export const applyTick = (state: GameState, deltaMs: number, timestamp: number): GameState => {
    const sortedIds = Object.keys(state.players).sort((a, b) => Number(a) - Number(b));
    const activeDungeonRuns = getActiveDungeonRuns(state.dungeon);
    const lockedDungeonPlayerIds = new Set(
        activeDungeonRuns.flatMap((run) => run.party.map((member) => member.playerId))
    );
    const players = {} as Record<PlayerId, PlayerState>;
    let inventory = state.inventory;
    const totalItemDeltas: ItemDelta = {};
    const playerItemDeltas: Record<PlayerId, ItemDelta> = {};
    const nextItemCounts = { ...state.quests.itemCounts };
    const nextItemCountsBySkill = { ...state.quests.itemCountsBySkill };
    let totalXpGained = 0;
    let totalActiveMs = 0;
    let totalIdleMs = 0;
    const skillActiveMs: Partial<Record<SkillId, number>> = {};

    sortedIds.forEach((id) => {
        const player = state.players[id];
        const isLockedInDungeon = lockedDungeonPlayerIds.has(id);
        const playerForTick = isLockedInDungeon
            ? { ...player, selectedActionId: null }
            : player;
        const result = applyActionTick(playerForTick, inventory, deltaMs, timestamp);
        const progressionDelta = isLockedInDungeon
            ? {
                xpGained: 0,
                activeMs: 0,
                idleMs: 0,
                skillId: null as SkillId | null
            }
            : {
                xpGained: result.xpGained,
                activeMs: result.activeMs,
                idleMs: result.idleMs,
                skillId: result.skillId
            };
        const playerSkillActiveMs: Partial<Record<SkillId, number>> = {};
        if (progressionDelta.skillId && progressionDelta.activeMs > 0) {
            playerSkillActiveMs[progressionDelta.skillId] = progressionDelta.activeMs;
        }
        const playerProgression = applyProgressionDelta(
            player.progression ?? createProgressionState(timestamp),
            {
                xp: progressionDelta.xpGained,
                gold: result.itemDeltas.gold ?? 0,
                activeMs: progressionDelta.activeMs,
                idleMs: progressionDelta.idleMs,
                skillActiveMs: playerSkillActiveMs
            },
            timestamp
        );
        players[id] = { ...result.player, progression: playerProgression };
        inventory = result.inventory;
        totalXpGained += progressionDelta.xpGained;
        totalActiveMs += progressionDelta.activeMs;
        totalIdleMs += progressionDelta.idleMs;
        if (progressionDelta.skillId && progressionDelta.activeMs > 0) {
            const current = skillActiveMs[progressionDelta.skillId] ?? 0;
            skillActiveMs[progressionDelta.skillId] = current + progressionDelta.activeMs;
        }
        if (Object.keys(result.itemDeltas).length > 0) {
            playerItemDeltas[id] = result.itemDeltas;
            Object.entries(result.itemDeltas).forEach(([itemId, amount]) => {
                addItemDelta(totalItemDeltas, itemId, amount);
                if (amount <= 0 || !QUEST_COLLECT_ITEM_IDS.has(itemId)) {
                    return;
                }
                nextItemCounts[itemId] = (nextItemCounts[itemId] ?? 0) + amount;
                if (result.skillId) {
                    const skillCounts = nextItemCountsBySkill[result.skillId]
                        ? { ...nextItemCountsBySkill[result.skillId] }
                        : {};
                    skillCounts[itemId] = (skillCounts[itemId] ?? 0) + amount;
                    nextItemCountsBySkill[result.skillId] = skillCounts;
                }
            });
        }
    });

    const nextCraftCounts = { ...state.quests.craftCounts };
    Object.entries(totalItemDeltas).forEach(([itemId, amount]) => {
        if (!QUEST_CRAFT_ITEM_IDS.has(itemId) || amount <= 0) {
            return;
        }
        nextCraftCounts[itemId] = (nextCraftCounts[itemId] ?? 0) + amount;
    });

    const dungeonResult = applyDungeonTick(
        {
            ...state,
            players,
            inventory
        },
        deltaMs,
        timestamp
    );
    let nextPlayers = dungeonResult.state.players;
    inventory = dungeonResult.state.inventory;
    Object.entries(dungeonResult.itemDeltas).forEach(([itemId, amount]) => {
        addItemDelta(totalItemDeltas, itemId, amount);
    });
    const dungeonItemDeltasByPlayer: Record<PlayerId, ItemDelta> = {};
    const dungeonGold = dungeonResult.itemDeltas.gold ?? 0;
    if (Number.isFinite(dungeonGold) && dungeonGold > 0) {
        const dungeonPartyIds = Array.from(new Set(
            activeDungeonRuns.flatMap((run) => run.party.map((member) => member.playerId))
        ));
        if (dungeonPartyIds.length > 0) {
            const baseShare = Math.floor(dungeonGold / dungeonPartyIds.length);
            let remainder = dungeonGold - baseShare * dungeonPartyIds.length;
            dungeonPartyIds.forEach((playerId) => {
                const share = baseShare + (remainder > 0 ? 1 : 0);
                if (remainder > 0) {
                    remainder -= 1;
                }
                if (share > 0) {
                    dungeonItemDeltasByPlayer[playerId] = { gold: share };
                }
            });
        }
    }
    const dungeonProgressPlayerIds = new Set([
        ...Object.keys(dungeonResult.combatActiveMsByPlayer),
        ...Object.keys(dungeonResult.combatXpByPlayer),
        ...Object.keys(dungeonItemDeltasByPlayer)
    ]);
    dungeonProgressPlayerIds.forEach((playerId) => {
        const typedPlayerId = playerId as PlayerId;
        const activeMs = dungeonResult.combatActiveMsByPlayer[typedPlayerId] ?? 0;
        const xpBySkill = dungeonResult.combatXpByPlayer[typedPlayerId] ?? {};
        const xp = Object.values(xpBySkill).reduce((sum, value) => {
            const numeric = Number.isFinite(value) ? value : 0;
            return sum + (numeric > 0 ? numeric : 0);
        }, 0);
        const dungeonGoldShare = dungeonItemDeltasByPlayer[typedPlayerId]?.gold ?? 0;
        if (
            (!Number.isFinite(activeMs) || activeMs <= 0)
            && (!Number.isFinite(xp) || xp <= 0)
            && (!Number.isFinite(dungeonGoldShare) || dungeonGoldShare <= 0)
        ) {
            return;
        }
        const player = nextPlayers[typedPlayerId];
        if (!player) {
            return;
        }
        const combatSkillId = getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment));
        const playerSkillActiveMs: Partial<Record<SkillId, number>> = activeMs > 0
            ? { [combatSkillId]: activeMs }
            : {};
        nextPlayers = {
            ...nextPlayers,
            [typedPlayerId]: {
                ...player,
                progression: applyProgressionDelta(
                    player.progression ?? createProgressionState(timestamp),
                    {
                        xp,
                        gold: dungeonGoldShare,
                        activeMs,
                        idleMs: 0,
                        skillActiveMs: playerSkillActiveMs
                    },
                    timestamp
                )
            }
        };
        if (xp > 0) {
            totalXpGained += xp;
        }
        if (activeMs > 0) {
            totalActiveMs += activeMs;
            skillActiveMs[combatSkillId] = (skillActiveMs[combatSkillId] ?? 0) + activeMs;
        }
    });

    const sharedSkillLevels = getSharedSkillLevels(nextPlayers);
    const nextCompleted = { ...state.quests.completed };
    let questGoldReward = 0;
    const dungeonCompletionCounts = dungeonResult.state.dungeon.completionCounts ?? {};

    QUEST_DEFINITIONS.forEach((quest) => {
        const progress = getQuestProgress(
            quest,
            nextCraftCounts,
            sharedSkillLevels,
            nextItemCounts,
            dungeonCompletionCounts,
            nextItemCountsBySkill
        );
        if (progress.isComplete && !nextCompleted[quest.id]) {
            nextCompleted[quest.id] = true;
            questGoldReward += quest.rewardGold;
        }
    });

    if (questGoldReward > 0) {
        inventory = applyItemDelta(inventory, { gold: questGoldReward }, 1, totalItemDeltas);
    }

    const goldDelta = totalItemDeltas.gold ?? 0;
    const progression = applyProgressionDelta(
        state.progression ?? createProgressionState(timestamp),
        {
            xp: totalXpGained,
            gold: goldDelta,
            activeMs: totalActiveMs,
            idleMs: totalIdleMs,
            skillActiveMs
        },
        timestamp
    );

    return {
        ...state,
        players: nextPlayers,
        inventory,
        quests: {
            craftCounts: nextCraftCounts,
            itemCounts: nextItemCounts,
            itemCountsBySkill: nextItemCountsBySkill,
            completed: nextCompleted
        },
        loop: {
            ...state.loop,
            lastTick: timestamp
        },
        progression,
        lastTickSummary: {
            totalItemDeltas,
            playerItemDeltas,
            dungeonItemDeltas: dungeonResult.itemDeltas,
            dungeonItemDeltasByPlayer,
            dungeonCombatXpByPlayer: dungeonResult.combatXpByPlayer
        },
        dungeon: dungeonResult.state.dungeon
    };
};
