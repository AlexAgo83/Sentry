import { memo, useEffect, useMemo, useRef, useState } from "react";
import type {
    DungeonDefinition,
    DungeonId,
    DungeonReplayState,
    DungeonRunState,
    PlayerId,
    PlayerState
} from "../../core/types";
import { BackIcon } from "../ui/backIcon";
import { ChangeIcon } from "../ui/changeIcon";
import { AutoHealOffIcon, AutoHealOnIcon, AutoRestartOffIcon, AutoRestartOnIcon } from "../ui/dungeonIcons";
import { InterruptIcon } from "../ui/interruptIcon";
import { StartActionIcon } from "../ui/startActionIcon";
import { TabIcon } from "../ui/tabIcons";
import { SkillIcon } from "../ui/skillIcons";
import { getSkillIconColor } from "../ui/skillColors";
import { DungeonArenaRenderer } from "./dungeon/DungeonArenaRenderer";
import {
    buildDungeonArenaLiveFrame,
    buildDungeonArenaReplayFrame,
    DUNGEON_FLOAT_WINDOW_MS
} from "./dungeon/arenaPlayback";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../data/equipment";
import {
    DUNGEON_SIMULATION_STEP_MS,
    HEAL_THREAT_RATIO,
    MELEE_THREAT_MULTIPLIER,
    THREAT_DECAY,
    resolveDungeonRiskTier
} from "../../core/dungeon";

type DungeonScreenProps = {
    definitions: DungeonDefinition[];
    players: Record<PlayerId, PlayerState>;
    playersSorted: PlayerState[];
    selectedDungeonId: string;
    selectedPartyPlayerIds: PlayerId[];
    canEnterDungeon: boolean;
    foodCount: number;
    currentPower: number;
    usesPartyPower: boolean;
    autoConsumables: boolean;
    canUseConsumables: boolean;
    consumablesCount: number;
    activeRun: DungeonRunState | null;
    latestReplay: DungeonReplayState | null;
    completionCounts: Record<DungeonId, number>;
    showReplay: boolean;
    onToggleReplay: () => void;
    onSelectDungeon: (dungeonId: string) => void;
    onTogglePartyPlayer: (playerId: PlayerId) => void;
    onToggleAutoRestart: (value: boolean) => void;
    onToggleAutoConsumables: (value: boolean) => void;
    onStartRun: () => void;
    onStopRun: () => void;
};

const percent = (value: number, max: number) => {
    if (!max || max <= 0) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
};

const formatCompactCount = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    if (safeValue < 1000) {
        return `${safeValue}`;
    }
    if (safeValue < 1_000_000) {
        return `${Math.floor(safeValue / 1000)}k`;
    }
    if (safeValue < 1_000_000_000) {
        return `${Math.floor(safeValue / 1_000_000)}m`;
    }
    return `${Math.floor(safeValue / 1_000_000_000)}b`;
};

const clampValue = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const formatCooldownMs = (value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    const seconds = safeValue / 1000;
    if (seconds >= 10) {
        return `${Math.round(seconds)}s`;
    }
    return `${seconds.toFixed(1)}s`;
};

const normalizeHpMax = (value: number | undefined) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 100;
    }
    return Math.max(1, Math.round(parsed));
};

const MAGIC_HEAL_COOLDOWN_MS = 4000;
const POTION_COOLDOWN_MS = 4000;

