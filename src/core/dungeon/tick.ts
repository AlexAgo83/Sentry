import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../data/equipment";
import { getDungeonDefinition } from "../../data/dungeons";
import { ITEM_DEFINITIONS } from "../../data/definitions/items";
import { appendActionJournalEntry } from "../actionJournal";
import { mergeDiscoveredItemIdsFromDelta } from "../inventory";
import { hashStringToSeed } from "../rng";
import type {
    CombatSkillId,
    DungeonReplayEvent,
    DungeonRunEnemyState,
    DungeonRunState,
    GameState,
    ItemDelta,
    PlayerId,
    WeaponType
} from "../types";
import {
    BOSS_BURST_DAMAGE_MULTIPLIER,
    BOSS_ENRAGE_DAMAGE_MULTIPLIER,
    BOSS_POISON_DAMAGE_RATIO,
    DUNGEON_ATTACKS_PER_STEP_CAP,
    DUNGEON_AUTO_RESTART_DELAY_MS,
    DUNGEON_BASE_ATTACK_MS,
    DUNGEON_BURST_INTERVAL_MS,
    DUNGEON_DAMAGE_TAKEN_MULTIPLIER,
    DUNGEON_FLOOR_PAUSE_MS,
    DUNGEON_RUN_SAVE_LIMIT,
    DUNGEON_SHIELD_WINDOW_MS,
    DUNGEON_SIMULATION_STEP_MS,
    DUNGEON_STEP_EVENT_CAP,
    DUNGEON_SUMMON_INTERVAL_MS,
    HEAL_THREAT_RATIO,
    MAGIC_HEAL_COOLDOWN_MS,
    MAGIC_HEAL_TRIGGER_THRESHOLD,
    POTION_PRIORITY,
    TAUNT_THREAT_BONUS
} from "./constants";
import {
    getFloorCombatXp,
    resolveArmorDamageMultiplier,
    resolveDamageTakenMultiplier,
    resolveHealAmount,
    resolveHeroAttackDamage,
    resolveHeroAttackIntervalMsForWeapon,
    resolveMagicHealAmount,
    resolveThreatMultiplier
} from "./formulas";
import { rollDungeonLootReward } from "./loot";
import {
    buildJournalEntryId,
    ensureRunCadenceState,
    ensureRunThreatState,
    finalizeRun,
    formatDungeonEndReason,
    grantCombatXpToParty,
    initializeFloor,
    resolveHeroEffectiveStats,
    withRecoveredHeroes
} from "./lifecycle";
import { createStepEventPusher, pushEventWithGlobalCap } from "./replay";
import {
    addItemDelta,
    addThreat,
    buildThreatByHeroId,
    buildThreatTieOrder,
    cloneInventory,
    decayThreat,
    getActiveDungeonRunIds,
    getRunStorageInventorySnapshot,
    normalizeInventoryCount,
    pruneDungeonRuns,
    recoverRunParty,
    resolveAliveHeroIds,
    resolveTargetEnemy,
    resolveTargetHeroId
} from "./state";

const ITEM_NAME_BY_ID = ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.name;
    return acc;
}, {});

export type ApplyDungeonTickResult = {
    state: GameState;
    itemDeltas: ItemDelta;
    combatActiveMsByPlayer: Record<PlayerId, number>;
    combatXpByPlayer: Record<PlayerId, Partial<Record<CombatSkillId, number>>>;
};

type HeroStepCacheEntry = {
    attackIntervalMs: number;
    baseDamage: number;
    threatMultiplier: number;
    damageTakenMultiplier: number;
    weaponType: WeaponType;
};

type MutableTickState = {
    run: DungeonRunState;
    inventory: GameState["inventory"];
    players: GameState["players"];
    completionCounts: GameState["dungeon"]["completionCounts"];
};

