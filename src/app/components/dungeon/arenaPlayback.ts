import type {
    DungeonReplayEvent,
    DungeonReplayState,
    DungeonRunState,
    PlayerEquipmentState,
    PlayerId,
    PlayerState,
    WeaponType
} from "../../../core/types";
import { getEquippedWeaponType } from "../../../data/equipment";
import { getHairColor, getSkinColor } from "../../ui/heroHair";

export const DUNGEON_FLOAT_WINDOW_MS = 1_400;
const FLOAT_MAX_COUNT = 20;
const ATTACK_LUNGE_WINDOW_MS = 260;

const PARTY_LAYOUT: Array<{ x: number; y: number }> = [
    { x: 0.2, y: 0.38 },
    { x: 0.2, y: 0.62 },
    { x: 0.32, y: 0.32 },
    { x: 0.32, y: 0.68 }
];

type HeroSeed = {
    id: string;
    name: string;
    hpMax: number;
    skinColor: string;
    hairColor: string;
    helmetVisible: boolean;
    weaponType: WeaponType;
};

type ArenaEntityState = {
    id: string;
    name: string;
    hp: number;
    hpMax: number;
    alive: boolean;
    isEnemy: boolean;
    isBoss: boolean;
    spawnOrder: number;
    skinColor?: string;
    hairColor?: string;
    helmetVisible?: boolean;
    weaponType?: WeaponType;
};

export type DungeonArenaFloatingText = {
    id: string;
    targetId: string;
    amount: number;
    kind: "damage" | "heal";
    progress: number;
};

export type DungeonArenaAttackCue = {
    sourceId: string;
    targetId: string;
    atMs: number;
};

export type DungeonArenaUnit = {
    id: string;
    name: string;
    hp: number;
    hpMax: number;
    alive: boolean;
    isEnemy: boolean;
    isBoss: boolean;
    x: number;
    y: number;
    skinColor?: string;
    hairColor?: string;
    helmetVisible?: boolean;
    weaponType?: WeaponType;
};

export type DungeonArenaFrame = {
    atMs: number;
    totalMs: number;
    targetEnemyId: string | null;
    bossId: string | null;
    bossPhaseLabel: string | null;
    floorLabel: string | null;
    statusLabel: string | null;
    units: DungeonArenaUnit[];
    floatingTexts: DungeonArenaFloatingText[];
    attackCues: DungeonArenaAttackCue[];
};

export type DungeonReplayJumpMarks = {
    firstDeathAtMs: number | null;
    runEndAtMs: number | null;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeHpMax = (value: number | undefined) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 100;
    }
    return Math.max(1, Math.round(parsed));
};

const hasHelmetEquipped = (equipment?: PlayerEquipmentState | null) => {
    return Boolean(equipment?.slots?.Head);
};

const createHeroSeed = (
    playerId: string,
    player: PlayerState | undefined,
    fallbackName?: string,
    fallbackHpMax?: number,
    fallbackEquipment?: PlayerEquipmentState
): HeroSeed => {
    const appearance = player?.appearance;
    const showHelmet = appearance?.showHelmet ?? true;
    const helmetVisible = showHelmet && hasHelmetEquipped(fallbackEquipment ?? player?.equipment);
    const weaponType = getEquippedWeaponType(fallbackEquipment ?? player?.equipment);
    return {
        id: playerId,
        name: fallbackName ?? player?.name ?? `Hero ${playerId}`,
        hpMax: normalizeHpMax(fallbackHpMax ?? player?.hpMax),
        skinColor: appearance?.skinColor ?? getSkinColor(playerId),
        hairColor: appearance?.hairColor ?? getHairColor(playerId),
        helmetVisible,
        weaponType
    };
};

const isPartyEntity = (partyIds: Set<string>, id?: string) => Boolean(id && partyIds.has(id));

const toSortedEntities = (states: Record<string, ArenaEntityState>): ArenaEntityState[] => {
    return Object.values(states)
        .sort((a, b) => (a.spawnOrder - b.spawnOrder) || a.id.localeCompare(b.id));
};

