import { memo, useEffect, useMemo, useState } from "react";
import type { DungeonDefinition, DungeonReplayState, DungeonRunState, PlayerId, PlayerState } from "../../core/types";
import { ChangeIcon } from "../ui/changeIcon";
import { AutoRestartOffIcon, AutoRestartOnIcon } from "../ui/dungeonIcons";
import { InterruptIcon } from "../ui/interruptIcon";
import { StartActionIcon } from "../ui/startActionIcon";
import { DungeonArenaRenderer } from "./dungeon/DungeonArenaRenderer";
import {
    buildDungeonArenaLiveFrame,
    buildDungeonArenaReplayFrame,
    getDungeonReplayJumpMarks
} from "./dungeon/arenaPlayback";

type DungeonScreenProps = {
    definitions: DungeonDefinition[];
    players: Record<PlayerId, PlayerState>;
    selectedDungeonId: string;
    selectedPartyPlayerIds: PlayerId[];
    canEnterDungeon: boolean;
    foodCount: number;
    activeRun: DungeonRunState | null;
    latestReplay: DungeonReplayState | null;
    showReplay: boolean;
    onToggleReplay: () => void;
    onSelectDungeon: (dungeonId: string) => void;
    onTogglePartyPlayer: (playerId: PlayerId) => void;
    onToggleAutoRestart: (value: boolean) => void;
    onStartRun: () => void;
    onStopRun: () => void;
};

const percent = (value: number, max: number) => {
    if (!max || max <= 0) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
};