const runAutoRestartPhase = (
    mutable: MutableTickState,
    timestamp: number,
    itemDeltas: ItemDelta
) => {
    const definition = getDungeonDefinition(mutable.run.dungeonId);
    if (!definition) {
        return;
    }
    if (!(mutable.run.restartAt && timestamp >= mutable.run.restartAt && mutable.run.autoRestart)) {
        return;
    }

    const aliveCount = resolveAliveHeroIds(mutable.run).length;
    if (aliveCount > 0 && normalizeInventoryCount(mutable.inventory.items.food) > 0) {
        mutable.run.status = "running";
        mutable.run.endReason = null;
        mutable.run.restartAt = null;
        mutable.run.floor = 1;
        mutable.run.elapsedMs = 0;
        mutable.run.stepCarryMs = 0;
        mutable.run.floorPauseMs = null;
        mutable.run.events = [];
        mutable.run.runIndex += 1;
        const baseAttackMs = DUNGEON_BASE_ATTACK_MS;
        mutable.run.party = mutable.run.party.map((member) => {
            const player = mutable.players[member.playerId];
            const effective = player ? resolveHeroEffectiveStats(player, timestamp) : null;
            const agility = effective?.Agility ?? 0;
            const weaponType = player ? getEquippedWeaponType(player.equipment) : "Melee";
            const attackIntervalMs = resolveHeroAttackIntervalMsForWeapon(baseAttackMs, agility, weaponType);
            return {
                ...member,
                hp: member.hpMax,
                potionCooldownMs: 0,
                attackCooldownMs: attackIntervalMs,
                magicHealCooldownMs: 0,
                tauntUntilMs: null,
                tauntBonus: null,
                tauntStartedAtMs: null,
                stunnedUntilMs: null
            };
        });
        mutable.run.cadenceSnapshot = [];
        mutable.run.truncatedEvents = 0;
        mutable.run.nonCriticalEventCount = 0;
        mutable.run.threatByHeroId = buildThreatByHeroId(mutable.run.party);
        mutable.run.threatTieOrder = buildThreatTieOrder(mutable.run.seed, mutable.run.party.map((member) => member.playerId));
        mutable.run.targetHeroId = null;
        mutable.run.startInventory = getRunStorageInventorySnapshot(mutable.inventory);
        const initialized = initializeFloor(mutable.run, definition, mutable.inventory, itemDeltas);
        mutable.inventory = initialized.inventory;
        return;
    }

    mutable.run.status = "failed";
    mutable.run.endReason = "stopped";
    mutable.run.restartAt = null;
    mutable.run.floorPauseMs = null;
    pushEventWithGlobalCap(mutable.run, { type: "run_end", label: "Auto-restart canceled" });
};

const createHeroStepCache = (
    players: GameState["players"],
    aliveHeroIds: PlayerId[],
    timestamp: number
): Map<PlayerId, HeroStepCacheEntry> => {
    const cache = new Map<PlayerId, HeroStepCacheEntry>();
    aliveHeroIds.forEach((playerId) => {
        const player = players[playerId];
        if (!player) {
            return;
        }
        const effective = resolveHeroEffectiveStats(player, timestamp);
        const weaponType = getEquippedWeaponType(player.equipment);
        const combatSkillId = getCombatSkillIdForWeaponType(weaponType);
        const attackIntervalMs = resolveHeroAttackIntervalMsForWeapon(
            DUNGEON_BASE_ATTACK_MS,
            effective.Agility ?? 0,
            weaponType
        );
        const combatLevel = player.skills[combatSkillId]?.level ?? 0;
        const baseDamage = resolveHeroAttackDamage(combatLevel, effective.Strength ?? 0);
        const armorMultiplier = resolveArmorDamageMultiplier(effective.Armor ?? 0);
        cache.set(playerId, {
            attackIntervalMs,
            baseDamage,
            threatMultiplier: resolveThreatMultiplier(weaponType),
            damageTakenMultiplier: resolveDamageTakenMultiplier(weaponType) * armorMultiplier,
            weaponType
        });
    });
    return cache;
};

