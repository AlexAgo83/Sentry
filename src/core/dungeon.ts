import { getDungeonDefinition, DUNGEON_DEFINITIONS } from "../data/dungeons";
import { hashStringToSeed, seededRandom } from "./rng";
import { XP_NEXT_MULTIPLIER } from "./constants";
import { resolveEffectiveStats } from "./stats";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType, getEquipmentModifiers } from "../data/equipment";
import { appendActionJournalEntry } from "./actionJournal";
import type {
    CombatSkillId,
    DungeonCadenceSnapshotEntry,
    DungeonDefinition,
    DungeonReplayEvent,
    DungeonReplayState,
    DungeonRunEnemyState,
    DungeonRunEndReason,
    DungeonRunState,
    DungeonState,
    GameState,
    InventoryState,
    ItemDelta,
    PlayerId,
    PlayerState,
    WeaponType
} from "./types";

export const DUNGEON_SIMULATION_STEP_MS = 500;
export const DUNGEON_AUTO_RESTART_DELAY_MS = 3000;
export const DUNGEON_REPLAY_MAX_EVENTS = 5000;
export const DUNGEON_REPLAY_MAX_BYTES = 2 * 1024 * 1024;
export const DUNGEON_TOTAL_EVENT_CAP = 10_000;
export const DUNGEON_BASE_ATTACK_MS = DUNGEON_SIMULATION_STEP_MS;
export const DUNGEON_FLOOR_PAUSE_MS = 800;
export const DUNGEON_ATTACK_INTERVAL_MIN_MS = 250;
export const DUNGEON_ATTACK_INTERVAL_MAX_MS = 1400;
export const DUNGEON_ATTACKS_PER_STEP_CAP = 3;
export const DUNGEON_STEP_EVENT_CAP = 200;

const POTION_PRIORITY: Array<"tonic" | "elixir" | "potion"> = ["tonic", "elixir", "potion"];
const BOSS_BASE_DAMAGE_MULTIPLIER = 1.4;
const BOSS_BURST_DAMAGE_MULTIPLIER = 1.35;
const BOSS_ENRAGE_DAMAGE_MULTIPLIER = 1.25;
const BOSS_POISON_DAMAGE_RATIO = 0.15;
const COMBAT_XP_BASE = 6;
const COMBAT_XP_TIER_FACTOR = 3;
const THREAT_DECAY = 0.95;
const HEAL_THREAT_RATIO = 0.6;
const TAUNT_THREAT_BONUS = 200;
export const TAUNT_DURATION_MS = 2500;
const STICKY_THRESHOLD_NORMAL = 0.10;
const STICKY_THRESHOLD_BOSS = 0.15;
const MAGIC_HEAL_COOLDOWN_MS = 4000;
const MAGIC_HEAL_TRIGGER_THRESHOLD = 0.7;
const MAGIC_HEAL_RATIO = 0.25;
const MAGIC_DAMAGE_TAKEN_MULTIPLIER = 1.1;
const RANGED_DAMAGE_TAKEN_MULTIPLIER = 1.25;
const MELEE_DAMAGE_TAKEN_MULTIPLIER = 0.9;
const DUNGEON_DAMAGE_TAKEN_MULTIPLIER = 0.5;
const RANGED_ATTACK_INTERVAL_MULTIPLIER = 0.5;
const MELEE_THREAT_MULTIPLIER = 1.25;

