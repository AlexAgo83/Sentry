import type { CSSProperties } from "react";
import type { DungeonDefinition, DungeonId, DungeonReplayState, PlayerId } from "../../../../core/types";
import { getCombatSkillIdForWeaponType } from "../../../../data/equipment";
import { SkillIcon } from "../../../ui/skillIcons";
import { getSkillIconColor } from "../../../ui/skillColors";
import { DungeonArenaRenderer } from "../../dungeon/DungeonArenaRenderer";
import type { DungeonArenaFrame } from "../../dungeon/arenaPlayback";
import { formatCooldownMs, percent } from "../utils";

type ReplayMark = { atMs: number; label: string };
type ReplayDeathMark = { atMs: number; label: string; id: string };

type DungeonReplayViewProps = {
    latestReplay: DungeonReplayState;
    replayFrame: DungeonArenaFrame | null;
    replayPaused: boolean;
    dungeonBackgroundUrl: string;
    replaySpeed: 0.2 | 0.5 | 1 | 2 | 4;
    onReplaySpeedChange: (speed: 0.2 | 0.5 | 1 | 2 | 4) => void;
    replayTotalMs: number;
    replayCursorMs: number;
    replayTrackGradient: string;
    replayFloorMarks: ReplayMark[];
    replayDeathMarks: ReplayDeathMark[];
    onReplayCursorChange: (next: number) => void;
    safeCompletionCounts: Record<DungeonId, number>;
    replayView: "group" | "log";
    replayDamageTotals: {
        heroTotals: Map<string, number>;
        enemyTotals: Map<string, number>;
        groupTotal: number;
    };
    replayThreatTotals: {
        totals: Map<string, number>;
        total: number;
        top: number;
    };
    replayCooldowns: Map<PlayerId, { magicMs: number; potionMs: number }>;
    replayHighlightAtMs: number | null;
    replayHealLogMeta: Map<number, { amount: number; hp: number; hpMax: number; targetId: string }>;
    heroNameById: Map<string, string>;
    selectedDungeon: DungeonDefinition | null;
};

export const DungeonReplayView = ({
    latestReplay,
    replayFrame,
    replayPaused,
    dungeonBackgroundUrl,
    replaySpeed,
    onReplaySpeedChange,
    replayTotalMs,
    replayCursorMs,
    replayTrackGradient,
    replayFloorMarks,
    replayDeathMarks,
    onReplayCursorChange,
    safeCompletionCounts,
    replayView,
    replayDamageTotals,
    replayThreatTotals,
    replayCooldowns,
    replayHighlightAtMs,
    replayHealLogMeta,
    heroNameById,
    selectedDungeon
}: DungeonReplayViewProps) => {
    const replaySpeedOptions: Array<0.2 | 0.5 | 1 | 2 | 4> = [0.2, 0.5, 1, 2, 4];
    const arenaStyle = {
        "--ts-dungeon-bg-image": `url("${dungeonBackgroundUrl}")`
    } as CSSProperties;

    return (
        <div className="ts-dungeon-replay-body">
            <DungeonArenaRenderer frame={replayFrame} paused={replayPaused} style={arenaStyle} />
            <div className="ts-dungeon-control-row">
                <div className="ts-dungeon-speed-group" role="group" aria-label="Replay speed">
                    {replaySpeedOptions.map((speed) => (
                        <button
                            key={speed}
                            type="button"
                            className={`ts-icon-button ts-focusable ts-dungeon-replay-button ts-dungeon-replay-speed${replaySpeed === speed ? " is-active" : ""}`}
                            onClick={() => onReplaySpeedChange(speed)}
                            title={`Replay speed x${speed}`}
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
                            onReplayCursorChange(next);
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
                            const cooldowns = replayCooldowns.get(playerId as PlayerId);
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
                                onClick={() => onReplayCursorChange(event.atMs)}
                                onKeyDown={(action) => {
                                    if (action.key === "Enter" || action.key === " ") {
                                        action.preventDefault();
                                        onReplayCursorChange(event.atMs);
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
    );
};