const toUnitPositionMap = (entities: ArenaEntityState[]) => {
    const units: DungeonArenaUnit[] = [];
    const partyUnits = entities.filter((entity) => !entity.isEnemy);
    const enemyUnits = entities.filter((entity) => entity.isEnemy);
    const boss = enemyUnits.find((entity) => entity.isBoss);
    const adds = enemyUnits.filter((entity) => !entity.isBoss);

    partyUnits.forEach((entity, index) => {
        const slot = PARTY_LAYOUT[index] ?? PARTY_LAYOUT[PARTY_LAYOUT.length - 1];
        units.push({
            id: entity.id,
            name: entity.name,
            hp: entity.hp,
            hpMax: entity.hpMax,
            alive: entity.alive,
            isEnemy: false,
            isBoss: false,
            x: slot.x,
            y: slot.y,
            skinColor: entity.skinColor,
            hairColor: entity.hairColor,
            helmetVisible: entity.helmetVisible,
            weaponType: entity.weaponType
        });
    });

    if (boss) {
        units.push({
            id: boss.id,
            name: boss.name,
            hp: boss.hp,
            hpMax: boss.hpMax,
            alive: boss.alive,
            isEnemy: true,
            isBoss: true,
            x: 0.82,
            y: 0.5
        });
    }

    adds.forEach((entity, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        units.push({
            id: entity.id,
            name: entity.name,
            hp: entity.hp,
            hpMax: entity.hpMax,
            alive: entity.alive,
            isEnemy: true,
            isBoss: false,
            x: 0.66 + col * 0.12,
            y: 0.3 + row * 0.18
        });
    });

    return units;
};

const getBossPhaseLabel = (boss: DungeonArenaUnit | undefined): string | null => {
    if (!boss || boss.hpMax <= 0 || boss.hp <= 0) {
        return null;
    }
    const ratio = boss.hp / boss.hpMax;
    if (ratio > 0.66) {
        return "Boss phase 1";
    }
    if (ratio > 0.33) {
        return "Boss phase 2";
    }
    return "Boss final phase";
};

const getReplayEventsUntil = (events: DungeonReplayEvent[], atMs: number): DungeonReplayEvent[] => {
    return events.filter((event) => event.atMs <= atMs);
};

const inferEnemyHpCap = (
    events: DungeonReplayEvent[],
    partyIds: Set<string>
): Record<string, number> => {
    const damageTotals: Record<string, number> = {};
    const died: Record<string, boolean> = {};

    events.forEach((event) => {
        if (event.type === "damage" && event.targetId && !isPartyEntity(partyIds, event.targetId)) {
            damageTotals[event.targetId] = (damageTotals[event.targetId] ?? 0) + Math.max(0, event.amount ?? 0);
        }
        if (event.type === "death" && event.sourceId && !isPartyEntity(partyIds, event.sourceId)) {
            died[event.sourceId] = true;
        }
    });

    const caps: Record<string, number> = {};
    Object.entries(damageTotals).forEach(([id, totalDamage]) => {
        const scaled = died[id] ? totalDamage : Math.ceil(totalDamage * 1.25);
        caps[id] = normalizeHpMax(Math.max(60, scaled));
    });
    return caps;
};

const buildFloatingTexts = (
    events: DungeonReplayEvent[],
    atMs: number
): DungeonArenaFloatingText[] => {
    const lastFloorStart = [...events]
        .reverse()
        .find((event) => event.type === "floor_start" && event.atMs <= atMs)?.atMs ?? -Infinity;
    const windowStart = Math.max(atMs - DUNGEON_FLOAT_WINDOW_MS, lastFloorStart);

    return events
        .map((event, eventIndex) => ({ event, eventIndex }))
        .filter(({ event }) => (
            (event.type === "damage" || event.type === "heal")
            && event.atMs <= atMs
            && event.atMs >= windowStart
            && typeof event.amount === "number"
            && Number.isFinite(event.amount)
            && event.amount > 0
        ))
        .slice(-FLOAT_MAX_COUNT)
        .map(({ event, eventIndex }) => {
            const age = Math.max(0, atMs - event.atMs);
            const kind: DungeonArenaFloatingText["kind"] = event.type === "heal" ? "heal" : "damage";
            return {
                id: `${event.type}-${event.atMs}-${eventIndex}`,
                targetId: event.targetId ?? event.sourceId ?? "",
                amount: Math.max(1, Math.round(event.amount ?? 0)),
                kind,
                progress: clamp(age / DUNGEON_FLOAT_WINDOW_MS, 0, 1)
            };
        })
        .filter((entry) => Boolean(entry.targetId));
};

