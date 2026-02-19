import { getDungeonDefinition } from "../../data/dungeons";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType, getEquipmentModifiers } from "../../data/equipment";
import { hashStringToSeed, seededRandom } from "../rng";
import { resolveEffectiveStats } from "../stats";
import { XP_NEXT_MULTIPLIER } from "../constants";
import {
    BOSS_BASE_DAMAGE_MULTIPLIER,
    DUNGEON_ATTACK_INTERVAL_MAX_MS,
    DUNGEON_ATTACK_INTERVAL_MIN_MS,
    DUNGEON_BASE_ATTACK_MS,
} from "./constants";
import {
    applySkillLevelUps,
    floorMobDamage,
    floorMobHp,
    foodCostForFloor,
    getDungeonStartFoodCost,
    resolveHeroAttackIntervalMsForWeapon
} from "./formulas";
import { buildReplay, countNonCriticalEvents, pushEventWithGlobalCap } from "./replay";
import {
    addItemDelta,
    buildThreatByHeroId,
    buildThreatTieOrder,
    cloneInventory,
    getActiveDungeonRun,
    getActiveDungeonRunIds,
    getActiveDungeonRuns,
    getRunStorageInventorySnapshot,
    normalizeInventoryCount
} from "./state";
import type {
    CombatSkillId,
    DungeonCadenceSnapshotEntry,
    DungeonDefinition,
    DungeonRunEnemyState,
    DungeonRunEndReason,
    DungeonRunState,
    DungeonState,
    GameState,
    InventoryState,
    ItemDelta,
    PlayerId,
    PlayerState
} from "../types";

