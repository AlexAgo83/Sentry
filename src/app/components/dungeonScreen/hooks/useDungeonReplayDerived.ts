import { useMemo } from "react";
import {
    DUNGEON_SIMULATION_STEP_MS,
    HEAL_THREAT_RATIO,
    MELEE_THREAT_MULTIPLIER,
    THREAT_DECAY
} from "../../../../core/dungeon";
import { getEquippedWeaponType } from "../../../../data/equipment";
import type { DungeonReplayState, PlayerId, PlayerState } from "../../../../core/types";
import type { DamageTotals } from "../types";
import { clampValue, MAGIC_HEAL_COOLDOWN_MS, normalizeHpMax, POTION_COOLDOWN_MS } from "../utils";

const computeDamageTotalsUntil = (
    replay: DungeonReplayState | null,
    cursorMs: number
): DamageTotals => {
    const heroTotals = new Map<string, number>();
    const enemyTotals = new Map<string, number>();
    if (!replay) {
        return { heroTotals, enemyTotals, groupTotal: 0 };
    }
    const partyIds = new Set(replay.partyPlayerIds);
    replay.events.forEach((event) => {
        if (event.type !== "damage" || event.atMs > cursorMs) {
            return;
        }
        const amount = Number(event.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }
        const sourceId = event.sourceId ?? "";
        const targetId = event.targetId ?? "";
        if (partyIds.has(sourceId) && targetId.startsWith("entity_")) {
            heroTotals.set(sourceId, (heroTotals.get(sourceId) ?? 0) + amount);
        } else if (sourceId.startsWith("entity_") && partyIds.has(targetId)) {
            enemyTotals.set(sourceId, (enemyTotals.get(sourceId) ?? 0) + amount);
        }
    });
    const groupTotal = Array.from(heroTotals.values()).reduce((sum, value) => sum + value, 0);
    return { heroTotals, enemyTotals, groupTotal };
};