const getReplayJumpMarksFromEvents = (events: DungeonReplayEvent[]): DungeonReplayJumpMarks => {
    const firstDeathEvent = events.find((event) => event.type === "death");
    const endEvent = [...events].reverse().find((event) => event.type === "run_end");
    return {
        firstDeathAtMs: firstDeathEvent?.atMs ?? null,
        runEndAtMs: endEvent?.atMs ?? null
    };
};

type BuildFrameInput = {
    events: DungeonReplayEvent[];
    partySeeds: HeroSeed[];
    totalMs: number;
    atMs: number;
    floatingAtMs?: number;
    overrideTargetEnemyId?: string | null;
    overrideStatusLabel?: string | null;
};

const buildFrameFromEvents = ({
    events,
    partySeeds,
    totalMs,
    atMs,
    floatingAtMs,
    overrideTargetEnemyId,
    overrideStatusLabel
}: BuildFrameInput): DungeonArenaFrame => {
    const partyIds = new Set(partySeeds.map((seed) => seed.id));
    const enemyHpCaps = inferEnemyHpCap(events, partyIds);
    const scopedEvents = getReplayEventsUntil(events, atMs);
    const states: Record<string, ArenaEntityState> = {};
    let spawnOrder = 0;
    let floorLabel: string | null = null;
    let statusLabel: string | null = overrideStatusLabel ?? null;
    let targetEnemyId: string | null = overrideTargetEnemyId ?? null;
    let bossId: string | null = null;
    const latestAttacks = new Map<string, DungeonArenaAttackCue>();

    partySeeds.forEach((seed, index) => {
        states[seed.id] = {
            id: seed.id,
            name: seed.name,
            hp: seed.hpMax,
            hpMax: seed.hpMax,
            alive: true,
            isEnemy: false,
            isBoss: false,
            spawnOrder: index,
            skinColor: seed.skinColor,
            hairColor: seed.hairColor,
            helmetVisible: seed.helmetVisible,
            weaponType: seed.weaponType
        };
        spawnOrder = index + 1;
    });

    const ensureEnemy = (enemyId: string, label?: string) => {
        if (states[enemyId]) {
            return states[enemyId];
        }
        const hpMax = enemyHpCaps[enemyId] ?? 120;
        states[enemyId] = {
            id: enemyId,
            name: label ?? enemyId,
            hp: hpMax,
            hpMax,
            alive: true,
            isEnemy: true,
            isBoss: false,
            spawnOrder: spawnOrder++
        };
        return states[enemyId];
    };

    scopedEvents.forEach((event) => {
        if (event.type === "floor_start") {
            floorLabel = event.label ?? floorLabel;
            Object.keys(states).forEach((entityId) => {
                if (!partyIds.has(entityId)) {
                    delete states[entityId];
                }
            });
            targetEnemyId = null;
            bossId = null;
            return;
        }

        if (event.type === "boss_start" && event.sourceId) {
            bossId = event.sourceId;
            const enemy = ensureEnemy(event.sourceId, event.label);
            enemy.isBoss = true;
            return;
        }

        if (event.type === "spawn" && event.sourceId) {
            const enemy = ensureEnemy(event.sourceId, event.label);
            enemy.name = event.label ?? enemy.name;
            return;
        }

        if (event.type === "attack") {
            if (event.sourceId && event.targetId) {
                latestAttacks.set(event.sourceId, {
                    sourceId: event.sourceId,
                    targetId: event.targetId,
                    atMs: event.atMs
                });
            }
            if (event.targetId && !isPartyEntity(partyIds, event.targetId)) {
                targetEnemyId = event.targetId;
            }
            return;
        }

        if (event.type === "damage" && event.targetId) {
            const isHero = isPartyEntity(partyIds, event.targetId);
            const entity = isHero ? states[event.targetId] : ensureEnemy(event.targetId);
            if (!entity) {
                return;
            }
            entity.hp = Math.max(0, entity.hp - Math.max(0, Math.round(event.amount ?? 0)));
            entity.alive = entity.hp > 0;
            return;
        }

        if (event.type === "heal") {
            const targetId = event.targetId ?? event.sourceId;
            if (!targetId) {
                return;
            }
            const entity = isPartyEntity(partyIds, targetId) ? states[targetId] : ensureEnemy(targetId);
            if (!entity) {
                return;
            }
            entity.hp = clamp(entity.hp + Math.max(0, Math.round(event.amount ?? 0)), 0, entity.hpMax);
            entity.alive = entity.hp > 0;
            return;
        }

        if (event.type === "death" && event.sourceId) {
            const entity = states[event.sourceId] ?? ensureEnemy(event.sourceId, event.label);
            if (!entity) {
                return;
            }
            entity.hp = 0;
            entity.alive = false;
            return;
        }

        if (event.type === "run_end") {
            statusLabel = event.label ?? statusLabel ?? "run_end";
        }
    });

    const units = toUnitPositionMap(toSortedEntities(states));
    const boss = units.find((unit) => unit.id === bossId) ?? units.find((unit) => unit.isBoss);
    const floatingTime = Number.isFinite(floatingAtMs) ? Math.max(0, floatingAtMs ?? atMs) : atMs;
    const attackCues = [...latestAttacks.values()].filter((cue) => (
        cue.atMs <= atMs && atMs - cue.atMs <= ATTACK_LUNGE_WINDOW_MS
    ));

    return {
        atMs,
        totalMs,
        targetEnemyId,
        bossId: boss?.id ?? bossId,
        bossPhaseLabel: getBossPhaseLabel(boss),
        floorLabel,
        statusLabel,
        units,
        floatingTexts: buildFloatingTexts(events, floatingTime),
        attackCues
    };
};