export const buildJournalEntryId = (timestamp: number) => {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${timestamp}-${suffix}`;
};

export const formatDungeonEndReason = (reason: string | null | undefined) => {
    if (!reason) {
        return "Ended";
    }
    return reason
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

export const resolveHeroEffectiveStats = (player: PlayerState, timestamp: number) => {
    const equipmentMods = player.equipment ? getEquipmentModifiers(player.equipment) : [];
    return resolveEffectiveStats(player.stats, timestamp, equipmentMods).effective;
};

export const buildCadenceSnapshot = (
    party: DungeonRunState["party"],
    players: Record<PlayerId, PlayerState>,
    timestamp: number,
    baseAttackMs: number
): DungeonCadenceSnapshotEntry[] => {
    return party.map((member) => {
        const player = players[member.playerId];
        const effective = player ? resolveHeroEffectiveStats(player, timestamp) : null;
        const agility = effective?.Agility ?? 0;
        const weaponType = player ? getEquippedWeaponType(player.equipment) : "Melee";
        return {
            playerId: member.playerId,
            baseAttackMs,
            agilityAtRunStart: agility,
            resolvedAttackIntervalMs: resolveHeroAttackIntervalMsForWeapon(baseAttackMs, agility, weaponType),
            minAttackMs: DUNGEON_ATTACK_INTERVAL_MIN_MS,
            maxAttackMs: DUNGEON_ATTACK_INTERVAL_MAX_MS
        };
    });
};

export const ensureRunCadenceState = (
    run: DungeonRunState,
    players: Record<PlayerId, PlayerState>,
    timestamp: number
) => {
    const baseAttackMs = DUNGEON_BASE_ATTACK_MS;
    const hasSnapshot = Array.isArray(run.cadenceSnapshot) && run.cadenceSnapshot.length > 0;
    if (!hasSnapshot) {
        run.party = run.party.map((member) => {
            const player = players[member.playerId];
            const effective = player ? resolveHeroEffectiveStats(player, timestamp) : null;
            const agility = effective?.Agility ?? 0;
            const weaponType = player ? getEquippedWeaponType(player.equipment) : "Melee";
            const attackIntervalMs = resolveHeroAttackIntervalMsForWeapon(baseAttackMs, agility, weaponType);
            return {
                ...member,
                attackCooldownMs: attackIntervalMs
            };
        });
        run.cadenceSnapshot = buildCadenceSnapshot(run.party, players, timestamp, baseAttackMs);
        return;
    }
    run.party = run.party.map((member) => {
        if (Number.isFinite(member.attackCooldownMs)) {
            return member;
        }
        const player = players[member.playerId];
        const effective = player ? resolveHeroEffectiveStats(player, timestamp) : null;
        const agility = effective?.Agility ?? 0;
        const weaponType = player ? getEquippedWeaponType(player.equipment) : "Melee";
        return {
            ...member,
            attackCooldownMs: resolveHeroAttackIntervalMsForWeapon(baseAttackMs, agility, weaponType)
        };
    });
};

export const ensureRunThreatState = (run: DungeonRunState) => {
    run.threatByHeroId = buildThreatByHeroId(run.party, run.threatByHeroId);
    if (!Array.isArray(run.threatTieOrder) || run.threatTieOrder.length === 0) {
        run.threatTieOrder = buildThreatTieOrder(run.seed, run.party.map((member) => member.playerId));
    }
    if (!Number.isFinite(run.nonCriticalEventCount)) {
        run.nonCriticalEventCount = countNonCriticalEvents(run.events ?? []);
    }
    if (typeof run.targetHeroId !== "string") {
        run.targetHeroId = null;
    }
};

export const grantCombatXpToParty = (
    players: Record<PlayerId, PlayerState>,
    party: DungeonRunState["party"],
    xp: number,
    combatXpByPlayer?: Record<PlayerId, Partial<Record<CombatSkillId, number>>>
) => {
    if (!Number.isFinite(xp) || xp <= 0) {
        return players;
    }

    const nextPlayers = { ...players };
    party.forEach((member) => {
        const player = nextPlayers[member.playerId];
        if (!player) {
            return;
        }
        const weaponType = getEquippedWeaponType(player.equipment);
        const combatSkillId = getCombatSkillIdForWeaponType(weaponType);
        const combatSkill = player.skills[combatSkillId];
        if (!combatSkill) {
            return;
        }
        const leveled = applySkillLevelUps(
            combatSkill.xp + xp,
            combatSkill.level,
            combatSkill.xpNext,
            combatSkill.maxLevel,
            XP_NEXT_MULTIPLIER
        );
        if (combatXpByPlayer) {
            const playerXp = combatXpByPlayer[member.playerId] ?? {};
            playerXp[combatSkillId] = (playerXp[combatSkillId] ?? 0) + xp;
            combatXpByPlayer[member.playerId] = playerXp;
        }
        nextPlayers[member.playerId] = {
            ...player,
            skills: {
                ...player.skills,
                [combatSkillId]: {
                    ...combatSkill,
                    xp: leveled.xp,
                    level: leveled.level,
                    xpNext: leveled.xpNext
                }
            }
        };
    });
    return nextPlayers;
};

const createEnemyWave = (
    definition: DungeonDefinition,
    floor: number,
    runSeed: number,
    runIndex: number
): DungeonRunEnemyState[] => {
    const mobNameAdjectives = [
        "Ashen",
        "Bitter",
        "Cinder",
        "Feral",
        "Gloom",
        "Grim",
        "Hollow",
        "Ragged",
        "Sly",
        "Wild"
    ];
    const mobNameTypes = [
        "Brute",
        "Crawler",
        "Gnoll",
        "Marauder",
        "Ravager",
        "Reaver",
        "Shade",
        "Skirmisher",
        "Stalker",
        "Wretch"
    ];
    const pickNamePart = (parts: string[], seed: number) => {
        const index = Math.floor(seededRandom(seed) * parts.length);
        return parts[Math.max(0, Math.min(parts.length - 1, index))];
    };
    const buildMobName = (seed: number, offset: number) => {
        const adjective = pickNamePart(mobNameAdjectives, seed + offset * 19);
        const type = pickNamePart(mobNameTypes, seed + offset * 37);
        return `${adjective} ${type}`;
    };

    const isBoss = floor === definition.floorCount;
    if (isBoss) {
        const hpBase = floorMobHp(definition.tier, floor);
        const dmgBase = floorMobDamage(definition.tier, floor);
        return [
            {
                id: `entity_${runIndex}_${floor}_1`,
                name: definition.bossName,
                hp: hpBase * 5,
                hpMax: hpBase * 5,
                damage: Math.max(1, Math.round(dmgBase * BOSS_BASE_DAMAGE_MULTIPLIER)),
                isBoss: true,
                mechanic: definition.bossMechanic,
                spawnIndex: 0
            }
        ];
    }

    const hp = floorMobHp(definition.tier, floor);
    const damage = floorMobDamage(definition.tier, floor);
    const count = Math.max(1, Math.min(3, 1 + Math.floor((floor - 1) / 4)));
    const enemies: DungeonRunEnemyState[] = [];
    for (let i = 0; i < count; i += 1) {
        const varianceSeed = runSeed + floor * 17 + i * 31;
        const hpVariance = 0.9 + seededRandom(varianceSeed) * 0.2;
        const dmgVariance = 0.9 + seededRandom(varianceSeed + 3) * 0.2;
        enemies.push({
            id: `entity_${runIndex}_${floor}_${i + 1}`,
            name: buildMobName(runSeed + floor * 101, i),
            hp: Math.max(1, Math.round(hp * hpVariance)),
            hpMax: Math.max(1, Math.round(hp * hpVariance)),
            damage: Math.max(1, Math.round(damage * dmgVariance)),
            isBoss: false,
            mechanic: null,
            spawnIndex: i
        });
    }
    return enemies;
};

export const withRecoveredHeroes = (players: Record<PlayerId, PlayerState>, party: DungeonRunState["party"]) => {
    const nextPlayers = { ...players };
    party.forEach((member) => {
        const player = nextPlayers[member.playerId];
        if (!player) {
            return;
        }
        nextPlayers[member.playerId] = {
            ...player,
            hp: player.hpMax
        };
    });
    return nextPlayers;
};

export const finalizeRun = (
    dungeon: DungeonState,
    run: DungeonRunState,
    players: Record<PlayerId, PlayerState>
): DungeonState => {
    const replay = buildReplay(run, players, run.startInventory);
    const completionCounts = { ...dungeon.completionCounts };
    if (run.status === "victory") {
        completionCounts[run.dungeonId] = (completionCounts[run.dungeonId] ?? 0) + 1;
    }
    const nextRuns = {
        ...dungeon.runs,
        [run.id]: {
            ...run,
            restartAt: null
        }
    };
    const nextActiveRunId = getActiveDungeonRunIds({
        ...dungeon,
        runs: nextRuns
    })[0] ?? null;
    return {
        ...dungeon,
        latestReplay: replay,
        activeRunId: nextActiveRunId,
        runs: nextRuns,
        completionCounts
    };
};

export const initializeFloor = (
    run: DungeonRunState,
    definition: DungeonDefinition,
    inventory: InventoryState,
    itemDeltas: ItemDelta
): { run: DungeonRunState; inventory: InventoryState } => {
    const nextInventory = cloneInventory(inventory);
    const cost = foodCostForFloor(definition.tier, run.floor, run.floorCount);
    const availableFood = normalizeInventoryCount(nextInventory.items.food);
    if (availableFood < cost) {
        nextInventory.items.food = Math.max(0, availableFood);
        run.status = "failed";
        run.endReason = "out_of_food";
        run.party = run.party.map((member) => ({ ...member, hp: 0 }));
        pushEventWithGlobalCap(run, {
            type: "run_end",
            label: "Out of food"
        });
        return { run, inventory: nextInventory };
    }

    nextInventory.items.food = availableFood - cost;
    addItemDelta(itemDeltas, "food", -cost);

    run.enemies = createEnemyWave(definition, run.floor, run.seed, run.runIndex);
    run.targetEnemyId = run.enemies[0]?.id ?? null;
    run.targetHeroId = null;
    run.threatByHeroId = buildThreatByHeroId(run.party);
    run.encounterStep = 0;
    pushEventWithGlobalCap(run, {
        type: "floor_start",
        label: `Floor ${run.floor}`
    });
    if (run.enemies[0]?.isBoss) {
        pushEventWithGlobalCap(run, {
            type: "boss_start",
            sourceId: run.enemies[0].id,
            label: run.enemies[0].name
        });
    }

    run.enemies.forEach((enemy) => {
        pushEventWithGlobalCap(run, {
            type: "spawn",
            sourceId: enemy.id,
            label: enemy.name
        });
    });

    return {
        run,
        inventory: nextInventory
    };
};

export const startDungeonRun = (
    state: GameState,
    dungeonId: string,
    partyPlayerIds: PlayerId[],
    timestamp: number
): GameState => {
    const definition = getDungeonDefinition(dungeonId);
    if (!definition) {
        return state;
    }
    const uniquePartyIds = Array.from(new Set(partyPlayerIds));
    if (uniquePartyIds.length !== 4) {
        return state;
    }
    const activeRuns = getActiveDungeonRuns(state.dungeon);

    const allPlayersPresent = uniquePartyIds.every((playerId) => Boolean(state.players[playerId]));
    if (!allPlayersPresent) {
        return state;
    }
    const assignedToActiveRuns = new Set(
        activeRuns.flatMap((run) => run.party.map((member) => member.playerId))
    );
    if (uniquePartyIds.some((playerId) => assignedToActiveRuns.has(playerId))) {
        return state;
    }
    const requiredFoodForStart = getDungeonStartFoodCost(definition);
    if (normalizeInventoryCount(state.inventory.items.food) < requiredFoodForStart) {
        return state;
    }

    let runId = `run-${timestamp}`;
    let runIdAttempt = 1;
    while (state.dungeon.runs[runId]) {
        runIdAttempt += 1;
        runId = `run-${timestamp}-${runIdAttempt}`;
    }
    const runSeed = hashStringToSeed(`${runId}-${dungeonId}`);
    const baseAttackMs = DUNGEON_BASE_ATTACK_MS;
    const party = uniquePartyIds.map((playerId) => {
        const player = state.players[playerId];
        const effective = player ? resolveHeroEffectiveStats(player, timestamp) : null;
        const agility = effective?.Agility ?? 0;
        const weaponType = player ? getEquippedWeaponType(player.equipment) : "Melee";
        const attackIntervalMs = resolveHeroAttackIntervalMsForWeapon(baseAttackMs, agility, weaponType);
        return {
            playerId,
            hp: Math.max(1, Math.round(player.hpMax)),
            hpMax: Math.max(1, Math.round(player.hpMax)),
            potionCooldownMs: 0,
            attackCooldownMs: attackIntervalMs,
            magicHealCooldownMs: 0,
            tauntUntilMs: null,
            tauntBonus: null,
            tauntStartedAtMs: null,
            stunnedUntilMs: null
        };
    });
    const cadenceSnapshot = buildCadenceSnapshot(party, state.players, timestamp, baseAttackMs);
    const threatTieOrder = buildThreatTieOrder(runSeed, party.map((member) => member.playerId));

    const run: DungeonRunState = {
        id: runId,
        dungeonId,
        status: "running",
        endReason: null,
        startedAt: timestamp,
        elapsedMs: 0,
        stepCarryMs: 0,
        encounterStep: 0,
        floor: 1,
        floorCount: Math.max(1, definition.floorCount),
        floorPauseMs: null,
        party,
        enemies: [],
        targetEnemyId: null,
        targetHeroId: null,
        autoRestart: state.dungeon.setup.autoRestart,
        restartAt: null,
        runIndex: 1,
        startInventory: getRunStorageInventorySnapshot(state.inventory),
        seed: runSeed,
        events: [],
        cadenceSnapshot,
        truncatedEvents: 0,
        nonCriticalEventCount: 0,
        threatByHeroId: buildThreatByHeroId(party),
        threatTieOrder
    };

    const dungeon = {
        ...state.dungeon,
        setup: {
            ...state.dungeon.setup,
            selectedDungeonId: dungeonId,
            selectedPartyPlayerIds: uniquePartyIds
        },
        runs: {
            ...state.dungeon.runs,
            [run.id]: run
        },
        activeRunId: run.id
    };

    const itemDeltas: ItemDelta = {};
    const initialized = initializeFloor(run, definition, state.inventory, itemDeltas);
    const players = { ...state.players };
    uniquePartyIds.forEach((playerId) => {
        const player = players[playerId];
        if (!player) {
            return;
        }
        players[playerId] = {
            ...player,
            hp: player.hpMax,
            selectedActionId: null
        };
    });

    const inventory = initialized.inventory;
    return {
        ...state,
        players,
        inventory,
        dungeon
    };
};

export const stopDungeonRun = (state: GameState, reason: DungeonRunEndReason = "stopped"): GameState => {
    const run = getActiveDungeonRun(state.dungeon);
    if (!run) {
        return state;
    }

    const stoppedRun: DungeonRunState = {
        ...run,
        status: reason === "victory" ? "victory" : "failed",
        endReason: reason,
        restartAt: null
    };
    pushEventWithGlobalCap(stoppedRun, {
        type: "run_end",
        label: reason
    });

    const players = withRecoveredHeroes(state.players, stoppedRun.party);
    const dungeon = finalizeRun(state.dungeon, stoppedRun, players);

    return {
        ...state,
        players,
        dungeon
    };
};

export const updateDungeonOnboardingRequired = (state: GameState): GameState => {
    const playerCount = Object.keys(state.players).length;
    if (playerCount >= 4 && state.dungeon.onboardingRequired) {
        return {
            ...state,
            dungeon: {
                ...state.dungeon,
                onboardingRequired: false
            }
        };
    }
    return state;
};
