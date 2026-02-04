import { memo } from "react";
import type { DungeonDefinition, DungeonReplayState, DungeonRunState, PlayerId, PlayerState } from "../../core/types";
import { BackIcon } from "../ui/backIcon";

type DungeonScreenProps = {
    onBack: () => void;
    definitions: DungeonDefinition[];
    players: Record<PlayerId, PlayerState>;
    selectedDungeonId: string;
    selectedPartyPlayerIds: PlayerId[];
    autoRestart: boolean;
    canEnterDungeon: boolean;
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
    onBack,
    definitions,
    players,
    selectedDungeonId,
    selectedPartyPlayerIds,
    autoRestart,
    canEnterDungeon,
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
    const selectedDungeon = definitions.find((definition) => definition.id === selectedDungeonId) ?? definitions[0] ?? null;
    const sortedPlayers = Object.values(players).sort((a, b) => Number(a.id) - Number(b.id));

    return (
        <section className="generic-panel ts-panel ts-dungeon-panel" data-testid="dungeon-screen">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Dungeon</h2>
                    <span className="ts-panel-meta">Party idle boss run</span>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable"
                        onClick={onBack}
                        aria-label="Back"
                    >
                        <span className="ts-collapse-label"><BackIcon /></span>
                    </button>
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
                        <p className="ts-system-helper">Selected: {selectedPartyPlayerIds.length} / 4</p>
                    </div>

                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">3. Preparation</h3>
                        <p className="ts-system-helper">Run uses currently equipped gear. No equipment edits in this screen.</p>
                        <label className="ts-field-label" htmlFor="dungeon-auto-restart">Auto restart after victory</label>
                        <input
                            id="dungeon-auto-restart"
                            type="checkbox"
                            checked={autoRestart}
                            onChange={(event) => onToggleAutoRestart(event.target.checked)}
                        />
                        <div className="ts-action-row">
                            <button
                                type="button"
                                className="generic-field button ts-focusable"
                                disabled={!canEnterDungeon || selectedPartyPlayerIds.length !== 4 || !selectedDungeon}
                                onClick={onStartRun}
                                data-testid="dungeon-start-run"
                            >
                                Start dungeon run
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="ts-dungeon-live-grid">
                    <div className="ts-dungeon-card">
                        <h3 className="ts-dungeon-card-title">Live run</h3>
                        <p className="ts-system-helper">{selectedDungeon?.name ?? activeRun.dungeonId} · Floor {activeRun.floor}/{activeRun.floorCount}</p>
                        <p className="ts-system-helper">Status: {activeRun.status}{activeRun.restartAt ? " · restart pending" : ""}</p>
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
                        <div className="ts-action-row">
                            <button type="button" className="generic-field button ts-focusable" onClick={onStopRun}>
                                Stop run
                            </button>
                            <button type="button" className="generic-field button ts-focusable" onClick={onToggleReplay}>
                                {showReplay ? "Hide replay" : "Show latest replay"}
                            </button>
                        </div>
                    </div>

                    {showReplay && latestReplay ? (
                        <div className="ts-dungeon-card">
                            <h3 className="ts-dungeon-card-title">Latest replay ({latestReplay.status})</h3>
                            <p className="ts-system-helper">Reason: {latestReplay.endReason} · Events: {latestReplay.events.length}</p>
                            <div className="ts-dungeon-replay-log" role="log" aria-live="polite">
                                {latestReplay.events.map((event, index) => (
                                    <p key={`${event.atMs}-${index}`}>
                                        [{event.atMs}ms] {event.type} {event.label ? `- ${event.label}` : ""}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </section>
    );
});

DungeonScreen.displayName = "DungeonScreen";