export const DungeonScreen = memo(({
    definitions,
    players,
    playersSorted,
    selectedDungeonId,
    selectedPartyPlayerIds,
    canEnterDungeon,
    foodCount,
    currentPower,
    usesPartyPower,
    autoConsumables,
    canUseConsumables,
    consumablesCount,
    activeRun,
    latestReplay,
    completionCounts,
    showReplay,
    onToggleReplay,
    onSelectDungeon,
    onTogglePartyPlayer,
    onToggleAutoRestart,
    onToggleAutoConsumables,
    onStartRun,
    onStopRun
}: DungeonScreenProps) => {
    const safeCompletionCounts = completionCounts ?? {};
    const frameIntervalMs = 1000 / 30;
    const combatLabelBySkillId: Partial<Record<string, string>> = {
        CombatMelee: "Melee",
        CombatRanged: "Ranged",
        CombatMagic: "Magic"
    };
    const [liveCursorMs, setLiveCursorMs] = useState(0);
    const [replayPaused, setReplayPaused] = useState(true);
    const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 4>(1);
    const [replayCursorMs, setReplayCursorMs] = useState(0);
    const [replayView, setReplayView] = useState<"group" | "log">("group");
    const liveCursorRef = useRef(0);
    const replayCursorRef = useRef(0);
    const riskTooltip = usesPartyPower ? "Based on current party power." : "Based on active hero power.";
    const hasPartySelection = selectedPartyPlayerIds.length > 0;
    const threatTotal = activeRun
        ? activeRun.party.reduce((sum, member) => sum + (activeRun.threatByHeroId?.[member.playerId] ?? 0), 0)
        : 0;
    const topThreatValue = activeRun
        ? activeRun.party.reduce((max, member) => {
            const value = activeRun.threatByHeroId?.[member.playerId] ?? 0;
            return value > max ? value : max;
        }, 0)
        : 0;
    const liveDamageTotals = useMemo(() => {
        const heroTotals = new Map<string, number>();
        const enemyTotals = new Map<string, number>();
        if (!activeRun) {
            return { heroTotals, enemyTotals, groupTotal: 0 };
        }
        const partyIds = new Set(activeRun.party.map((member) => member.playerId));
        activeRun.events.forEach((event) => {
            if (event.type !== "damage") {
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
    }, [activeRun]);
    const setReplayCursor = (next: number) => {
        replayCursorRef.current = next;
        setReplayCursorMs(next);
    };

    const selectedDungeon = definitions.find((definition) => definition.id === selectedDungeonId) ?? definitions[0] ?? null;
    const sortedPlayers = playersSorted;
    const requiredFoodForStart = selectedDungeon ? 1 + Math.floor((selectedDungeon.tier - 1) / 2) : 0;
    const safeRequiredFoodForStart = Number.isFinite(requiredFoodForStart) ? Math.max(0, Math.floor(requiredFoodForStart)) : 0;
    const safeFoodCount = Number.isFinite(foodCount) ? Math.max(0, Math.floor(foodCount)) : 0;
    const hasEnoughFood = safeFoodCount >= safeRequiredFoodForStart;
    const canStartRun = canEnterDungeon
        && selectedPartyPlayerIds.length === 4
        && Boolean(selectedDungeon)
        && hasEnoughFood;
    const liveTotalMs = activeRun ? Math.max(activeRun.elapsedMs, activeRun.events.at(-1)?.atMs ?? 0) : 0;
    const replayTotalMs = latestReplay ? Math.max(latestReplay.elapsedMs, latestReplay.events.at(-1)?.atMs ?? 0) : 0;
    const activeRunId = activeRun?.id ?? null;
    const liveTotalMsRef = useRef(0);
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
        const heroTotals = new Map<string, number>();
        const enemyTotals = new Map<string, number>();
        if (!latestReplay) {
            return { heroTotals, enemyTotals, groupTotal: 0 };
        }
        const partyIds = new Set(latestReplay.partyPlayerIds);
        const cursorMs = Math.round(replayCursorMs);
        latestReplay.events.forEach((event) => {
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

    useEffect(() => {
        liveTotalMsRef.current = liveTotalMs;
    }, [liveTotalMs]);

    useEffect(() => {
        if (!activeRunId) {
            return;
        }
        setLiveCursorMs(() => {
            const next = liveTotalMsRef.current;
            liveCursorRef.current = next;
            return next;
        });
    }, [activeRunId]);

    useEffect(() => {
        setReplayCursorMs(() => {
            replayCursorRef.current = 0;
            return 0;
        });
        setReplayPaused(true);
        setReplaySpeed(1);
    }, [latestReplay?.runId]);

    useEffect(() => {
        if (!activeRunId || typeof window === "undefined") {
            return;
        }
        let rafId = 0;
        let lastTs = performance.now();
        let lastRenderTs = lastTs;
        let cursorMs = liveCursorRef.current;
        const allowOverrun = Boolean(activeRun?.restartAt);
        const animate = (nextTs: number) => {
            const deltaMs = Math.max(0, nextTs - lastTs);
            lastTs = nextTs;
            const targetMs = liveTotalMsRef.current;
            const overrunCap = targetMs + DUNGEON_FLOAT_WINDOW_MS * 2;
            if (cursorMs >= targetMs) {
                cursorMs = allowOverrun ? Math.min(overrunCap, cursorMs + deltaMs) : targetMs;
            } else {
                cursorMs = Math.min(targetMs, cursorMs + deltaMs);
            }
            if (nextTs - lastRenderTs >= frameIntervalMs) {
                lastRenderTs = nextTs;
                setLiveCursorMs(() => {
                    liveCursorRef.current = cursorMs;
                    return cursorMs;
                });
            }
            rafId = window.requestAnimationFrame(animate);
        };
        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [activeRunId, activeRun?.restartAt, frameIntervalMs]);

    useEffect(() => {
        if (!showReplay || !latestReplay || replayPaused || typeof window === "undefined") {
            return;
        }
        let rafId = 0;
        let lastTs = performance.now();
        let lastRenderTs = lastTs;
        let cursorMs = replayCursorRef.current;
        const animate = (nextTs: number) => {
            const deltaMs = Math.max(0, nextTs - lastTs);
            lastTs = nextTs;
            if (cursorMs >= replayTotalMs) {
                cursorMs = replayTotalMs;
            } else {
                cursorMs = Math.min(replayTotalMs, cursorMs + deltaMs * replaySpeed);
            }
            if (nextTs - lastRenderTs >= frameIntervalMs) {
                lastRenderTs = nextTs;
                setReplayCursorMs(() => {
                    replayCursorRef.current = cursorMs;
                    return cursorMs;
                });
            }
            rafId = window.requestAnimationFrame(animate);
        };
        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [showReplay, latestReplay, latestReplay?.runId, replayPaused, replaySpeed, replayTotalMs, frameIntervalMs]);

    useEffect(() => {
        if (!latestReplay || replayCursorMs < replayTotalMs) {
            return;
        }
        setReplayPaused(true);
    }, [latestReplay, replayCursorMs, replayTotalMs]);

    const liveFrame = useMemo(() => {
        if (!activeRun) {
            return null;
        }
        return buildDungeonArenaLiveFrame(activeRun, players, liveCursorMs);
    }, [activeRun, players, liveCursorMs]);

    const replayFrame = useMemo(() => {
        if (!latestReplay) {
            return null;
        }
        return buildDungeonArenaReplayFrame(latestReplay, players, replayCursorMs);
    }, [latestReplay, players, replayCursorMs]);

    const startRunButtonClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-start",
        "ts-action-button",
        !activeRun && canStartRun ? "is-ready-new" : ""
    ].filter(Boolean).join(" ");
    const replayButtonClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-change",
        "ts-action-button",
        !activeRun && latestReplay ? "is-ready-active" : ""
    ].filter(Boolean).join(" ");
    const stopRunButtonClassName = [
        "ts-collapse-button",
        "ts-focusable",
        "ts-action-stop",
        "ts-action-button",
        activeRun ? "is-ready-stop" : ""
    ].filter(Boolean).join(" ");
    const autoConsumablesButtonClassName = [
        "ts-icon-button",
        "ts-focusable",
        "ts-dungeon-auto-restart-button",
        "ts-dungeon-auto-consume-button",
        !canUseConsumables ? "is-unavailable" : "",
        autoConsumables ? " is-active" : ""
    ].filter(Boolean).join(" ");
    const isReplayScreen = !activeRun && showReplay && Boolean(latestReplay);
    const handleReplayPlayPause = () => {
        if (replayPaused && replayCursorMs >= replayTotalMs) {
            setReplayCursor(0);
        }
        setReplayPaused((value) => !value);
    };

    const replayPanel = latestReplay ? (
        <div className="ts-dungeon-replay-body">
            <DungeonArenaRenderer frame={replayFrame} />
            <div className="ts-dungeon-control-row">
                <div className="ts-dungeon-speed-group" role="group" aria-label="Replay speed">
                    {[1, 2, 4].map((speed) => (
                        <button
                            key={speed}
                            type="button"
                            className={`ts-icon-button ts-focusable ts-dungeon-replay-button ts-dungeon-replay-speed${replaySpeed === speed ? " is-active" : ""}`}
                            onClick={() => setReplaySpeed(speed as 1 | 2 | 4)}
                        >
                            x{speed}
                        </button>
                    ))}
                </div>
            </div>
            <label className="ts-field-label" htmlFor="dungeon-replay-scrub">
                Replay timeline
            </label>
            <div className="ts-dungeon-replay-timeline">
                <input
                    id="dungeon-replay-scrub"
                    className="ts-dungeon-replay-scrub"
                    type="range"
                    min={0}
                    max={Math.max(1, replayTotalMs)}
                    step={100}
                    value={Math.min(replayCursorMs, replayTotalMs)}
                    style={
                        replayTrackGradient
                            ? { ["--replay-track-gradient" as never]: replayTrackGradient }
                            : undefined
                    }
                    onChange={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isFinite(next)) {
                            setReplayCursor(next);
                        }
                    }}
                />
                {replayFloorMarks.length > 0 ? (
                    <div className="ts-dungeon-replay-markers" aria-hidden="true">
                        {replayFloorMarks.map((mark) => (
                            <span
                                key={`${mark.atMs}-${mark.label}`}
                                className="ts-dungeon-replay-marker"
                                style={{
                                    left: `${Math.max(0, Math.min(100, (mark.atMs / replayTotalMs) * 100))}%`
                                }}
                                title={mark.label}
                            >
                                <span className="ts-dungeon-replay-marker-label">{mark.label}</span>
                            </span>
                        ))}
                        {replayDeathMarks.map((mark) => (
                            <span
                                key={mark.id}
                                className="ts-dungeon-replay-marker is-death"
                                style={{
                                    left: `${Math.max(0, Math.min(100, (mark.atMs / replayTotalMs) * 100))}%`
                                }}
                                title={`Death: ${mark.label}`}
                            >
                                <span className="ts-dungeon-replay-marker-label is-death">☠</span>
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className="ts-dungeon-control-row">
            </div>
            <div className="ts-dungeon-replay-meta-row">
                <span className="ts-dungeon-replay-meta-pill">
                    <span className="ts-dungeon-replay-meta-label">Floor</span>
                    <span className="ts-dungeon-replay-meta-value">{replayFrame?.floorLabel ?? "—"}</span>
                </span>
                {(safeCompletionCounts[latestReplay.dungeonId] ?? 0) > 0 ? (
                    <span className="ts-dungeon-replay-meta-pill ts-dungeon-completion-pill">
                        <span className="ts-dungeon-replay-meta-label">Completions</span>
                        <span className="ts-dungeon-replay-meta-value">x{safeCompletionCounts[latestReplay.dungeonId]}</span>
                    </span>
                ) : null}
                <span className="ts-dungeon-replay-meta-pill">
                    <span className="ts-dungeon-replay-meta-label">Reason</span>
                    <span className="ts-dungeon-replay-meta-value">{latestReplay.endReason ?? "unknown"}</span>
                </span>
                <span className="ts-dungeon-replay-meta-pill">
                    <span className="ts-dungeon-replay-meta-label">Events</span>
                    <span className="ts-dungeon-replay-meta-value">{latestReplay.events.length}</span>
                </span>
            </div>
            <div className="ts-dungeon-replay-meta-row">
                <span className="ts-dungeon-replay-meta-pill ts-dungeon-replay-meta-pill-playback">
                    <span className="ts-dungeon-replay-meta-label">Replay playback</span>
                    <span className="ts-dungeon-replay-meta-value">{Math.round(replayCursorMs)}ms / {replayTotalMs}ms</span>
                </span>
            </div>
            {replayFrame && replayView === "group" ? (
                <div className="ts-dungeon-live-entities-grid">
                    <div className="ts-dungeon-live-party">
                        {latestReplay.partyPlayerIds.map((playerId) => {
                            const unit = replayFrame.units.find((entry) => entry.id === playerId && !entry.isEnemy);
                            if (!unit) {
                                return null;
                            }
                            const combatSkillId = getCombatSkillIdForWeaponType(unit.weaponType ?? "Melee");
                            const combatColor = getSkillIconColor(combatSkillId);
                            const heroDamage = replayDamageTotals.heroTotals.get(playerId) ?? 0;
                            const heroDamagePercent = percent(heroDamage, replayDamageTotals.groupTotal);
                            const topDamageValue = Math.max(...Array.from(replayDamageTotals.heroTotals.values()), 0);
                            const isTopDamage = heroDamage > 0 && heroDamage === topDamageValue;
                            const threatValue = replayThreatTotals.totals.get(playerId) ?? 0;
                            const threatPercent = percent(threatValue, replayThreatTotals.total);
                            const isTopThreat = threatValue > 0 && threatValue === replayThreatTotals.top;
                            const cooldowns = replayCooldowns.get(playerId);
                            const cooldownEntries: string[] = [];
                            if (cooldowns?.magicMs) {
                                cooldownEntries.push(`Magic ${formatCooldownMs(cooldowns.magicMs)}`);
                            }
                            if (cooldowns?.potionMs) {
                                cooldownEntries.push(`Potion ${formatCooldownMs(cooldowns.potionMs)}`);
                            }
                            const isDead = unit.hp <= 0;
                            return (
                                <div key={playerId} className={`ts-dungeon-live-entity${isDead ? " is-dead" : ""}`}>
                                    <div className="ts-dungeon-live-name">
                                        <span className="ts-dungeon-live-combat-icon" aria-hidden="true">
                                            <SkillIcon skillId={combatSkillId} color={combatColor} />
                                        </span>
                                        <strong>{unit.name}</strong>
                                    </div>
                                    <span>HP {unit.hp}/{unit.hpMax} ({percent(unit.hp, unit.hpMax)}%)</span>
                                    <span>
                                        Damage {Math.round(heroDamage)}
                                        {replayDamageTotals.groupTotal > 0 ? (
                                            <>
                                                {" ("}
                                                <span className={`ts-dungeon-live-damage-value${isTopDamage ? " is-top" : ""}`}>
                                                    {heroDamagePercent}%
                                                </span>
                                                {")"}
                                            </>
                                        ) : ""}
                                    </span>
                                    <span className="ts-dungeon-live-threat">
                                        Threat
                                        <span className={`ts-dungeon-live-threat-value${isTopThreat ? " is-top" : ""}`}>
                                            {threatPercent}%
                                        </span>
                                    </span>
                                    {cooldownEntries.length > 0 ? (
                                        <span className="ts-dungeon-live-cooldown">
                                            Cooldown {cooldownEntries.join(" · ")}
                                        </span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                    <div className="ts-dungeon-live-party">
                        {replayFrame.units.filter((unit) => unit.isEnemy).map((enemy) => {
                            const enemyDamage = replayDamageTotals.enemyTotals.get(enemy.id) ?? 0;
                            const isDead = enemy.hp <= 0;
                            return (
                                <div key={enemy.id} className={`ts-dungeon-live-entity ts-dungeon-live-entity-enemy${isDead ? " is-dead" : ""}`}>
                                    <strong>{enemy.name}</strong>
                                    <span>HP {enemy.hp}/{enemy.hpMax} ({percent(enemy.hp, enemy.hpMax)}%)</span>
                                    <span>Damage {Math.round(enemyDamage)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
            {replayView === "log" ? (
                <div className="ts-dungeon-replay-log" role="log" aria-live="polite">
                    <p className="ts-dungeon-replay-log-heading">
                        Dungeon: {selectedDungeon?.name ?? latestReplay.dungeonId}
                    </p>
                    {latestReplay.events.map((event, index) => {
                        const isActive = replayHighlightAtMs !== null && event.atMs === replayHighlightAtMs;
                        const healMeta = event.type === "heal" ? replayHealLogMeta.get(index) : null;
                        const healAmount = event.type === "heal"
                            ? Math.max(0, Math.round(healMeta?.amount ?? event.amount ?? 0))
                            : 0;
                        const sourceName = event.sourceId ? (heroNameById.get(event.sourceId) ?? event.sourceId) : "";
                        const targetName = event.targetId ? (heroNameById.get(event.targetId) ?? event.targetId) : "";
                        const healInfo = event.type === "heal"
                            ? `- ${sourceName || event.sourceId || "?"}${targetName ? ` -> ${targetName}` : ""} +${healAmount}${healMeta ? ` (HP ${healMeta.hp}/${healMeta.hpMax})` : ""}`
                            : (event.label ? `- ${event.label}` : "");
                        const logSuffix = healInfo ? ` ${healInfo}` : "";
                        return (
                            <p
                                key={`${event.atMs}-${index}`}
                                className={`ts-dungeon-replay-log-line${isActive ? " is-active" : ""}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    replayCursorRef.current = event.atMs;
                                    setReplayCursorMs(event.atMs);
                                }}
                                onKeyDown={(action) => {
                                    if (action.key === "Enter" || action.key === " ") {
                                        action.preventDefault();
                                        replayCursorRef.current = event.atMs;
                                        setReplayCursorMs(event.atMs);
                                    }
                                }}
                            >
                                [{event.atMs}ms] {event.type}{logSuffix}
                            </p>
                        );
                    })}
                </div>
            ) : null}
        </div>
    ) : null;

    return (
        <section className="generic-panel ts-panel ts-dungeon-panel" data-testid="dungeon-screen">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Dungeon</h2>
                    {!isReplayScreen ? <span className="ts-panel-meta">Party idle boss run</span> : null}
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    {!activeRun && !isReplayScreen ? (
                        <>
                            <button
                                type="button"
                                className={startRunButtonClassName}
                                onClick={onStartRun}
                                disabled={!canStartRun}
                                aria-label="Start run"
                                title="Start run"
                                data-testid="dungeon-start-run"
                            >
                                <span className="ts-collapse-label"><StartActionIcon /></span>
                                <span className="ts-action-button-label">Start</span>
                            </button>
                            <button
                                type="button"
                                className={replayButtonClassName}
                                onClick={onToggleReplay}
                                disabled={!latestReplay}
                                aria-label="Show replay"
                                title="Show replay"
                            >
                                <span className="ts-collapse-label"><ChangeIcon /></span>
                                <span className="ts-action-button-label">Replay</span>
                            </button>
                        </>
                    ) : null}
                    {isReplayScreen ? (
                        <>
                            <button
                                type="button"
                                className={`ts-icon-button ts-panel-action-button ts-focusable ts-dungeon-replay-button ts-dungeon-replay-toggle${!replayPaused ? " is-active" : ""}`}
                                onClick={handleReplayPlayPause}
                            >
                                <span className="ts-panel-action-icon" aria-hidden="true">
                                    {replayPaused ? <StartActionIcon /> : <InterruptIcon />}
                                </span>
                                <span className="ts-panel-action-label">{replayPaused ? "Play" : "Pause"}</span>
                            </button>
                            <button
                                type="button"
                                className="ts-icon-button ts-panel-action-button ts-focusable ts-dungeon-replay-button"
                                onClick={() => setReplayView((value) => (value === "group" ? "log" : "group"))}
                                aria-pressed={replayView === "log"}
                                aria-label={replayView === "group" ? "Switch to log view" : "Switch to party view"}
                                title={replayView === "group" ? "Switch to log view" : "Switch to party view"}
                            >
                                <span className="ts-panel-action-icon" aria-hidden="true">
                                    {replayView === "group" ? <TabIcon kind="stats" /> : <TabIcon kind="hero" />}
                                </span>
                                <span className="ts-panel-action-label">
                                    {replayView === "group" ? "Log" : "Party"}
                                </span>
                            </button>
                            <button
                                type="button"
                                className="ts-collapse-button ts-focusable ts-action-button"
                                onClick={onToggleReplay}
                                aria-label="Back to dungeon"
                                title="Back to dungeon"
                            >
                                <span className="ts-collapse-label"><BackIcon /></span>
                                <span className="ts-action-button-label">Back</span>
                            </button>
                        </>
                    ) : null}
                    {activeRun ? (
                        <button
                            type="button"
                            className={`ts-icon-button ts-focusable ts-dungeon-auto-restart-button${activeRun.autoRestart ? " is-active" : ""}`}
                            onClick={() => onToggleAutoRestart(!activeRun.autoRestart)}
                            aria-pressed={activeRun.autoRestart}
                            aria-label={activeRun.autoRestart ? "Disable auto restart" : "Enable auto restart"}
                            title={activeRun.autoRestart ? "Disable auto restart" : "Enable auto restart"}
                        >
                            <span className="ts-dungeon-action-label ts-action-button-label">Auto restart</span>
                            <span className="ts-dungeon-action-icon">
                                {activeRun.autoRestart ? <AutoRestartOnIcon /> : <AutoRestartOffIcon />}
                            </span>
                        </button>
                    ) : null}
                    {activeRun ? (
                        <button
                            type="button"
                            className={autoConsumablesButtonClassName}
                            onClick={() => onToggleAutoConsumables(!autoConsumables)}
                            aria-pressed={autoConsumables}
                            aria-label={autoConsumables ? "Disable auto heal" : "Enable auto heal"}
                            title={canUseConsumables
                                ? "Auto-use healing consumables during fights"
                                : "Requires at least 1 consumable (potion, tonic, elixir)."}
                            disabled={!canUseConsumables}
                        >
                            <span className="ts-dungeon-action-label ts-action-button-label">Auto heal</span>
                            {consumablesCount > 0 ? (
                                <span className="ts-dungeon-consumable-count">{formatCompactCount(consumablesCount)}</span>
                            ) : null}
                            <span className={`ts-dungeon-heal-icon${autoConsumables ? " is-active" : " is-off"}`}>
                                {autoConsumables ? <AutoHealOnIcon /> : <AutoHealOffIcon />}
                            </span>
                        </button>
                    ) : null}
                    {activeRun ? (
                        <button
                            type="button"
                            className={stopRunButtonClassName}
                            onClick={onStopRun}
                            aria-label="Stop run"
                            title="Stop run"
                        >
                            <span className="ts-collapse-label"><InterruptIcon /></span>
                            <span className="ts-action-button-label">Stop</span>
                        </button>
                    ) : null}
                </div>
            </div>

            {!activeRun && !isReplayScreen ? (
                <div className="ts-dungeon-setup-grid">
                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">1. Select dungeon</h3>
                        <div className="ts-dungeon-list">
                            {definitions.map((definition) => {
                                const recommendedPower = definition.recommendedPower * 2;
                                const completionCount = safeCompletionCounts[definition.id] ?? 0;
                                const riskTier = usesPartyPower
                                    ? resolveDungeonRiskTier(currentPower, recommendedPower)
                                    : null;
                                const riskTone = riskTier ? riskTier.toLowerCase() : "medium";
                                return (
                                <button
                                    key={definition.id}
                                    type="button"
                                    className={`ts-dungeon-option ts-focusable${selectedDungeonId === definition.id ? " is-active" : ""}`}
                                    onClick={() => onSelectDungeon(definition.id)}
                                >
                                    <strong>{definition.name}</strong>
                                    <span className="ts-dungeon-option-subtitle">
                                        Tier {definition.tier} · {definition.floorCount} floors · Boss: {definition.bossName}
                                    </span>
                                    <div className="ts-dungeon-option-meta-row">
                                        <span className="ts-dungeon-option-subtitle">
                                            Recommended power: {recommendedPower.toLocaleString()}
                                        </span>
                                        {riskTier ? (
                                        <span className={`ts-dungeon-risk-badge is-${riskTone}`} title={riskTooltip}>
                                            {riskTier}
                                        </span>
                                    ) : null}
                                    </div>
                                    {completionCount > 0 ? (
                                        <span className="ts-dungeon-completion-badge">x{completionCount}</span>
                                    ) : null}
                                </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">2. Select 4 heroes</h3>
                        {!canEnterDungeon ? (
                            <p className="ts-system-helper">Unlock requires 4 heroes in your roster.</p>
                        ) : null}
                        <div className="ts-dungeon-party-list">
                            {sortedPlayers.map((player) => {
                                const selected = selectedPartyPlayerIds.includes(player.id);
                                const combatSkillId = getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment));
                                const combatLabel = combatLabelBySkillId[combatSkillId] ?? "Melee";
                                const combatLevel = player.skills[combatSkillId]?.level ?? 0;
                                const combatColor = getSkillIconColor(combatSkillId);
                                return (
                                    <button
                                        key={player.id}
                                        type="button"
                                        className={`ts-dungeon-party-option ts-focusable${selected ? " is-active" : ""}`}
                                        onClick={() => onTogglePartyPlayer(player.id)}
                                    >
                                        <strong>{player.name}</strong>
                                        <div className="ts-dungeon-party-combat">
                                            <span className="ts-dungeon-party-combat-icon" aria-hidden="true">
                                                <SkillIcon skillId={combatSkillId} color={combatColor} />
                                            </span>
                                            <span className="ts-dungeon-party-combat-label">{combatLabel}</span>
                                            <span className="ts-dungeon-party-combat-badge">{combatLevel}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">3. Preparation</h3>
                        <div className="ts-dungeon-cost-row">
                            <span className="ts-dungeon-cost-label">Party power</span>
                            <span className={`ts-dungeon-cost-pill${hasPartySelection ? " is-ok" : ""}`}>
                                {hasPartySelection ? currentPower.toLocaleString() : "--"}
                            </span>
                        </div>
                        <div className="ts-dungeon-cost-row">
                            <span className="ts-dungeon-cost-label">Entry cost</span>
                            <span className="ts-dungeon-cost-pill">
                                Food: {safeRequiredFoodForStart.toLocaleString()}
                            </span>
                            <span className={`ts-dungeon-cost-pill ${hasEnoughFood ? "is-ok" : "is-low"}`}>
                                Available: {safeFoodCount.toLocaleString()}
                            </span>
                        </div>
                        {!hasEnoughFood ? (
                            <p className="ts-system-helper ts-dungeon-cost-warning">Not enough food to start this dungeon.</p>
                        ) : null}
                    </div>
                </div>
            ) : isReplayScreen ? (
                <div className="ts-dungeon-replay-screen">
                    {replayPanel}
                </div>
            ) : (
                <div className="ts-dungeon-live-grid">
                    <div className="ts-dungeon-live-body">
                        <DungeonArenaRenderer frame={liveFrame} />
                        <div className="ts-dungeon-live-meta-row">
                            <span className="ts-dungeon-live-meta-pill">
                                <span className="ts-dungeon-live-meta-label">Dungeon</span>
                                <span className="ts-dungeon-live-meta-value">{selectedDungeon?.name ?? activeRun!.dungeonId}</span>
                            </span>
                            {(safeCompletionCounts[activeRun!.dungeonId] ?? 0) > 0 ? (
                                <span className="ts-dungeon-live-meta-pill ts-dungeon-completion-pill">
                                    <span className="ts-dungeon-live-meta-label">Completions</span>
                                    <span className="ts-dungeon-live-meta-value">x{safeCompletionCounts[activeRun!.dungeonId]}</span>
                                </span>
                            ) : null}
                            <span className="ts-dungeon-live-meta-pill">
                                <span className="ts-dungeon-live-meta-label">Floor</span>
                                <span className="ts-dungeon-live-meta-value">{activeRun!.floor}/{activeRun!.floorCount}</span>
                            </span>
                            <span className={`ts-dungeon-live-meta-pill ts-dungeon-live-status is-${activeRun!.status}`}>
                                <span className="ts-dungeon-live-meta-label">Status</span>
                                <span className="ts-dungeon-live-meta-value">
                                    {activeRun!.status.charAt(0).toUpperCase() + activeRun!.status.slice(1)}
                                </span>
                            </span>
                            {activeRun!.restartAt ? (
                                <span className="ts-dungeon-live-meta-pill ts-dungeon-live-status is-restart">
                                    <span className="ts-dungeon-live-meta-label">Queue</span>
                                    <span className="ts-dungeon-live-meta-value">Restart pending</span>
                                </span>
                            ) : null}
                        </div>
                        <div className="ts-dungeon-live-entities-grid">
                            <div className="ts-dungeon-live-party">
                                {activeRun!.party.map((member) => {
                                    const player = players[member.playerId];
                                    const combatSkillId = player
                                        ? getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment))
                                        : "CombatMelee";
                                    const combatColor = getSkillIconColor(combatSkillId);
                                    const threatValue = activeRun!.threatByHeroId?.[member.playerId] ?? 0;
                                    const threatPercent = percent(threatValue, threatTotal);
                                    const isTopThreat = threatValue > 0 && threatValue === topThreatValue;
                                    const heroDamage = liveDamageTotals.heroTotals.get(member.playerId) ?? 0;
                                    const heroDamagePercent = percent(heroDamage, liveDamageTotals.groupTotal);
                                    const topDamageValue = Math.max(...Array.from(liveDamageTotals.heroTotals.values()), 0);
                                    const isTopDamage = heroDamage > 0 && heroDamage === topDamageValue;
                                    const liveCooldownEntries: string[] = [];
                                    if (member.magicHealCooldownMs > 0) {
                                        liveCooldownEntries.push(`Magic ${formatCooldownMs(member.magicHealCooldownMs)}`);
                                    }
                                    if (member.potionCooldownMs > 0) {
                                        liveCooldownEntries.push(`Potion ${formatCooldownMs(member.potionCooldownMs)}`);
                                    }
                                    const isDead = member.hp <= 0;
                                    return (
                                        <div key={member.playerId} className={`ts-dungeon-live-entity${isDead ? " is-dead" : ""}`}>
                                            <div className="ts-dungeon-live-name">
                                                <span className="ts-dungeon-live-combat-icon" aria-hidden="true">
                                                    <SkillIcon skillId={combatSkillId} color={combatColor} />
                                                </span>
                                                <strong>{player?.name ?? member.playerId}</strong>
                                            </div>
                                            <span>HP {member.hp}/{member.hpMax} ({percent(member.hp, member.hpMax)}%)</span>
                                            <span>
                                                Damage {Math.round(heroDamage)}
                                                {liveDamageTotals.groupTotal > 0 ? (
                                                    <>
                                                        {" ("}
                                                        <span className={`ts-dungeon-live-damage-value${isTopDamage ? " is-top" : ""}`}>
                                                            {heroDamagePercent}%
                                                        </span>
                                                        {")"}
                                                    </>
                                                ) : ""}
                                            </span>
                                            <span className="ts-dungeon-live-threat">
                                                Threat
                                                <span className={`ts-dungeon-live-threat-value${isTopThreat ? " is-top" : ""}`}>
                                                    {threatPercent}%
                                                </span>
                                            </span>
                                            {liveCooldownEntries.length > 0 ? (
                                                <span className="ts-dungeon-live-cooldown">
                                                    Cooldown {liveCooldownEntries.join(" · ")}
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="ts-dungeon-live-party">
                                {activeRun!.enemies.map((enemy) => {
                                    const enemyDamage = liveDamageTotals.enemyTotals.get(enemy.id) ?? 0;
                                    const isDead = enemy.hp <= 0;
                                    return (
                                        <div key={enemy.id} className={`ts-dungeon-live-entity ts-dungeon-live-entity-enemy${isDead ? " is-dead" : ""}`}>
                                            <strong>{enemy.name}</strong>
                                            <span>HP {enemy.hp}/{enemy.hpMax} ({percent(enemy.hp, enemy.hpMax)}%)</span>
                                            <span>Damage {Math.round(enemyDamage)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
});

DungeonScreen.displayName = "DungeonScreen";