export const useDungeonReplayDerived = (
    latestReplay: DungeonReplayState | null,
    replayCursorMs: number,
    replayTotalMs: number,
    players: Record<PlayerId, PlayerState>
) => {
    const replayFloorMarks = useMemo(() => {
        if (!latestReplay || replayTotalMs <= 0) {
            return [];
        }
        const events = latestReplay.events;
        const floorStartIndices: number[] = [];
        events.forEach((event, index) => {
            if (event.type === "floor_start") {
                floorStartIndices.push(index);
            }
        });
        return floorStartIndices
            .map((startIndex, index) => {
                const nextIndex = floorStartIndices[index + 1] ?? events.length;
                let hasBoss = false;
                for (let i = startIndex + 1; i < nextIndex; i += 1) {
                    if (events[i].type === "boss_start") {
                        hasBoss = true;
                        break;
                    }
                }
                return {
                    atMs: events[startIndex].atMs,
                    label: hasBoss ? "BOSS" : String(index + 1)
                };
            })
            .filter((mark) => Number.isFinite(mark.atMs) && mark.atMs >= 0);
    }, [latestReplay, replayTotalMs]);

    const replayTrackGradient = useMemo(() => {
        if (!latestReplay || replayTotalMs <= 0 || replayFloorMarks.length === 0) {
            return "";
        }
        const sortedMarks = [...replayFloorMarks].sort((a, b) => a.atMs - b.atMs);
        const stops: string[] = [];
        sortedMarks.forEach((mark, index) => {
            const start = clampValue((mark.atMs / replayTotalMs) * 100, 0, 100);
            const endAt = sortedMarks[index + 1]?.atMs ?? replayTotalMs;
            const end = clampValue((endAt / replayTotalMs) * 100, 0, 100);
            const color = index % 2 === 0 ? "var(--replay-track-a)" : "var(--replay-track-b)";
            stops.push(`${color} ${start}%`, `${color} ${end}%`);
        });
        return `linear-gradient(90deg, ${stops.join(", ")})`;
    }, [latestReplay, replayFloorMarks, replayTotalMs]);

    const replayDeathMarks = useMemo(() => {
        if (!latestReplay || replayTotalMs <= 0) {
            return [];
        }
        const partyIds = new Set(latestReplay.partyPlayerIds);
        return latestReplay.events
            .map((event, index) => ({ event, index }))
            .filter(({ event }) => (
                event.type === "death"
                && Boolean(event.sourceId)
                && partyIds.has(event.sourceId!)
            ))
            .map(({ event, index }) => ({
                atMs: event.atMs,
                label: event.label ?? players[event.sourceId!]?.name ?? event.sourceId ?? "Hero",
                id: `${event.atMs}-${event.sourceId}-${index}`
            }))
            .filter((mark) => Number.isFinite(mark.atMs) && mark.atMs >= 0);
    }, [latestReplay, replayTotalMs, players]);

    const replayHighlightAtMs = useMemo(() => {
        if (!latestReplay || latestReplay.events.length === 0) {
            return null;
        }
        const cursorMs = Math.round(replayCursorMs);
        let lastAtMs: number | null = null;
        for (const event of latestReplay.events) {
            if (event.atMs <= cursorMs) {
                lastAtMs = event.atMs;
            } else {
                break;
            }
        }
        return lastAtMs;
    }, [latestReplay, replayCursorMs]);

    const replayDamageTotals = useMemo(() => {
        return computeDamageTotalsUntil(latestReplay, Math.round(replayCursorMs));
    }, [latestReplay, replayCursorMs]);

    const replayThreatTotals = useMemo(() => {
        const totals = new Map<string, number>();
        if (!latestReplay) {
            return { totals, total: 0, top: 0 };
        }
        const partyIds = new Set(latestReplay.partyPlayerIds);
        const weaponTypeById = new Map<string, ReturnType<typeof getEquippedWeaponType>>();
        latestReplay.teamSnapshot.forEach((entry) => {
            weaponTypeById.set(entry.playerId, getEquippedWeaponType(entry.equipment));
        });
        latestReplay.partyPlayerIds.forEach((playerId) => {
            totals.set(playerId, 0);
        });
        const cursorMs = Math.round(replayCursorMs);
        let lastDecayAt = 0;
        for (const event of latestReplay.events) {
            if (event.atMs > cursorMs) {
                break;
            }
            const elapsed = event.atMs - lastDecayAt;
            if (elapsed >= DUNGEON_SIMULATION_STEP_MS) {
                const steps = Math.floor(elapsed / DUNGEON_SIMULATION_STEP_MS);
                const decayFactor = Math.pow(THREAT_DECAY, steps);
                totals.forEach((value, id) => {
                    totals.set(id, value * decayFactor);
                });
                lastDecayAt += steps * DUNGEON_SIMULATION_STEP_MS;
            }
            if (event.type === "damage" && event.sourceId && event.targetId?.startsWith("entity_")) {
                if (partyIds.has(event.sourceId)) {
                    const amount = Math.max(0, Number(event.amount ?? 0));
                    const weaponType = weaponTypeById.get(event.sourceId) ?? "Melee";
                    const threatMultiplier = weaponType === "Melee" ? MELEE_THREAT_MULTIPLIER : 1;
                    totals.set(event.sourceId, (totals.get(event.sourceId) ?? 0) + amount * threatMultiplier);
                }
            }
            if (event.type === "heal" && event.sourceId && partyIds.has(event.sourceId)) {
                const amount = Math.max(0, Number(event.amount ?? 0));
                totals.set(event.sourceId, (totals.get(event.sourceId) ?? 0) + amount * HEAL_THREAT_RATIO);
            }
            if (event.type === "death" && event.sourceId && partyIds.has(event.sourceId)) {
                totals.set(event.sourceId, 0);
            }
        }
        const remaining = cursorMs - lastDecayAt;
        if (remaining >= DUNGEON_SIMULATION_STEP_MS) {
            const steps = Math.floor(remaining / DUNGEON_SIMULATION_STEP_MS);
            const decayFactor = Math.pow(THREAT_DECAY, steps);
            totals.forEach((value, id) => {
                totals.set(id, value * decayFactor);
            });
        }
        const total = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
        const top = Math.max(...Array.from(totals.values()), 0);
        return { totals, total, top };
    }, [latestReplay, replayCursorMs]);

    const replayCooldowns = useMemo(() => {
        if (!latestReplay) {
            return new Map<PlayerId, { magicMs: number; potionMs: number }>();
        }
        const cursorMs = Math.round(replayCursorMs);
        const lastMagicByHero = new Map<PlayerId, number>();
        const lastPotionByHero = new Map<PlayerId, number>();
        latestReplay.events.forEach((event) => {
            if (event.atMs > cursorMs) {
                return;
            }
            if (event.type !== "heal" || !event.sourceId) {
                return;
            }
            const sourceId = event.sourceId as PlayerId;
            const isMagic = event.label === "Magic" || (event.targetId && event.targetId !== event.sourceId);
            if (isMagic) {
                lastMagicByHero.set(sourceId, event.atMs);
            } else {
                lastPotionByHero.set(sourceId, event.atMs);
            }
        });
        const result = new Map<PlayerId, { magicMs: number; potionMs: number }>();
        const heroIds = new Set<PlayerId>([...lastMagicByHero.keys(), ...lastPotionByHero.keys()]);
        heroIds.forEach((heroId) => {
            const magicAt = lastMagicByHero.get(heroId);
            const potionAt = lastPotionByHero.get(heroId);
            const magicMs = magicAt === undefined ? 0 : Math.max(0, MAGIC_HEAL_COOLDOWN_MS - (cursorMs - magicAt));
            const potionMs = potionAt === undefined ? 0 : Math.max(0, POTION_COOLDOWN_MS - (cursorMs - potionAt));
            if (magicMs > 0 || potionMs > 0) {
                result.set(heroId, { magicMs, potionMs });
            }
        });
        return result;
    }, [latestReplay, replayCursorMs]);

    const heroNameById = useMemo(() => {
        const map = new Map<string, string>();
        if (latestReplay?.teamSnapshot) {
            latestReplay.teamSnapshot.forEach((entry) => {
                map.set(entry.playerId, entry.name);
            });
        }
        Object.values(players).forEach((player) => {
            map.set(player.id, player.name);
        });
        return map;
    }, [latestReplay, players]);

    const replayHealLogMeta = useMemo(() => {
        const meta = new Map<number, { amount: number; hp: number; hpMax: number; targetId: string }>();
        if (!latestReplay) {
            return meta;
        }
        const partyIds = new Set(latestReplay.partyPlayerIds);
        const hpMaxById = new Map<string, number>();
        latestReplay.partyPlayerIds.forEach((playerId) => {
            hpMaxById.set(playerId, normalizeHpMax(players[playerId]?.hpMax));
        });
        const hpById = new Map<string, number>();
        hpMaxById.forEach((hpMax, playerId) => {
            hpById.set(playerId, hpMax);
        });
        latestReplay.events.forEach((event, index) => {
            const targetId = event.targetId ?? event.sourceId;
            if (!targetId || !partyIds.has(targetId)) {
                return;
            }
            const hpMax = hpMaxById.get(targetId) ?? normalizeHpMax(players[targetId]?.hpMax);
            const currentHp = hpById.get(targetId) ?? hpMax;
            const amount = Math.max(0, Math.round(event.amount ?? 0));
            if (event.type === "damage" && event.targetId) {
                hpById.set(targetId, Math.max(0, currentHp - amount));
                return;
            }
            if (event.type === "heal") {
                const nextHp = clampValue(currentHp + amount, 0, hpMax);
                hpById.set(targetId, nextHp);
                meta.set(index, {
                    amount,
                    hp: nextHp,
                    hpMax,
                    targetId
                });
                return;
            }
            if (event.type === "death" && event.sourceId === targetId) {
                hpById.set(targetId, 0);
            }
        });
        return meta;
    }, [latestReplay, players]);

    return {
        replayFloorMarks,
        replayTrackGradient,
        replayDeathMarks,
        replayHighlightAtMs,
        replayDamageTotals,
        replayThreatTotals,
        replayCooldowns,
        heroNameById,
        replayHealLogMeta
    };
};

export { computeDamageTotalsUntil };