const buildJournalEntryId = (timestamp: number) => {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${timestamp}-${suffix}`;
};

const formatDungeonEndReason = (reason: string | null | undefined) => {
    if (!reason) {
        return "Ended";
    }
    return reason
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const normalizeInventoryCount = (value: number | undefined) => {
    const numeric = typeof value === "number" ? value : Number.NaN;
    if (!Number.isFinite(numeric)) {
        return 0;
    }
    return Math.max(0, Math.floor(numeric));
};

const addItemDelta = (target: ItemDelta, itemId: string, amount: number) => {
    if (!amount) {
        return;
    }
    target[itemId] = (target[itemId] ?? 0) + amount;
};

const normalizeEnemyVitals = (enemy: DungeonRunEnemyState): DungeonRunEnemyState => {
    const rawHpMax = Number(enemy.hpMax);
    const fallbackHpMax = Math.max(1, Math.round(Number(enemy.hp) || 1));
    const hpMax = Number.isFinite(rawHpMax) && rawHpMax > 0 ? Math.round(rawHpMax) : fallbackHpMax;
    const rawHp = Number(enemy.hp);
    const hp = Number.isFinite(rawHp) ? Math.min(Math.max(0, Math.round(rawHp)), hpMax) : hpMax;
    enemy.hpMax = hpMax;
    enemy.hp = hp;
    return enemy;
};

const cloneInventory = (inventory: InventoryState): InventoryState => ({
    ...inventory,
    items: { ...inventory.items }
});

const getRunStorageInventorySnapshot = (inventory: InventoryState) => {
    return {
        food: normalizeInventoryCount(inventory.items.food),
        tonic: normalizeInventoryCount(inventory.items.tonic),
        elixir: normalizeInventoryCount(inventory.items.elixir),
        potion: normalizeInventoryCount(inventory.items.potion)
    };
};

const getReplayCriticalEvents = (events: DungeonReplayEvent[]) => {
    return events.filter((event) => {
        return event.type === "floor_start"
            || event.type === "boss_start"
            || event.type === "heal"
            || event.type === "death"
            || event.type === "run_end";
    });
};

const isCriticalEventType = (type: DungeonReplayEvent["type"]) => {
    return type === "floor_start"
        || type === "boss_start"
        || type === "heal"
        || type === "death"
        || type === "run_end";
};

const countNonCriticalEvents = (events: DungeonReplayEvent[]) => {
    return events.reduce((total, event) => total + (isCriticalEventType(event.type) ? 0 : 1), 0);
};

const encodeSize = (value: unknown): number => {
    try {
        return new TextEncoder().encode(JSON.stringify(value)).length;
    } catch {
        return Number.POSITIVE_INFINITY;
    }
};

const floorMobHp = (tier: number, floor: number) => {
    return Math.max(1, Math.round(120 * (1.18 ** (tier - 1)) * (1.10 ** (floor - 1))));
};

const floorMobDamage = (tier: number, floor: number) => {
    return Math.max(1, Math.round(12 * (1.15 ** (tier - 1)) * (1.07 ** (floor - 1))));
};

const foodCostPerFloor = (tier: number) => {
    return 1 + Math.floor((tier - 1) / 2);
};

const foodCostForFloor = (tier: number, floor: number, floorCount: number) => {
    return foodCostPerFloor(tier) + (floor === floorCount ? 1 : 0);
};

export const getDungeonStartFoodCost = (definition: DungeonDefinition): number => {
    return foodCostForFloor(definition.tier, 1, Math.max(1, definition.floorCount));
};

const resolveTargetEnemy = (enemies: DungeonRunEnemyState[], targetEnemyId: string | null): DungeonRunEnemyState | null => {
    const alive = enemies.map(normalizeEnemyVitals).filter((enemy) => enemy.hp > 0);
    if (alive.length === 0) {
        return null;
    }
    const current = targetEnemyId ? alive.find((enemy) => enemy.id === targetEnemyId) : null;
    if (current) {
        return current;
    }
    return alive
        .slice()
        .sort((a, b) => (a.hp - b.hp) || (a.spawnIndex - b.spawnIndex))[0] ?? null;
};

const buildThreatTieOrder = (seed: number, partyIds: PlayerId[]): PlayerId[] => {
    return partyIds
        .slice()
        .sort((a, b) => {
            const seedA = hashStringToSeed(`${seed}-${a}`);
            const seedB = hashStringToSeed(`${seed}-${b}`);
            return seedA - seedB || a.localeCompare(b);
        });
};

const buildThreatByHeroId = (
    party: DungeonRunState["party"],
    existing?: Record<PlayerId, number> | null
): Record<PlayerId, number> => {
    const next: Record<PlayerId, number> = {};
    party.forEach((member) => {
        const prior = existing?.[member.playerId];
        next[member.playerId] = Number.isFinite(prior) ? (prior as number) : 0;
    });
    return next;
};

const decayThreat = (threatByHeroId: Record<PlayerId, number>) => {
    Object.keys(threatByHeroId).forEach((playerId) => {
        const current = threatByHeroId[playerId as PlayerId] ?? 0;
        threatByHeroId[playerId as PlayerId] = Math.max(0, current * THREAT_DECAY);
    });
};

const addThreat = (threatByHeroId: Record<PlayerId, number>, playerId: PlayerId, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
        return;
    }
    threatByHeroId[playerId] = (threatByHeroId[playerId] ?? 0) + amount;
};

const resolveAliveHeroIds = (run: DungeonRunState) => run.party.filter((member) => member.hp > 0).map((member) => member.playerId);

const recoverRunParty = (party: DungeonRunState["party"]): DungeonRunState["party"] => {
    return party.map((member) => ({
        ...member,
        hp: member.hpMax,
        potionCooldownMs: 0,
        attackCooldownMs: 0,
        magicHealCooldownMs: 0,
        stunnedUntilMs: null
    }));
};

const isRunActive = (run: DungeonRunState): boolean => {
    return run.status === "running" || run.restartAt !== null;
};

const resolveTargetHeroId = (run: DungeonRunState, nowMs: number, isBoss: boolean): PlayerId | null => {
    const aliveMembers = run.party.filter((member) => member.hp > 0);
    if (aliveMembers.length === 0) {
        return null;
    }

    const tieOrder = run.threatTieOrder?.length
        ? run.threatTieOrder
        : buildThreatTieOrder(run.seed, aliveMembers.map((member) => member.playerId));
    const tieIndex = new Map(tieOrder.map((playerId, index) => [playerId, index]));
    const threatByHeroId = run.threatByHeroId ?? {};

    const tauntTargets = aliveMembers
        .filter((member) => Number(member.tauntUntilMs) > nowMs)
        .sort((a, b) => {
            const bonusA = a.tauntBonus ?? TAUNT_THREAT_BONUS;
            const bonusB = b.tauntBonus ?? TAUNT_THREAT_BONUS;
            if (bonusB !== bonusA) {
                return bonusB - bonusA;
            }
            return (tieIndex.get(a.playerId) ?? 0) - (tieIndex.get(b.playerId) ?? 0);
        });
    if (tauntTargets.length > 0) {
        return tauntTargets[0]?.playerId ?? null;
    }

    const sortedByThreat = aliveMembers.slice().sort((a, b) => {
        const threatA = threatByHeroId[a.playerId] ?? 0;
        const threatB = threatByHeroId[b.playerId] ?? 0;
        if (threatB !== threatA) {
            return threatB - threatA;
        }
        return (tieIndex.get(a.playerId) ?? 0) - (tieIndex.get(b.playerId) ?? 0);
    });
    const topTargetId = sortedByThreat[0]?.playerId ?? null;
    if (!topTargetId) {
        return null;
    }

    const currentTargetId = run.targetHeroId;
    if (currentTargetId && aliveMembers.some((member) => member.playerId === currentTargetId)) {
        const topThreat = threatByHeroId[topTargetId] ?? 0;
        const currentThreat = threatByHeroId[currentTargetId] ?? 0;
        const threshold = isBoss ? STICKY_THRESHOLD_BOSS : STICKY_THRESHOLD_NORMAL;
        if (topThreat <= 0 || currentThreat >= topThreat * (1 - threshold)) {
            return currentTargetId;
        }
    }

    return topTargetId;
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
                id: `boss-${runIndex}-${floor}`,
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
            id: `mob-${runIndex}-${floor}-${i + 1}`,
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

const clampNumber = (min: number, max: number, value: number) => {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
};

export const resolveHeroAttackIntervalMs = (baseAttackMs: number, agility: number): number => {
    const safeBase = Number.isFinite(baseAttackMs) && baseAttackMs > 0 ? baseAttackMs : DUNGEON_BASE_ATTACK_MS;
    const safeAgility = Number.isFinite(agility) ? agility : 0;
    const raw = Math.round(safeBase / (1 + safeAgility * 0.02));
    return clampNumber(DUNGEON_ATTACK_INTERVAL_MIN_MS, DUNGEON_ATTACK_INTERVAL_MAX_MS, raw);
};

export const resolveHeroAttackIntervalMsWithMultiplier = (
    baseAttackMs: number,
    agility: number,
    multiplier = 1
): number => {
    const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    const baseInterval = resolveHeroAttackIntervalMs(baseAttackMs, agility);
    const adjusted = Math.round(baseInterval * safeMultiplier);
    return clampNumber(DUNGEON_ATTACK_INTERVAL_MIN_MS, DUNGEON_ATTACK_INTERVAL_MAX_MS, adjusted);
};

const resolveAttackIntervalMultiplier = (weaponType: WeaponType | null | undefined) => {
    return weaponType === "Ranged" ? RANGED_ATTACK_INTERVAL_MULTIPLIER : 1;
};

const resolveDamageTakenMultiplier = (weaponType: WeaponType | null | undefined) => {
    if (weaponType === "Ranged") {
        return RANGED_DAMAGE_TAKEN_MULTIPLIER;
    }
    if (weaponType === "Magic") {
        return MAGIC_DAMAGE_TAKEN_MULTIPLIER;
    }
    return MELEE_DAMAGE_TAKEN_MULTIPLIER;
};

const resolveThreatMultiplier = (weaponType: WeaponType | null | undefined) => {
    return weaponType === "Melee" ? MELEE_THREAT_MULTIPLIER : 1;
};

const resolveHeroAttackIntervalMsForWeapon = (
    baseAttackMs: number,
    agility: number,
    weaponType: WeaponType | null | undefined
) => {
    return resolveHeroAttackIntervalMsWithMultiplier(baseAttackMs, agility, resolveAttackIntervalMultiplier(weaponType));
};

const resolveMagicHealAmount = (hpMax: number) => Math.max(1, Math.round(hpMax * MAGIC_HEAL_RATIO));

export const resolveHeroAttackDamage = (combatLevel: number, strength: number): number => {
    const safeCombatLevel = Number.isFinite(combatLevel) ? combatLevel : 0;
    const safeStrength = Number.isFinite(strength) ? strength : 0;
    return Math.max(1, Math.round(10 + safeCombatLevel * 1.6 + safeStrength * 1.2));
};

const resolveHeroEffectiveStats = (player: PlayerState, timestamp: number) => {
    const equipmentMods = player.equipment ? getEquipmentModifiers(player.equipment) : [];
    return resolveEffectiveStats(player.stats, timestamp, equipmentMods).effective;
};

const buildCadenceSnapshot = (
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

const ensureRunCadenceState = (run: DungeonRunState, players: Record<PlayerId, PlayerState>, timestamp: number) => {
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

const ensureRunThreatState = (run: DungeonRunState) => {
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

const healAmount = (hpMax: number) => Math.max(1, Math.round(hpMax * 0.4));

const applySkillLevelUps = (xp: number, level: number, xpNext: number, maxLevel: number) => {
    let nextXp = xp;
    let nextLevel = level;
    let nextXpNext = xpNext;

    while (nextXpNext > 0 && nextXp >= nextXpNext && nextLevel < maxLevel) {
        nextXp -= nextXpNext;
        nextLevel += 1;
        nextXpNext = Math.floor(nextXpNext * XP_NEXT_MULTIPLIER);
    }

    return {
        xp: nextXp,
        level: nextLevel,
        xpNext: nextXpNext
    };
};

const getFloorCombatXp = (tier: number, floor: number) => {
    return COMBAT_XP_BASE + (tier * COMBAT_XP_TIER_FACTOR) + floor;
};

const grantCombatXpToParty = (
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
            combatSkill.maxLevel
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

const buildReplay = (
    run: DungeonRunState,
    players: Record<PlayerId, PlayerState>,
    inventoryAtStart: ReturnType<typeof getRunStorageInventorySnapshot>
): DungeonReplayState => {
    let events = run.events.slice(0, DUNGEON_REPLAY_MAX_EVENTS);
    let truncated = run.events.length > events.length || run.truncatedEvents > 0;
    let fallbackCriticalOnly = false;
    const bytes = encodeSize(events);
    if (bytes > DUNGEON_REPLAY_MAX_BYTES) {
        events = getReplayCriticalEvents(events);
        fallbackCriticalOnly = true;
        truncated = true;
    }

    const teamSnapshot = run.party.map((member) => {
        const player = players[member.playerId];
        return {
            playerId: member.playerId,
            name: player?.name ?? `Hero ${member.playerId}`,
            equipment: player?.equipment ?? {
                slots: {
                    Head: null,
                    Cape: null,
                    Torso: null,
                    Legs: null,
                    Hands: null,
                    Feet: null,
                    Ring: null,
                    Amulet: null,
                    Weapon: null,
                    Tablet: null
                },
                charges: {
                    Head: null,
                    Cape: null,
                    Torso: null,
                    Legs: null,
                    Hands: null,
                    Feet: null,
                    Ring: null,
                    Amulet: null,
                    Weapon: null,
                    Tablet: null
                }
            }
        };
    });

    return {
        runId: run.id,
        dungeonId: run.dungeonId,
        status: run.endReason === "victory" ? "victory" : "failed",
        endReason: run.endReason ?? "stopped",
        runIndex: run.runIndex,
        startedAt: run.startedAt,
        elapsedMs: run.elapsedMs,
        seed: run.seed,
        partyPlayerIds: run.party.map((member) => member.playerId),
        teamSnapshot,
        startInventory: inventoryAtStart,
        events,
        truncated,
        fallbackCriticalOnly,
        cadenceSnapshot: run.cadenceSnapshot
    };
};

const pushEvent = (run: DungeonRunState, event: Omit<DungeonReplayEvent, "atMs">) => {
    run.events.push({
        atMs: run.elapsedMs,
        ...event
    });
};

const pushEventWithGlobalCap = (run: DungeonRunState, event: Omit<DungeonReplayEvent, "atMs">) => {
    const isCritical = isCriticalEventType(event.type);
    if (!isCritical && run.nonCriticalEventCount >= DUNGEON_TOTAL_EVENT_CAP) {
        run.truncatedEvents += 1;
        return false;
    }
    pushEvent(run, event);
    if (!isCritical) {
        run.nonCriticalEventCount += 1;
    }
    return true;
};

const withRecoveredHeroes = (players: Record<PlayerId, PlayerState>, party: DungeonRunState["party"]) => {
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

const finalizeRun = (
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

const initializeFloor = (
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

export const createDungeonState = (): DungeonState => ({
    onboardingRequired: false,
    setup: {
        selectedDungeonId: DUNGEON_DEFINITIONS[0]?.id ?? "dungeon_ruines_humides",
        selectedPartyPlayerIds: [],
        autoRestart: true,
        autoConsumables: true
    },
    runs: {},
    activeRunId: null,
    latestReplay: null,
    completionCounts: {},
    policy: {
        maxConcurrentSupported: 3,
        maxConcurrentEnabled: 1
    }
});

export const normalizeDungeonState = (input?: DungeonState | null): DungeonState => {
    const fallback = createDungeonState();
    if (!input) {
        return fallback;
    }
    const selectedDungeonId = getDungeonDefinition(input.setup?.selectedDungeonId ?? "")
        ? (input.setup?.selectedDungeonId ?? fallback.setup.selectedDungeonId)
        : fallback.setup.selectedDungeonId;

    const maxConcurrentSupported = Math.max(
        1,
        Math.floor(input.policy?.maxConcurrentSupported ?? fallback.policy.maxConcurrentSupported)
    );
    const maxConcurrentEnabled = Math.max(
        1,
        Math.min(maxConcurrentSupported, Math.floor(input.policy?.maxConcurrentEnabled ?? fallback.policy.maxConcurrentEnabled))
    );
    const rawRuns = input.runs ?? {};
    const runs = Object.keys(rawRuns).reduce<Record<string, DungeonRunState>>((acc, runId) => {
        const run = rawRuns[runId];
        if (!run) {
            return acc;
        }
        const party = Array.isArray(run.party)
            ? run.party.map((member) => ({
                ...member,
                potionCooldownMs: Number.isFinite(member.potionCooldownMs) ? member.potionCooldownMs : 0,
                attackCooldownMs: Number.isFinite(member.attackCooldownMs) ? member.attackCooldownMs : 0,
                magicHealCooldownMs: Number.isFinite(member.magicHealCooldownMs) ? member.magicHealCooldownMs : 0,
                tauntUntilMs: Number.isFinite(member.tauntUntilMs) ? member.tauntUntilMs : null,
                tauntBonus: Number.isFinite(member.tauntBonus) ? member.tauntBonus : null,
                tauntStartedAtMs: Number.isFinite(member.tauntStartedAtMs) ? member.tauntStartedAtMs : null,
                stunnedUntilMs: Number.isFinite(member.stunnedUntilMs) ? member.stunnedUntilMs : null
            }))
            : [];
        const floorPauseMs = Number.isFinite(run.floorPauseMs)
            ? Math.max(0, Math.floor(run.floorPauseMs ?? 0))
            : null;
        acc[runId] = {
            ...run,
            party,
            floorPauseMs,
            cadenceSnapshot: Array.isArray(run.cadenceSnapshot) ? run.cadenceSnapshot : [],
            truncatedEvents: Number.isFinite(run.truncatedEvents) ? run.truncatedEvents : 0,
            nonCriticalEventCount: Number.isFinite(run.nonCriticalEventCount)
                ? Math.max(0, Math.floor(run.nonCriticalEventCount))
                : countNonCriticalEvents(run.events ?? []),
            threatByHeroId: buildThreatByHeroId(party, run.threatByHeroId ?? null),
            threatTieOrder: Array.isArray(run.threatTieOrder)
                ? run.threatTieOrder.map(String)
                : buildThreatTieOrder(run.seed ?? 0, party.map((member) => member.playerId)),
            targetHeroId: typeof run.targetHeroId === "string" ? run.targetHeroId : null
        };
        return acc;
    }, {});
    const activeRunId = input.activeRunId && runs[input.activeRunId] ? input.activeRunId : null;
    const latestReplay = input.latestReplay
        ? {
            ...input.latestReplay,
            cadenceSnapshot: Array.isArray(input.latestReplay.cadenceSnapshot) ? input.latestReplay.cadenceSnapshot : []
        }
        : null;
    const completionCounts = Object.entries(input.completionCounts ?? {}).reduce<Record<string, number>>((acc, [key, value]) => {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            acc[key] = Math.floor(parsed);
        }
        return acc;
    }, {});

    return {
        onboardingRequired: Boolean(input.onboardingRequired),
        setup: {
            selectedDungeonId,
            selectedPartyPlayerIds: Array.from(new Set((input.setup?.selectedPartyPlayerIds ?? []).map(String))),
            autoRestart: input.setup?.autoRestart ?? true,
            autoConsumables: input.setup?.autoConsumables ?? true
        },
        runs,
        activeRunId,
        latestReplay,
        completionCounts,
        policy: {
            maxConcurrentSupported,
            maxConcurrentEnabled
        }
    };
};

export type DungeonRiskTier = "Low" | "Medium" | "High" | "Deadly";

export const resolveDungeonRiskTier = (power: number, recommendedPower: number): DungeonRiskTier => {
    const safeRecommended = Number.isFinite(recommendedPower) ? Math.max(0, recommendedPower) : 0;
    if (!safeRecommended) {
        return "Medium";
    }
    const safePower = Number.isFinite(power) ? Math.max(0, power) : 0;
    const ratio = safePower / safeRecommended;
    if (ratio >= 1.2) {
        return "Low";
    }
    if (ratio >= 0.9) {
        return "Medium";
    }
    if (ratio >= 0.7) {
        return "High";
    }
    return "Deadly";
};

export const getDungeonRuns = (dungeon: DungeonState): DungeonRunState[] => {
    return Object.values(dungeon.runs)
        .slice()
        .sort((a, b) => (a.startedAt - b.startedAt) || a.id.localeCompare(b.id));
};

export const getActiveDungeonRunIds = (dungeon: DungeonState): string[] => {
    return getDungeonRuns(dungeon).filter((run) => isRunActive(run)).map((run) => run.id);
};

export const getActiveDungeonRuns = (dungeon: DungeonState): DungeonRunState[] => {
    return getActiveDungeonRunIds(dungeon)
        .map((runId) => dungeon.runs[runId])
        .filter((run): run is DungeonRunState => Boolean(run));
};

const getV1MaxConcurrentRuns = (dungeon: DungeonState): number => {
    // v1 intentionally enforces single-run execution, while policy shape is already future-ready.
    return Math.min(1, Math.max(1, Math.floor(dungeon.policy.maxConcurrentEnabled || 1)));
};

// Backward-compatible helper: returns the primary active run used by the v1 runtime loop.
export const getActiveDungeonRun = (dungeon: DungeonState): DungeonRunState | null => {
    if (dungeon.activeRunId && dungeon.runs[dungeon.activeRunId] && isRunActive(dungeon.runs[dungeon.activeRunId])) {
        return dungeon.runs[dungeon.activeRunId];
    }
    return getActiveDungeonRuns(dungeon)[0] ?? null;
};

export const isPlayerAssignedToActiveDungeonRun = (state: GameState, playerId: PlayerId): boolean => {
    return getActiveDungeonRuns(state.dungeon).some((run) => (
        run.party.some((member) => member.playerId === playerId)
    ));
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
    if (activeRuns.length >= getV1MaxConcurrentRuns(state.dungeon)) {
        return state;
    }

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

    const runId = `run-${timestamp}`;
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

export const applyDungeonTick = (
    state: GameState,
    deltaMs: number,
    timestamp: number
): {
    state: GameState;
    itemDeltas: ItemDelta;
    combatActiveMsByPlayer: Record<PlayerId, number>;
    combatXpByPlayer: Record<PlayerId, Partial<Record<CombatSkillId, number>>>;
} => {
    const activeRun = getActiveDungeonRun(state.dungeon);
    if (!activeRun) {
        return { state, itemDeltas: {}, combatActiveMsByPlayer: {}, combatXpByPlayer: {} };
    }

    const wasRunning = activeRun.status === "running";

    const definition = getDungeonDefinition(activeRun.dungeonId);
    if (!definition) {
        return { state, itemDeltas: {}, combatActiveMsByPlayer: {}, combatXpByPlayer: {} };
    }

    const run: DungeonRunState = {
        ...activeRun,
        party: activeRun.party.map((member) => ({ ...member })),
        enemies: activeRun.enemies.map((enemy) => ({ ...enemy })),
        events: activeRun.events.slice()
    };
    let inventory = cloneInventory(state.inventory);
    const itemDeltas: ItemDelta = {};
    const combatActiveMsByPlayer: Record<PlayerId, number> = {};
    const combatXpByPlayer: Record<PlayerId, Partial<Record<CombatSkillId, number>>> = {};
    let players = state.players;
    let completionCounts = state.dungeon.completionCounts ?? {};

    if (run.restartAt && timestamp >= run.restartAt && run.autoRestart) {
        const aliveCount = resolveAliveHeroIds(run).length;
        if (aliveCount > 0 && normalizeInventoryCount(inventory.items.food) > 0) {
            run.status = "running";
            run.endReason = null;
            run.restartAt = null;
            run.floor = 1;
            run.elapsedMs = 0;
            run.stepCarryMs = 0;
            run.floorPauseMs = null;
            run.events = [];
            run.runIndex += 1;
            const baseAttackMs = DUNGEON_BASE_ATTACK_MS;
            run.party = run.party.map((member) => {
                const player = players[member.playerId];
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
            run.cadenceSnapshot = buildCadenceSnapshot(run.party, players, timestamp, baseAttackMs);
            run.truncatedEvents = 0;
            run.nonCriticalEventCount = 0;
            run.threatByHeroId = buildThreatByHeroId(run.party);
            run.threatTieOrder = buildThreatTieOrder(run.seed, run.party.map((member) => member.playerId));
            run.targetHeroId = null;
            run.startInventory = getRunStorageInventorySnapshot(inventory);
            const initialized = initializeFloor(run, definition, inventory, itemDeltas);
            inventory = initialized.inventory;
        } else {
            run.status = "failed";
            run.endReason = "stopped";
            run.restartAt = null;
            run.floorPauseMs = null;
            pushEventWithGlobalCap(run, { type: "run_end", label: "Auto-restart canceled" });
        }
    }

    ensureRunCadenceState(run, players, timestamp);
    ensureRunThreatState(run);

    run.stepCarryMs += Math.max(0, deltaMs);

    const steps = Math.floor(run.stepCarryMs / DUNGEON_SIMULATION_STEP_MS);
    run.stepCarryMs -= steps * DUNGEON_SIMULATION_STEP_MS;
    const partyById = new Map(run.party.map((member) => [member.playerId, member]));
    const partyOrderIndex = new Map(run.party.map((member, index) => [member.playerId, index]));

    for (let step = 0; step < steps; step += 1) {
        if (run.status !== "running") {
            break;
        }
        let stepEventCount = 0;
        const pushEventWithStepCap = (event: Omit<DungeonReplayEvent, "atMs">) => {
            const isCritical = isCriticalEventType(event.type);
            if (!isCritical && stepEventCount >= DUNGEON_STEP_EVENT_CAP) {
                run.truncatedEvents += 1;
                return;
            }
            if (!pushEventWithGlobalCap(run, event)) {
                return;
            }
            if (!isCritical) {
                stepEventCount += 1;
            }
        };
        run.elapsedMs += DUNGEON_SIMULATION_STEP_MS;
        run.encounterStep += 1;
        const nowMs = run.elapsedMs;
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
                continue;
            }
            run.floorPauseMs = null;
            run.floor += 1;
            const initialized = initializeFloor(run, definition, inventory, itemDeltas);
            inventory = initialized.inventory;
            continue;
        }

        const aliveHeroIds = resolveAliveHeroIds(run);
        aliveHeroIds.forEach((playerId) => {
            combatActiveMsByPlayer[playerId] = (combatActiveMsByPlayer[playerId] ?? 0) + DUNGEON_SIMULATION_STEP_MS;
        });

        decayThreat(run.threatByHeroId);
        run.party.forEach((member) => {
            if (Number(member.tauntUntilMs) > nowMs) {
                if (!Number.isFinite(member.tauntStartedAtMs)) {
                    member.tauntStartedAtMs = nowMs;
                    addThreat(run.threatByHeroId, member.playerId, member.tauntBonus ?? TAUNT_THREAT_BONUS);
                }
                return;
            }
            if (Number.isFinite(member.tauntStartedAtMs)) {
                member.tauntStartedAtMs = null;
                member.tauntUntilMs = null;
                member.tauntBonus = null;
            }
        });

        const heroStepCache = new Map<PlayerId, {
            attackIntervalMs: number;
            baseDamage: number;
            threatMultiplier: number;
            damageTakenMultiplier: number;
            weaponType: WeaponType;
        }>();
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
            heroStepCache.set(playerId, {
                attackIntervalMs,
                baseDamage,
                threatMultiplier: resolveThreatMultiplier(weaponType),
                damageTakenMultiplier: resolveDamageTakenMultiplier(weaponType),
                weaponType
            });
        });

        let targetEnemy = resolveTargetEnemy(run.enemies, run.targetEnemyId);
        if (!targetEnemy) {
            continue;
        }

        // Heroes attack first (cooldown-based cadence).
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
                const baseDamage = cached.baseDamage;
                const reducedDamage = enemy.isBoss && enemy.mechanic === "shield" && run.encounterStep <= 3
                    ? Math.max(1, Math.round(baseDamage * 0.6))
                    : baseDamage;
                enemy.hp = Math.max(0, enemy.hp - reducedDamage);
                addThreat(run.threatByHeroId, playerId, reducedDamage * cached.threatMultiplier);
                pushEventWithStepCap({
                    type: "attack",
                    sourceId: playerId,
                    targetId: enemy.id,
                    amount: reducedDamage,
                    label: player.name
                });
                pushEventWithStepCap({
                    type: "damage",
                    sourceId: playerId,
                    targetId: enemy.id,
                    amount: reducedDamage
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

        if (!targetEnemy) {
            const floorCombatXp = getFloorCombatXp(definition.tier, run.floor);
            const bossBonusCombatXp = run.floor >= run.floorCount ? floorCombatXp * 2 : 0;
            players = grantCombatXpToParty(
                players,
                run.party,
                floorCombatXp + bossBonusCombatXp,
                combatXpByPlayer
            );

            if (run.floor >= run.floorCount) {
                const bossGold = Math.max(25, definition.tier * 75);
                inventory.items.gold = normalizeInventoryCount(inventory.items.gold) + bossGold;
                addItemDelta(itemDeltas, "gold", bossGold);
                run.status = "victory";
                run.endReason = "victory";
                run.floorPauseMs = null;
                run.party = recoverRunParty(run.party);
                pushEventWithGlobalCap(run, {
                    type: "run_end",
                    label: "victory"
                });
                if (run.autoRestart) {
                    completionCounts = {
                        ...completionCounts,
                        [run.dungeonId]: (completionCounts[run.dungeonId] ?? 0) + 1
                    };
                }
                if (run.autoRestart) {
                    run.restartAt = timestamp + DUNGEON_AUTO_RESTART_DELAY_MS;
                }
                continue;
            }

            run.floorPauseMs = DUNGEON_FLOOR_PAUSE_MS;
            run.enemies = [];
            run.targetEnemyId = null;
            continue;
        }

        // Enemy attacks party.
        const activeEnemy = targetEnemy;
        const targetHeroId = resolveTargetHeroId(run, nowMs, activeEnemy.isBoss);
        run.targetHeroId = targetHeroId;
        if (targetHeroId) {
            const hero = partyById.get(targetHeroId);
            if (hero) {
                const cached = heroStepCache.get(targetHeroId);
                let enemyDamage = activeEnemy.damage;
                if (activeEnemy.isBoss && activeEnemy.mechanic === "burst" && run.encounterStep % 4 === 0) {
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
                hero.hp = Math.max(0, hero.hp - adjustedDamage);
                pushEventWithStepCap({
                    type: "attack",
                    sourceId: activeEnemy.id,
                    targetId: targetHeroId,
                    amount: adjustedDamage,
                    label: activeEnemy.name
                });
                pushEventWithStepCap({
                    type: "damage",
                    sourceId: activeEnemy.id,
                    targetId: targetHeroId,
                    amount: adjustedDamage
                });
                if (hero.hp <= 0) {
                    pushEventWithStepCap({
                        type: "death",
                        sourceId: targetHeroId,
                        label: state.players[targetHeroId]?.name ?? targetHeroId
                    });
                }
            }
        }

        if (activeEnemy.isBoss && activeEnemy.mechanic === "poison") {
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
                member.hp = Math.max(0, member.hp - adjustedDamage);
                pushEventWithStepCap({
                    type: "damage",
                    sourceId: activeEnemy.id,
                    targetId: member.playerId,
                    amount: adjustedDamage,
                    label: "Poison"
                });
            });
        }

        if (activeEnemy.isBoss && activeEnemy.mechanic === "summon" && run.encounterStep % 6 === 0) {
            const summonHp = Math.max(1, Math.round(activeEnemy.hpMax * 0.2));
            const summonDamage = Math.max(1, Math.round(activeEnemy.damage * 0.5));
            const summon: DungeonRunEnemyState = {
                id: `add-${run.runIndex}-${run.floor}-${run.encounterStep}`,
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

        // Magic weapon ally heal (cooldown-based).
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

        // Potion auto-use below 50% HP.
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
                const amount = healAmount(member.hpMax);
                member.hp = Math.min(member.hpMax, member.hp + amount);
                member.potionCooldownMs = 500;
                addThreat(run.threatByHeroId, member.playerId, amount * HEAL_THREAT_RATIO);
                pushEventWithStepCap({
                    type: "heal",
                    sourceId: member.playerId,
                    amount,
                    label: potionType
                });
            });
        }

        if (resolveAliveHeroIds(run).length === 0) {
            run.status = "failed";
            run.endReason = "wipe";
            pushEventWithGlobalCap(run, {
                type: "run_end",
                label: "wipe"
            });
            break;
        }
    }

    let dungeon = {
        ...state.dungeon,
        runs: {
            ...state.dungeon.runs,
            [run.id]: run
        },
        completionCounts
    };

    if (run.status === "failed" || (run.status === "victory" && !run.autoRestart)) {
        players = withRecoveredHeroes(players, run.party);
        dungeon = finalizeRun(dungeon, run, players);
    } else {
        dungeon.activeRunId = run.id;
    }

    const runEndedNow = wasRunning && run.status !== "running";
    let nextState: GameState = {
        ...state,
        players,
        inventory,
        dungeon
    };
    if (runEndedNow) {
        const dungeonLabel = definition.name ?? run.dungeonId;
        const reasonLabel = formatDungeonEndReason(run.endReason ?? run.status);
        nextState = appendActionJournalEntry(nextState, {
            id: buildJournalEntryId(timestamp),
            at: timestamp,
            label: `Dungeon ended: ${dungeonLabel} (${reasonLabel})`
        });
    }

    return {
        state: nextState,
        itemDeltas,
        combatActiveMsByPlayer,
        combatXpByPlayer
    };
};