export const DungeonScreen = memo(({
    definitions,
    players,
    selectedDungeonId,
    selectedPartyPlayerIds,
    canEnterDungeon,
    foodCount,
    activeRun,
    latestReplay,
    showReplay,
    onToggleReplay,
    onSelectDungeon,
    onTogglePartyPlayer,
    onToggleAutoRestart,
    onStartRun,
    onStopRun
}: DungeonScreenProps) => {
    const [liveCursorMs, setLiveCursorMs] = useState(0);
    const [replayPaused, setReplayPaused] = useState(true);
    const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 4>(1);
    const [replayCursorMs, setReplayCursorMs] = useState(0);

    const selectedDungeon = definitions.find((definition) => definition.id === selectedDungeonId) ?? definitions[0] ?? null;
    const sortedPlayers = Object.values(players).sort((a, b) => Number(a.id) - Number(b.id));
    const requiredFoodForStart = selectedDungeon ? 1 + Math.floor((selectedDungeon.tier - 1) / 2) : 0;
    const hasEnoughFood = foodCount >= requiredFoodForStart;
    const canStartRun = canEnterDungeon
        && selectedPartyPlayerIds.length === 4
        && Boolean(selectedDungeon)
        && hasEnoughFood;
    const liveTotalMs = activeRun ? Math.max(activeRun.elapsedMs, activeRun.events.at(-1)?.atMs ?? 0) : 0;
    const replayTotalMs = latestReplay ? Math.max(latestReplay.elapsedMs, latestReplay.events.at(-1)?.atMs ?? 0) : 0;
    const replayJumpMarks = useMemo(() => getDungeonReplayJumpMarks(latestReplay), [latestReplay]);

    useEffect(() => {
        setLiveCursorMs(liveTotalMs);
    }, [activeRun?.id, liveTotalMs]);

    useEffect(() => {
        setReplayCursorMs(0);
        setReplayPaused(true);
        setReplaySpeed(1);
    }, [latestReplay?.runId]);

    useEffect(() => {
        if (!activeRun || typeof window === "undefined") {
            return;
        }
        let rafId = 0;
        let lastTs = performance.now();
        const animate = (nextTs: number) => {
            const deltaMs = Math.max(0, nextTs - lastTs);
            lastTs = nextTs;
            setLiveCursorMs((previous) => Math.min(liveTotalMs, previous + deltaMs));
            rafId = window.requestAnimationFrame(animate);
        };
        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [activeRun, activeRun?.id, liveTotalMs]);

    useEffect(() => {
        if (!showReplay || !latestReplay || replayPaused || typeof window === "undefined") {
            return;
        }
        let rafId = 0;
        let lastTs = performance.now();
        const animate = (nextTs: number) => {
            const deltaMs = Math.max(0, nextTs - lastTs);
            lastTs = nextTs;
            setReplayCursorMs((previous) => {
                if (previous >= replayTotalMs) {
                    return replayTotalMs;
                }
                return Math.min(replayTotalMs, previous + deltaMs * replaySpeed);
            });
            rafId = window.requestAnimationFrame(animate);
        };
        rafId = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(rafId);
    }, [showReplay, latestReplay, latestReplay?.runId, replayPaused, replaySpeed, replayTotalMs]);

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

    return (
        <section className="generic-panel ts-panel ts-dungeon-panel" data-testid="dungeon-screen">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Dungeon</h2>
                    <span className="ts-panel-meta">Party idle boss run</span>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    {!activeRun ? (
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
                                aria-label={showReplay ? "Hide replay" : "Show replay"}
                                title={showReplay ? "Hide replay" : "Show replay"}
                            >
                                <span className="ts-collapse-label"><ChangeIcon /></span>
                                <span className="ts-action-button-label">{showReplay ? "Hide" : "Replay"}</span>
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
                            <span className="ts-dungeon-action-icon">
                                {activeRun.autoRestart ? <AutoRestartOnIcon /> : <AutoRestartOffIcon />}
                            </span>
                            <span className="ts-dungeon-action-label">Auto restart</span>
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

            {!activeRun ? (
                <div className="ts-dungeon-setup-grid">
                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">1. Select dungeon</h3>
                        <div className="ts-dungeon-list">
                            {definitions.map((definition) => (
                                <button
                                    key={definition.id}
                                    type="button"
                                    className={`ts-dungeon-option ts-focusable${selectedDungeonId === definition.id ? " is-active" : ""}`}
                                    onClick={() => onSelectDungeon(definition.id)}
                                >
                                    <strong>{definition.name}</strong>
                                    <span>Tier {definition.tier} · {definition.floorCount} floors · Boss: {definition.bossName}</span>
                                    <span>Recommended power: {definition.recommendedPower.toLocaleString()}</span>
                                </button>
                            ))}
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
                                return (
                                    <button
                                        key={player.id}
                                        type="button"
                                        className={`ts-dungeon-party-option ts-focusable${selected ? " is-active" : ""}`}
                                        onClick={() => onTogglePartyPlayer(player.id)}
                                    >
                                        <strong>{player.name}</strong>
                                        <span>Combat Lv {player.skills.Combat.level}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">3. Preparation</h3>
                        <div className="ts-dungeon-cost-row">
                            <span className="ts-dungeon-cost-label">Entry cost</span>
                            <span className="ts-dungeon-cost-pill">
                                Food: {requiredFoodForStart.toLocaleString()}
                            </span>
                            <span className={`ts-dungeon-cost-pill ${hasEnoughFood ? "is-ok" : "is-low"}`}>
                                Available: {foodCount.toLocaleString()}
                            </span>
                        </div>
                        {!hasEnoughFood ? (
                            <p className="ts-system-helper">Not enough food to start this dungeon.</p>
                        ) : null}
                    </div>

                    {showReplay && latestReplay ? (
                        <div className="ts-dungeon-card">
                            <h3 className="ts-dungeon-card-title">Latest replay ({latestReplay.status})</h3>
                            <p className="ts-system-helper">Reason: {latestReplay.endReason} · Events: {latestReplay.events.length}</p>
                            <DungeonArenaRenderer frame={replayFrame} />
                            <div className="ts-dungeon-control-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-focusable"
                                    onClick={() => setReplayPaused((value) => !value)}
                                >
                                    {replayPaused ? "Play replay" : "Pause replay"}
                                </button>
                                <div className="ts-dungeon-speed-group" role="group" aria-label="Replay speed">
                                    {[1, 2, 4].map((speed) => (
                                        <button
                                            key={speed}
                                            type="button"
                                            className={`generic-field button ts-focusable${replaySpeed === speed ? " is-active" : ""}`}
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
                            <input
                                id="dungeon-replay-scrub"
                                type="range"
                                min={0}
                                max={Math.max(1, replayTotalMs)}
                                step={100}
                                value={Math.min(replayCursorMs, replayTotalMs)}
                                onChange={(event) => {
                                    const next = Number(event.target.value);
                                    if (Number.isFinite(next)) {
                                        setReplayCursorMs(next);
                                    }
                                }}
                            />
                            <div className="ts-dungeon-control-row">
                                <button
                                    type="button"
                                    className="generic-field button ts-focusable"
                                    disabled={replayJumpMarks.firstDeathAtMs === null}
                                    onClick={() => {
                                        if (replayJumpMarks.firstDeathAtMs !== null) {
                                            setReplayCursorMs(replayJumpMarks.firstDeathAtMs);
                                            setReplayPaused(true);
                                        }
                                    }}
                                >
                                    Skip to first death
                                </button>
                                <button
                                    type="button"
                                    className="generic-field button ts-focusable"
                                    disabled={replayJumpMarks.runEndAtMs === null}
                                    onClick={() => {
                                        if (replayJumpMarks.runEndAtMs !== null) {
                                            setReplayCursorMs(replayJumpMarks.runEndAtMs);
                                            setReplayPaused(true);
                                        }
                                    }}
                                >
                                    Skip to wipe/end
                                </button>
                            </div>
                            <p className="ts-system-helper">
                                Replay playback: {Math.round(replayCursorMs)}ms / {replayTotalMs}ms
                            </p>
                            <div className="ts-dungeon-replay-log" role="log" aria-live="polite">
                                {latestReplay.events.slice(-220).map((event, index) => (
                                    <p key={`${event.atMs}-${index}`}>
                                        [{event.atMs}ms] {event.type} {event.label ? `- ${event.label}` : ""}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="ts-dungeon-live-grid">
                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">Live run</h3>
                        <p className="ts-system-helper">{selectedDungeon?.name ?? activeRun.dungeonId} · Floor {activeRun.floor}/{activeRun.floorCount}</p>
                        <p className="ts-system-helper">Status: {activeRun.status}{activeRun.restartAt ? " · restart pending" : ""}</p>
                        <DungeonArenaRenderer frame={liveFrame} />
                        <p className="ts-system-helper">
                            Live playback: {Math.round(liveCursorMs)}ms / {liveTotalMs}ms
                        </p>
                        <div className="ts-dungeon-live-party">
                            {activeRun.party.map((member) => {
                                const player = players[member.playerId];
                                return (
                                    <div key={member.playerId} className="ts-dungeon-live-entity">
                                        <strong>{player?.name ?? member.playerId}</strong>
                                        <span>HP {member.hp}/{member.hpMax} ({percent(member.hp, member.hpMax)}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="ts-dungeon-live-party">
                            {activeRun.enemies.map((enemy) => (
                                <div key={enemy.id} className="ts-dungeon-live-entity ts-dungeon-live-entity-enemy">
                                    <strong>{enemy.name}</strong>
                                    <span>HP {enemy.hp}/{enemy.hpMax} ({percent(enemy.hp, enemy.hpMax)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
});

DungeonScreen.displayName = "DungeonScreen";
