import { getEquippedWeaponType } from "../../../../data/equipment";
import { getHairColor, getSkinColor } from "../../../ui/heroHair";
import { DUNGEON_FLOAT_WINDOW_MS, FLOAT_MAX_COUNT, PARTY_LAYOUT } from "./constants";
import type {
    ArenaEntityState,
    DungeonArenaFloatingText,
    DungeonArenaUnit,
    DungeonReplayEvent,
    DungeonReplayJumpMarks,
    HeroSeed,
    PlayerEquipmentState,
    PlayerState
} from "./types";

const HP_LABEL_PATTERN = /\(HP\s+(\d+)\s*\/\s*(\d+)\)/i;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const normalizeHpMax = (value: number | undefined) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 100;
    }
    return Math.max(1, Math.round(parsed));
};

const hasHelmetEquipped = (equipment?: PlayerEquipmentState | null) => {
    return Boolean(equipment?.slots?.Head);
};

export const createHeroSeed = (
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

export const isPartyEntity = (partyIds: Set<string>, id?: string) => Boolean(id && partyIds.has(id));

export const toSortedEntities = (states: Record<string, ArenaEntityState>): ArenaEntityState[] => {
    return Object.values(states)
        .sort((a, b) => (a.spawnOrder - b.spawnOrder) || a.id.localeCompare(b.id));
};

export const toUnitPositionMap = (entities: ArenaEntityState[]) => {
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

export const getBossPhaseLabel = (boss: DungeonArenaUnit | undefined): string | null => {
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

export const getReplayEventsUntil = (events: DungeonReplayEvent[], atMs: number): DungeonReplayEvent[] => {
    return events.filter((event) => event.atMs <= atMs);
};

export const inferEnemyHpCap = (
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

export const parseHpSnapshotFromLabel = (label?: string): { hp: number; hpMax: number } | null => {
    if (typeof label !== "string" || label.length === 0) {
        return null;
    }
    const match = label.match(HP_LABEL_PATTERN);
    if (!match) {
        return null;
    }
    const hp = Number(match[1]);
    const hpMax = Number(match[2]);
    if (!Number.isFinite(hp) || !Number.isFinite(hpMax) || hpMax <= 0) {
        return null;
    }
    return {
        hp: clamp(Math.round(hp), 0, Math.round(hpMax)),
        hpMax: normalizeHpMax(hpMax)
    };
};

export const buildFloatingTexts = (
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

export const getReplayJumpMarksFromEvents = (events: DungeonReplayEvent[]): DungeonReplayJumpMarks => {
    const firstDeathEvent = events.find((event) => event.type === "death");
    const endEvent = [...events].reverse().find((event) => event.type === "run_end");
    return {
        firstDeathAtMs: firstDeathEvent?.atMs ?? null,
        runEndAtMs: endEvent?.atMs ?? null
    };
};
