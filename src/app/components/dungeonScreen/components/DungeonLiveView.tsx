import type { CSSProperties } from "react";
import { useMemo } from "react";
import type { DungeonId, DungeonRunState, PlayerId, PlayerState } from "../../../../core/types";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../../../data/equipment";
import { SkillIcon } from "../../../ui/skillIcons";
import { getSkillIconColor } from "../../../ui/skillColors";
import { DungeonArenaRenderer } from "../../dungeon/DungeonArenaRenderer";
import type { DungeonArenaFrame } from "../../dungeon/arenaPlayback";
import type { DamageTotals } from "../types";
import { formatCooldownMs, percent } from "../utils";

type DungeonLiveViewProps = {
    activeRun: DungeonRunState;
    players: Record<PlayerId, PlayerState>;
    selectedDungeonName: string;
    safeCompletionCounts: Record<DungeonId, number>;
    liveFrame: DungeonArenaFrame | null;
    dungeonBackgroundUrl: string;
    liveDamageTotals: DamageTotals;
    threatTotal: number;
    topThreatValue: number;
};

export const DungeonLiveView = ({
    activeRun,
    players,
    selectedDungeonName,
    safeCompletionCounts,
    liveFrame,
    dungeonBackgroundUrl,
    liveDamageTotals,
    threatTotal,
    topThreatValue
}: DungeonLiveViewProps) => {
    const arenaStyle = {
        "--ts-dungeon-bg-image": `url("${dungeonBackgroundUrl}")`
    } as CSSProperties;
    const liveEnemyUnits = useMemo(() => {
        const frameEnemies = (liveFrame?.units ?? []).filter((unit) => unit.isEnemy);
        if (frameEnemies.length > 0) {
            return frameEnemies;
        }
        return activeRun.enemies.map((enemy) => ({
            id: enemy.id,
            name: enemy.name,
            hp: enemy.hp,
            hpMax: enemy.hpMax,
            alive: enemy.hp > 0
        }));
    }, [activeRun.enemies, liveFrame?.units]);

    return (
        <div className="ts-dungeon-live-grid">
            <div className="ts-dungeon-live-body">
                <DungeonArenaRenderer frame={liveFrame} style={arenaStyle} />
                <div className="ts-dungeon-live-meta-row">
                    <span className="ts-dungeon-live-meta-pill">
                        <span className="ts-dungeon-live-meta-label">Dungeon</span>
                        <span className="ts-dungeon-live-meta-value">{selectedDungeonName}</span>
                    </span>
                    {(safeCompletionCounts[activeRun.dungeonId] ?? 0) > 0 ? (
                        <span className="ts-dungeon-live-meta-pill ts-dungeon-completion-pill">
                            <span className="ts-dungeon-live-meta-label">Completions</span>
                            <span className="ts-dungeon-live-meta-value">x{safeCompletionCounts[activeRun.dungeonId]}</span>
                        </span>
                    ) : null}
                    <span className="ts-dungeon-live-meta-pill">
                        <span className="ts-dungeon-live-meta-label">Floor</span>
                        <span className="ts-dungeon-live-meta-value">{activeRun.floor}/{activeRun.floorCount}</span>
                    </span>
                    <span className={`ts-dungeon-live-meta-pill ts-dungeon-live-status is-${activeRun.status}`}>
                        <span className="ts-dungeon-live-meta-label">Status</span>
                        <span className="ts-dungeon-live-meta-value">
                            {activeRun.status.charAt(0).toUpperCase() + activeRun.status.slice(1)}
                        </span>
                    </span>
                    {activeRun.restartAt ? (
                        <span className="ts-dungeon-live-meta-pill ts-dungeon-live-status is-restart">
                            <span className="ts-dungeon-live-meta-label">Queue</span>
                            <span className="ts-dungeon-live-meta-value">Restart pending</span>
                        </span>
                    ) : null}
                </div>
                <div className="ts-dungeon-live-entities-grid">
                    <div className="ts-dungeon-live-party">
                        {activeRun.party.map((member) => {
                            const player = players[member.playerId];
                            const combatSkillId = player
                                ? getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment))
                                : "CombatMelee";
                            const combatColor = getSkillIconColor(combatSkillId);
                            const threatValue = activeRun.threatByHeroId?.[member.playerId] ?? 0;
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
                        {liveEnemyUnits.map((enemy) => {
                            const enemyDamage = liveDamageTotals.enemyTotals.get(enemy.id) ?? 0;
                            const isDead = enemy.hp <= 0 || enemy.alive === false;
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
    );
};