const applyPreStepPhase = (
    run: DungeonRunState,
    definition: ReturnType<typeof getDungeonDefinition>,
    inventory: GameState["inventory"],
    itemDeltas: ItemDelta,
    combatActiveMsByPlayer: Record<PlayerId, number>
): { continueStep: boolean; nowMs: number; encounterMs: number; aliveHeroIds: PlayerId[] } => {
    run.elapsedMs += DUNGEON_SIMULATION_STEP_MS;
    run.encounterStep += 1;
    const nowMs = run.elapsedMs;
    const encounterMs = run.encounterStep * DUNGEON_SIMULATION_STEP_MS;

    run.party.forEach((member) => {
        member.potionCooldownMs = Math.max(0, member.potionCooldownMs - DUNGEON_SIMULATION_STEP_MS);
        const currentCooldown = Number.isFinite(member.attackCooldownMs) ? member.attackCooldownMs : 0;
        member.attackCooldownMs = currentCooldown - DUNGEON_SIMULATION_STEP_MS;
        const magicCooldown = Number.isFinite(member.magicHealCooldownMs) ? member.magicHealCooldownMs : 0;
        member.magicHealCooldownMs = Math.max(0, magicCooldown - DUNGEON_SIMULATION_STEP_MS);
    });

    if (run.floorPauseMs && run.floorPauseMs > 0) {
        run.floorPauseMs = Math.max(0, run.floorPauseMs - DUNGEON_SIMULATION_STEP_MS);
        if (run.floorPauseMs > 0) {
            return { continueStep: false, nowMs, encounterMs, aliveHeroIds: [] };
        }
        run.floorPauseMs = null;
        run.floor += 1;
        if (definition) {
            const initialized = initializeFloor(run, definition, inventory, itemDeltas);
            Object.assign(inventory, initialized.inventory);
        }
        return { continueStep: false, nowMs, encounterMs, aliveHeroIds: [] };
    }

    const aliveHeroIds = resolveAliveHeroIds(run);
    aliveHeroIds.forEach((playerId) => {
        combatActiveMsByPlayer[playerId] = (combatActiveMsByPlayer[playerId] ?? 0) + DUNGEON_SIMULATION_STEP_MS;
    });

    return { continueStep: true, nowMs, encounterMs, aliveHeroIds };
};

const applyHeroAttackPhase = (
    run: DungeonRunState,
    players: GameState["players"],
    aliveHeroIds: PlayerId[],
    partyById: Map<PlayerId, DungeonRunState["party"][number]>,
    heroStepCache: Map<PlayerId, HeroStepCacheEntry>,
    encounterMs: number,
    pushEventWithStepCap: (event: Omit<DungeonReplayEvent, "atMs">) => void
) => {
    let targetEnemy = resolveTargetEnemy(run.enemies, run.targetEnemyId);
    if (!targetEnemy) {
        return {
            hadEnemyAtPhaseStart: false,
            targetEnemy: null as DungeonRunEnemyState | null
        };
    }

    aliveHeroIds.forEach((playerId) => {
        const player = players[playerId];
        const enemy = targetEnemy;
        const member = partyById.get(playerId);
        const cached = heroStepCache.get(playerId);
        if (!player || !enemy || enemy.hp <= 0 || !member || !cached) {
            return;
        }
        const attackIntervalMs = cached.attackIntervalMs;
        let attacks = 0;
        while (member.attackCooldownMs <= 0 && attacks < DUNGEON_ATTACKS_PER_STEP_CAP) {
            if (enemy.hp <= 0) {
                break;
            }
            const hpBefore = enemy.hp;
            const baseDamage = cached.baseDamage;
            const reducedDamage = enemy.isBoss
                && enemy.mechanic === "shield"
                && encounterMs <= DUNGEON_SHIELD_WINDOW_MS
                ? Math.max(1, Math.round(baseDamage * 0.6))
                : baseDamage;
            enemy.hp = Math.max(0, enemy.hp - reducedDamage);
            const hpAfter = enemy.hp;
            addThreat(run.threatByHeroId, playerId, reducedDamage * cached.threatMultiplier);
            pushEventWithStepCap({
                type: "attack",
                sourceId: playerId,
                targetId: enemy.id,
                amount: reducedDamage,
                label: `${player.name} -> ${enemy.name} (HP ${hpBefore}/${enemy.hpMax})`
            });
            pushEventWithStepCap({
                type: "damage",
                sourceId: playerId,
                targetId: enemy.id,
                amount: reducedDamage,
                label: `${enemy.name} -${reducedDamage} (HP ${hpAfter}/${enemy.hpMax})`
            });
            if (enemy.hp <= 0) {
                pushEventWithStepCap({
                    type: "death",
                    sourceId: enemy.id,
                    label: enemy.name
                });
            }
            member.attackCooldownMs += attackIntervalMs;
            attacks += 1;
        }
        if (attacks >= DUNGEON_ATTACKS_PER_STEP_CAP && member.attackCooldownMs <= 0) {
            member.attackCooldownMs = 0;
        }
    });

    targetEnemy = resolveTargetEnemy(run.enemies, targetEnemy.id);
    run.targetEnemyId = targetEnemy?.id ?? null;
    return {
        hadEnemyAtPhaseStart: true,
        targetEnemy
    };
};