export const buildDungeonArenaLiveFrame = (
    run: DungeonRunState,
    players: Record<PlayerId, PlayerState>,
    atMs: number,
    floatingAtMs?: number
): DungeonArenaFrame => {
    const partySeeds = run.party.map((member) => {
        const player = players[member.playerId];
        return createHeroSeed(member.playerId, player, player?.name, member.hpMax, player?.equipment);
    });
    const boundedAtMs = clamp(atMs, 0, Math.max(run.elapsedMs, run.events.at(-1)?.atMs ?? 0));
    const frame = buildFrameFromEvents({
        events: run.events,
        partySeeds,
        totalMs: Math.max(run.elapsedMs, run.events.at(-1)?.atMs ?? 0),
        atMs: boundedAtMs,
        floatingAtMs: floatingAtMs ?? atMs,
        overrideTargetEnemyId: run.targetEnemyId,
        overrideStatusLabel: run.status
    });

    if (boundedAtMs >= run.elapsedMs) {
        const hpByHero = new Map(run.party.map((member) => [member.playerId, member]));
        frame.units = frame.units.map((unit) => {
            if (unit.isEnemy) {
                const currentEnemy = run.enemies.find((enemy) => enemy.id === unit.id);
                if (!currentEnemy) {
                    return unit;
                }
                return {
                    ...unit,
                    hp: currentEnemy.hp,
                    hpMax: currentEnemy.hpMax,
                    alive: currentEnemy.hp > 0,
                    isBoss: currentEnemy.isBoss
                };
            }
            const hero = hpByHero.get(unit.id);
            if (!hero) {
                return unit;
            }
            return {
                ...unit,
                hp: hero.hp,
                hpMax: hero.hpMax,
                alive: hero.hp > 0
            };
        });
        const bossUnit = frame.units.find((unit) => unit.id === frame.bossId) ?? frame.units.find((unit) => unit.isBoss);
        frame.bossPhaseLabel = getBossPhaseLabel(bossUnit);
    }

    return frame;
};

export const buildDungeonArenaReplayFrame = (
    replay: DungeonReplayState,
    players: Record<PlayerId, PlayerState>,
    atMs: number
): DungeonArenaFrame => {
    const partySeeds = replay.partyPlayerIds.map((playerId) => {
        const player = players[playerId];
        const snapshot = replay.teamSnapshot.find((entry) => entry.playerId === playerId);
        return createHeroSeed(playerId, player, snapshot?.name, player?.hpMax, snapshot?.equipment);
    });
    const totalMs = Math.max(replay.elapsedMs, replay.events.at(-1)?.atMs ?? 0);
    return buildFrameFromEvents({
        events: replay.events,
        partySeeds,
        totalMs,
        atMs: clamp(atMs, 0, totalMs),
        overrideStatusLabel: replay.status
    });
};

export const getDungeonReplayJumpMarks = (replay: DungeonReplayState | null): DungeonReplayJumpMarks => {
    if (!replay) {
        return {
            firstDeathAtMs: null,
            runEndAtMs: null
        };
    }
    return getReplayJumpMarksFromEvents(replay.events);
};
