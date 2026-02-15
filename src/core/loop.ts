import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../data/equipment";
import {
    QUEST_COLLECT_ITEM_IDS,
    QUEST_CRAFT_ITEM_IDS,
    QUEST_DEFINITIONS,
    getQuestProgress,
    getSharedSkillLevels
} from "../data/quests";
import { applyProgressionDelta, createProgressionState } from "./progression";
import {
    GameState,
    ItemDelta,
    PlayerId,
    PlayerState,
    SkillId
} from "./types";
import { applyDungeonTick, getActiveDungeonRuns } from "./dungeon";
import { addItemDelta, applyActionTick, applyItemDelta } from "./loop/actionTick";

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