const applyEnemyAttackPhase = (
    run: DungeonRunState,
    statePlayers: GameState["players"],
    activeEnemy: DungeonRunEnemyState,
    partyById: Map<PlayerId, DungeonRunState["party"][number]>,
    heroStepCache: Map<PlayerId, HeroStepCacheEntry>,
    nowMs: number,
    encounterMs: number,
    pushEventWithStepCap: (event: Omit<DungeonReplayEvent, "atMs">) => void
) => {
    let targetHeroId = resolveTargetHeroId(run, nowMs, activeEnemy.isBoss);
    let hero = targetHeroId ? partyById.get(targetHeroId) ?? null : null;
    if (!hero || hero.hp <= 0) {
        run.targetHeroId = null;
        targetHeroId = resolveTargetHeroId(run, nowMs, activeEnemy.isBoss);
        hero = targetHeroId ? partyById.get(targetHeroId) ?? null : null;
    }
    run.targetHeroId = hero && hero.hp > 0 ? hero.playerId : null;
    if (run.targetHeroId && hero) {
        if (encounterMs % DUNGEON_BASE_ATTACK_MS === 0 && hero.hp > 0) {
            const cached = heroStepCache.get(run.targetHeroId);
            let enemyDamage = activeEnemy.damage;
            if (activeEnemy.isBoss
                && activeEnemy.mechanic === "burst"
                && encounterMs % DUNGEON_BURST_INTERVAL_MS === 0) {
                enemyDamage = Math.round(enemyDamage * BOSS_BURST_DAMAGE_MULTIPLIER);
            }
            if (activeEnemy.isBoss && activeEnemy.mechanic === "enrage" && activeEnemy.hp / activeEnemy.hpMax <= 0.3) {
                enemyDamage = Math.round(enemyDamage * BOSS_ENRAGE_DAMAGE_MULTIPLIER);
            }
            const damageMultiplier = cached?.damageTakenMultiplier ?? 1;
            const adjustedDamage = Math.max(
                1,
                Math.round(enemyDamage * damageMultiplier * DUNGEON_DAMAGE_TAKEN_MULTIPLIER)
            );
            const heroName = statePlayers[hero.playerId]?.name ?? hero.playerId;
            const hpBefore = hero.hp;
            hero.hp = Math.max(0, hero.hp - adjustedDamage);
            const hpAfter = hero.hp;
            pushEventWithStepCap({
                type: "attack",
                sourceId: activeEnemy.id,
                targetId: run.targetHeroId,
                amount: adjustedDamage,
                label: `${activeEnemy.name} -> ${heroName} (HP ${hpBefore}/${hero.hpMax})`
            });
            pushEventWithStepCap({
                type: "damage",
                sourceId: activeEnemy.id,
                targetId: run.targetHeroId,
                amount: adjustedDamage,
                label: `${heroName} -${adjustedDamage} (HP ${hpAfter}/${hero.hpMax})`
            });
            if (hero.hp <= 0) {
                run.targetHeroId = null;
                run.threatByHeroId[hero.playerId] = 0;
                pushEventWithStepCap({
                    type: "death",
                    sourceId: run.targetHeroId ?? hero.playerId,
                    label: statePlayers[hero.playerId]?.name ?? hero.playerId
                });
            }
        }
    }

    if (activeEnemy.isBoss
        && activeEnemy.mechanic === "poison"
        && encounterMs % DUNGEON_BASE_ATTACK_MS === 0) {
        run.party.forEach((member) => {
            if (member.hp <= 0) {
                return;
            }
            const poisonDamage = Math.max(1, Math.round(activeEnemy.damage * BOSS_POISON_DAMAGE_RATIO));
            const cached = heroStepCache.get(member.playerId);
            const damageMultiplier = cached?.damageTakenMultiplier ?? 1;
            const adjustedDamage = Math.max(
                1,
                Math.round(poisonDamage * damageMultiplier * DUNGEON_DAMAGE_TAKEN_MULTIPLIER)
            );
            const wasAlive = member.hp > 0;
            member.hp = Math.max(0, member.hp - adjustedDamage);
            const poisonTargetName = statePlayers[member.playerId]?.name ?? member.playerId;
            pushEventWithStepCap({
                type: "damage",
                sourceId: activeEnemy.id,
                targetId: member.playerId,
                amount: adjustedDamage,
                label: `Poison -> ${poisonTargetName} -${adjustedDamage} (HP ${member.hp}/${member.hpMax})`
            });
            if (wasAlive && member.hp <= 0) {
                if (run.targetHeroId === member.playerId) {
                    run.targetHeroId = null;
                }
                run.threatByHeroId[member.playerId] = 0;
                pushEventWithStepCap({
                    type: "death",
                    sourceId: member.playerId,
                    label: statePlayers[member.playerId]?.name ?? member.playerId
                });
            }
        });
    }

    if (activeEnemy.isBoss
        && activeEnemy.mechanic === "summon"
        && encounterMs % DUNGEON_SUMMON_INTERVAL_MS === 0) {
        const summonHp = Math.max(1, Math.round(activeEnemy.hpMax * 0.2));
        const summonDamage = Math.max(1, Math.round(activeEnemy.damage * 0.5));
        const summonIndex = run.enemies.length + 1;
        const summon: DungeonRunEnemyState = {
            id: `entity_${run.runIndex}_${run.floor}_${summonIndex}`,
            name: "Summoned Add",
            hp: summonHp,
            hpMax: summonHp,
            damage: summonDamage,
            isBoss: false,
            mechanic: null,
            spawnIndex: run.enemies.length
        };
        run.enemies.push(summon);
        pushEventWithStepCap({
            type: "spawn",
            sourceId: summon.id,
            label: summon.name
        });
    }
};

