import { ATTACK_LUNGE_WINDOW_MS, DUNGEON_FLOAT_WINDOW_MS, MAGIC_PULSE_WINDOW_MS } from "./constants";
import {
    buildFloatingTexts,
    clamp,
    createHeroSeed,
    getBossPhaseLabel,
    getReplayEventsUntil,
    getReplayJumpMarksFromEvents,
    inferEnemyHpCap,
    isPartyEntity,
    parseHpSnapshotFromLabel,
    toSortedEntities,
    toUnitPositionMap
} from "./helpers";
import type {
    ArenaEntityState,
    DungeonArenaFrame,
    DungeonArenaMagicCue,
    DungeonArenaAttackCue,
    DungeonReplayJumpMarks,
    DungeonReplayState,
    DungeonRunState,
    HeroSeed,
    PlayerId,
    PlayerState
} from "./types";

type BuildFrameInput = {
    events: DungeonReplayState["events"];
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
    const scopedEvents = getReplayEventsUntil(events, atMs);
    const enemyHpCaps = inferEnemyHpCap(scopedEvents, partyIds);
    const states: Record<string, ArenaEntityState> = {};
    let spawnOrder = 0;
    let floorLabel: string | null = null;
    let statusLabel: string | null = overrideStatusLabel ?? null;
    let targetEnemyId: string | null = overrideTargetEnemyId ?? null;
    let bossId: string | null = null;
    const latestAttacks = new Map<string, DungeonArenaAttackCue>();
    const latestMagicHeals = new Map<string, DungeonArenaMagicCue>();

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
            if (event.targetId) {
                const hpSnapshot = parseHpSnapshotFromLabel(event.label);
                if (hpSnapshot) {
                    const target = isPartyEntity(partyIds, event.targetId)
                        ? states[event.targetId]
                        : ensureEnemy(event.targetId);
                    if (target) {
                        target.hpMax = hpSnapshot.hpMax;
                        target.hp = clamp(hpSnapshot.hp, 0, target.hpMax);
                        target.alive = target.hp > 0;
                    }
                }
            }
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
            const hpSnapshot = parseHpSnapshotFromLabel(event.label);
            if (hpSnapshot) {
                entity.hpMax = hpSnapshot.hpMax;
                entity.hp = clamp(hpSnapshot.hp, 0, entity.hpMax);
            } else {
                entity.hp = Math.max(0, entity.hp - Math.max(0, Math.round(event.amount ?? 0)));
            }
            entity.alive = entity.hp > 0;
            return;
        }

        if (event.type === "heal") {
            const targetId = event.targetId ?? event.sourceId;
            if (!targetId) {
                return;
            }
            if (event.sourceId) {
                const isMagic = event.label === "Magic" || (event.targetId && event.targetId !== event.sourceId);
                if (isMagic) {
                    latestMagicHeals.set(event.sourceId, {
                        sourceId: event.sourceId,
                        atMs: event.atMs
                    });
                }
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
    const magicCues = [...latestMagicHeals.values()].filter((cue) => (
        cue.atMs <= atMs && atMs - cue.atMs <= MAGIC_PULSE_WINDOW_MS
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
        attackCues,
        magicCues
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
    const totalMs = Math.max(run.elapsedMs, run.events.at(-1)?.atMs ?? 0);
    // If auto-restart is queued, the UI playback cursor intentionally overruns the run end.
    // Preserve that overrun so renderer-only VFX can age out (similar to floating texts).
    const overrunCapMs = totalMs + DUNGEON_FLOAT_WINDOW_MS * 2;
    const boundedAtMs = clamp(atMs, 0, run.restartAt ? overrunCapMs : totalMs);
    const frame = buildFrameFromEvents({
        events: run.events,
        partySeeds,
        totalMs,
        atMs: boundedAtMs,
        floatingAtMs: floatingAtMs ?? atMs,
        overrideTargetEnemyId: run.targetEnemyId,
        overrideStatusLabel: run.status
    });

    if (frame.units.length === 0) {
        const fallbackStates: Record<string, ArenaEntityState> = {};
        partySeeds.forEach((seed, index) => {
            fallbackStates[seed.id] = {
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
        });
        run.enemies.forEach((enemy, index) => {
            const hpMax = Math.max(1, Math.round(enemy.hpMax || enemy.hp || 1));
            const hp = Math.max(0, Math.min(hpMax, Math.round(enemy.hp || 0)));
            fallbackStates[enemy.id] = {
                id: enemy.id,
                name: enemy.name,
                hp,
                hpMax,
                alive: hp > 0,
                isEnemy: true,
                isBoss: enemy.isBoss,
                spawnOrder: partySeeds.length + index
            };
        });
        frame.units = toUnitPositionMap(toSortedEntities(fallbackStates));
    }

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