const applyHealAndConsumablesPhase = (
    state: GameState,
    run: DungeonRunState,
    inventory: GameState["inventory"],
    heroStepCache: Map<PlayerId, HeroStepCacheEntry>,
    partyOrderIndex: Map<PlayerId, number>,
    nowMs: number,
    itemDeltas: ItemDelta,
    pushEventWithStepCap: (event: Omit<DungeonReplayEvent, "atMs">) => void
) => {
    run.party.forEach((member) => {
        const cached = heroStepCache.get(member.playerId);
        if (!cached || cached.weaponType !== "Magic") {
            return;
        }
        if (member.hp <= 0) {
            return;
        }
        if (Number(member.stunnedUntilMs) > nowMs) {
            return;
        }
        if (member.magicHealCooldownMs > 0) {
            return;
        }
        const candidates = run.party
            .filter((ally) => ally.playerId !== member.playerId && ally.hp > 0 && ally.hp < ally.hpMax)
            .filter((ally) => ally.hp / ally.hpMax < MAGIC_HEAL_TRIGGER_THRESHOLD)
            .sort((a, b) => {
                const ratioDiff = (a.hp / a.hpMax) - (b.hp / b.hpMax);
                if (ratioDiff !== 0) {
                    return ratioDiff;
                }
                return (partyOrderIndex.get(a.playerId) ?? 0) - (partyOrderIndex.get(b.playerId) ?? 0);
            });
        const target = candidates[0];
        if (!target) {
            return;
        }
        const amount = resolveMagicHealAmount(target.hpMax);
        const actualHeal = Math.max(0, Math.min(amount, target.hpMax - target.hp));
        if (actualHeal <= 0) {
            return;
        }
        target.hp = Math.min(target.hpMax, target.hp + actualHeal);
        member.magicHealCooldownMs = MAGIC_HEAL_COOLDOWN_MS;
        addThreat(run.threatByHeroId, member.playerId, actualHeal * HEAL_THREAT_RATIO);
        pushEventWithStepCap({
            type: "heal",
            sourceId: member.playerId,
            targetId: target.playerId,
            amount: actualHeal,
            label: "Magic"
        });
    });

    if (state.dungeon.setup.autoConsumables) {
        run.party.forEach((member) => {
            if (member.hp <= 0 || member.hp / member.hpMax > 0.5 || member.potionCooldownMs > 0) {
                return;
            }
            const potionType = POTION_PRIORITY.find((itemId) => normalizeInventoryCount(inventory.items[itemId]) > 0);
            if (!potionType) {
                return;
            }
            inventory.items[potionType] = normalizeInventoryCount(inventory.items[potionType]) - 1;
            addItemDelta(itemDeltas, potionType, -1);
            const amount = resolveHealAmount(member.hpMax);
            member.hp = Math.min(member.hpMax, member.hp + amount);
            member.potionCooldownMs = 4000;
            addThreat(run.threatByHeroId, member.playerId, amount * HEAL_THREAT_RATIO);
            pushEventWithStepCap({
                type: "heal",
                sourceId: member.playerId,
                amount,
                label: potionType
            });
        });
    }
};

export const applyDungeonTick = (
    state: GameState,
    deltaMs: number,
    timestamp: number
): ApplyDungeonTickResult => {
    const activeRunIds = getActiveDungeonRunIds(state.dungeon);
    if (activeRunIds.length === 0) {
        return { state, itemDeltas: {}, combatActiveMsByPlayer: {}, combatXpByPlayer: {} };
    }
    const itemDeltas: ItemDelta = {};
    const combatActiveMsByPlayer: Record<PlayerId, number> = {};
    const combatXpByPlayer: Record<PlayerId, Partial<Record<CombatSkillId, number>>> = {};
    let mutableInventory = cloneInventory(state.inventory);
    let mutablePlayers = state.players;
    let dungeon = {
        ...state.dungeon,
        runs: { ...state.dungeon.runs },
        completionCounts: state.dungeon.completionCounts ?? {}
    };
    const journalEntries: Array<{ at: number; label: string }> = [];

    activeRunIds.forEach((runId) => {
        const activeRun = dungeon.runs[runId];
        if (!activeRun) {
            return;
        }

        const wasRunning = activeRun.status === "running";
        const definition = getDungeonDefinition(activeRun.dungeonId);
        if (!definition) {
            return;
        }

        const mutable: MutableTickState = {
            run: {
                ...activeRun,
                party: activeRun.party.map((member) => ({ ...member })),
                enemies: activeRun.enemies.map((enemy) => ({ ...enemy })),
                events: activeRun.events.slice()
            },
            inventory: mutableInventory,
            players: mutablePlayers,
            completionCounts: dungeon.completionCounts
        };
        let lootJournalLabel: string | null = null;

        runAutoRestartPhase(mutable, timestamp, itemDeltas);
        ensureRunCadenceState(mutable.run, mutable.players, timestamp);
        ensureRunThreatState(mutable.run);

        mutable.run.stepCarryMs += Math.max(0, deltaMs);
        const steps = Math.floor(mutable.run.stepCarryMs / DUNGEON_SIMULATION_STEP_MS);
        mutable.run.stepCarryMs -= steps * DUNGEON_SIMULATION_STEP_MS;

        const partyById = new Map(mutable.run.party.map((member) => [member.playerId, member]));
        const partyOrderIndex = new Map(mutable.run.party.map((member, index) => [member.playerId, index]));

        for (let step = 0; step < steps; step += 1) {
            if (mutable.run.status !== "running") {
                break;
            }

            const { push: pushEventWithStepCap } = createStepEventPusher(
                mutable.run,
                DUNGEON_STEP_EVENT_CAP,
                () => {
                    mutable.run.truncatedEvents += 1;
                }
            );

            const preStep = applyPreStepPhase(
                mutable.run,
                definition,
                mutable.inventory,
                itemDeltas,
                combatActiveMsByPlayer
            );
            if (!preStep.continueStep) {
                continue;
            }

            const { nowMs, encounterMs, aliveHeroIds } = preStep;
            decayThreat(mutable.run.threatByHeroId);
            mutable.run.party.forEach((member) => {
                if (Number(member.tauntUntilMs) > nowMs) {
                    if (!Number.isFinite(member.tauntStartedAtMs)) {
                        member.tauntStartedAtMs = nowMs;
                        addThreat(mutable.run.threatByHeroId, member.playerId, member.tauntBonus ?? TAUNT_THREAT_BONUS);
                    }
                    return;
                }
                if (Number.isFinite(member.tauntStartedAtMs)) {
                    member.tauntStartedAtMs = null;
                    member.tauntUntilMs = null;
                    member.tauntBonus = null;
                }
            });

            const heroStepCache = createHeroStepCache(mutable.players, aliveHeroIds, timestamp);

            const heroPhase = applyHeroAttackPhase(
                mutable.run,
                mutable.players,
                aliveHeroIds,
                partyById,
                heroStepCache,
                encounterMs,
                pushEventWithStepCap
            );

            if (!heroPhase.hadEnemyAtPhaseStart) {
                continue;
            }

            if (!heroPhase.targetEnemy) {
                const floorCombatXp = getFloorCombatXp(definition.tier, mutable.run.floor);
                const bossBonusCombatXp = mutable.run.floor >= mutable.run.floorCount ? floorCombatXp * 2 : 0;
                mutable.players = grantCombatXpToParty(
                    mutable.players,
                    mutable.run.party,
                    floorCombatXp + bossBonusCombatXp,
                    combatXpByPlayer
                );

                if (mutable.run.floor >= mutable.run.floorCount) {
                    const bossGold = Math.max(25, definition.tier * 75);
                    mutable.inventory.items.gold = normalizeInventoryCount(mutable.inventory.items.gold) + bossGold;
                    addItemDelta(itemDeltas, "gold", bossGold);
                    const completionIndex = mutable.completionCounts[mutable.run.dungeonId] ?? 0;
                    const lootSeed = hashStringToSeed(`${mutable.run.seed}:loot:${mutable.run.runIndex}:${completionIndex}`);
                    const lootReward = rollDungeonLootReward(definition.lootTable, lootSeed);
                    if (lootReward && lootReward.quantity > 0) {
                        mutable.inventory.items[lootReward.itemId] = normalizeInventoryCount(mutable.inventory.items[lootReward.itemId])
                            + lootReward.quantity;
                        addItemDelta(itemDeltas, lootReward.itemId, lootReward.quantity);
                        mutable.inventory.discoveredItemIds = mergeDiscoveredItemIdsFromDelta(
                            mutable.inventory.discoveredItemIds,
                            { [lootReward.itemId]: lootReward.quantity }
                        );
                        const lootName = ITEM_NAME_BY_ID[lootReward.itemId] ?? lootReward.itemId;
                        lootJournalLabel = `Dungeon loot: ${lootName} x${lootReward.quantity}`;
                    }
                    mutable.run.status = "victory";
                    mutable.run.endReason = "victory";
                    mutable.run.floorPauseMs = null;
                    mutable.run.party = recoverRunParty(mutable.run.party);
                    pushEventWithGlobalCap(mutable.run, {
                        type: "run_end",
                        label: "victory"
                    });
                    if (mutable.run.autoRestart) {
                        mutable.completionCounts = {
                            ...mutable.completionCounts,
                            [mutable.run.dungeonId]: (mutable.completionCounts[mutable.run.dungeonId] ?? 0) + 1
                        };
                        mutable.run.restartAt = timestamp + DUNGEON_AUTO_RESTART_DELAY_MS;
                    }
                    continue;
                }

                mutable.run.floorPauseMs = DUNGEON_FLOOR_PAUSE_MS;
                mutable.run.enemies = [];
                mutable.run.targetEnemyId = null;
                continue;
            }

            applyEnemyAttackPhase(
                mutable.run,
                state.players,
                heroPhase.targetEnemy,
                partyById,
                heroStepCache,
                nowMs,
                encounterMs,
                pushEventWithStepCap
            );

            applyHealAndConsumablesPhase(
                state,
                mutable.run,
                mutable.inventory,
                heroStepCache,
                partyOrderIndex,
                nowMs,
                itemDeltas,
                pushEventWithStepCap
            );

            if (resolveAliveHeroIds(mutable.run).length === 0) {
                mutable.run.status = "failed";
                mutable.run.endReason = "wipe";
                pushEventWithGlobalCap(mutable.run, {
                    type: "run_end",
                    label: "wipe"
                });
                break;
            }
        }

        dungeon = {
            ...dungeon,
            runs: {
                ...dungeon.runs,
                [mutable.run.id]: mutable.run
            },
            completionCounts: mutable.completionCounts
        };

        if (mutable.run.status === "failed" || (mutable.run.status === "victory" && !mutable.run.autoRestart)) {
            mutable.players = withRecoveredHeroes(mutable.players, mutable.run.party);
            dungeon = finalizeRun(dungeon, mutable.run, mutable.players);
        }

        const runEndedNow = wasRunning && mutable.run.status !== "running";
        if (runEndedNow) {
            const dungeonLabel = definition.name ?? mutable.run.dungeonId;
            const reasonLabel = formatDungeonEndReason(mutable.run.endReason ?? mutable.run.status);
            journalEntries.push({
                at: timestamp,
                label: `Dungeon ended: ${dungeonLabel} (${reasonLabel})`
            });
            if (lootJournalLabel) {
                journalEntries.push({
                    at: timestamp,
                    label: lootJournalLabel
                });
            }
        }

        mutableInventory = mutable.inventory;
        mutablePlayers = mutable.players;
    });

    dungeon = {
        ...dungeon,
        runs: pruneDungeonRuns(dungeon.runs, dungeon.activeRunId, DUNGEON_RUN_SAVE_LIMIT)
    };
    const activeRunIdSet = new Set(getActiveDungeonRunIds(dungeon));
    if (!dungeon.activeRunId || !activeRunIdSet.has(dungeon.activeRunId)) {
        dungeon = {
            ...dungeon,
            activeRunId: getActiveDungeonRunIds(dungeon)[0] ?? null
        };
    }

    let nextState: GameState = {
        ...state,
        players: mutablePlayers,
        inventory: mutableInventory,
        dungeon
    };
    journalEntries.forEach((entry, index) => {
        nextState = appendActionJournalEntry(nextState, {
            id: buildJournalEntryId(entry.at + index),
            at: entry.at,
            label: entry.label
        });
    });

    return {
        state: nextState,
        itemDeltas,
        combatActiveMsByPlayer,
        combatXpByPlayer
    };
};
