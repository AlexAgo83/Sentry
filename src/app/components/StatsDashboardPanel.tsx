import { memo, useMemo, useState, type CSSProperties } from "react";
import type { PlayerStatsState, ProgressionState, SkillId, StatId, StatModifier } from "../../core/types";
import { STAT_IDS } from "../../core/stats";
import { SKILL_DEFINITIONS } from "../../data/definitions";
import { usePersistedPanelTab } from "../hooks/usePersistedPanelTab";
import { CollapseIcon } from "../ui/collapseIcon";
import { GlobalProgressIcon, HeroProgressIcon, HeroStatsIcon } from "../ui/statsViewIcons";
import { ProgressionTrendChart } from "./ProgressionTrendChart";

type StatsDashboardPanelProps = {
    heroProgression: ProgressionState;
    globalProgression: ProgressionState;
    globalVirtualScore: number;
    heroVirtualScore: number;
    stats: PlayerStatsState;
    effectiveStats: Record<StatId, number>;
    equipmentMods: StatModifier[];
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
};

type StatTotals = Record<StatId, { flat: number; mult: number }>;

const buildStatTotals = (): StatTotals => {
    return STAT_IDS.reduce<StatTotals>((acc, statId) => {
        acc[statId] = { flat: 0, mult: 0 };
        return acc;
    }, {} as StatTotals);
};

const accumulateTotals = (mods: StatModifier[]): StatTotals => {
    const totals = buildStatTotals();
    mods.forEach((mod) => {
        if (!totals[mod.stat]) {
            return;
        }
        if (mod.kind === "mult") {
            totals[mod.stat].mult += mod.value;
        } else {
            totals[mod.stat].flat += mod.value;
        }
    });
    return totals;
};

const formatModSummary = (flat: number, mult: number): string => {
    const parts: string[] = [];
    if (flat !== 0) {
        parts.push(`${flat > 0 ? "+" : ""}${flat}`);
    }
    if (mult !== 0) {
        parts.push(`${mult > 0 ? "+" : ""}${Math.round(mult * 100)}%`);
    }
    return parts.length > 0 ? parts.join(" ") : "+0";
};

const formatStatValue = (value: number): string => {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const numberFormatter = new Intl.NumberFormat();

const formatNumber = (value: number): string => {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return numberFormatter.format(Math.round(value));
};

const formatDuration = (ms: number): string => {
    if (!Number.isFinite(ms) || ms <= 0) {
        return "0m";
    }
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

export const StatsDashboardPanel = memo(({
    heroProgression,
    globalProgression,
    globalVirtualScore,
    heroVirtualScore,
    stats,
    effectiveStats,
    equipmentMods,
    isCollapsed,
    onToggleCollapsed
}: StatsDashboardPanelProps) => {
    const [activeTab, setActiveTab] = usePersistedPanelTab("stats", "hero-progression");
    const resolvedTab: "hero-stats" | "global-progression" | "hero-progression" =
        activeTab === "hero-stats" ? "hero-stats" : activeTab === "global-progression"
        ? "global-progression"
        : "hero-progression";
    const scopedProgression = resolvedTab === "global-progression" ? globalProgression : heroProgression;
    const scopedVirtualScore = resolvedTab === "global-progression" ? globalVirtualScore : heroVirtualScore;
    const buckets = useMemo(() => scopedProgression?.buckets ?? [], [scopedProgression]);

    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const totals = useMemo(() => {
        return buckets.reduce(
            (acc, bucket) => {
                acc.xp += bucket.xp;
                acc.gold += bucket.gold;
                acc.activeMs += bucket.activeMs;
                acc.idleMs += bucket.idleMs;
                return acc;
            },
            { xp: 0, gold: 0, activeMs: 0, idleMs: 0 }
        );
    }, [buckets]);

    const trend = useMemo(() => {
        const labels = buckets.map((bucket) => bucket.dayKey.slice(5));
        const xpSeries = buckets.map((bucket) => bucket.xp);
        const goldSeries = buckets.map((bucket) => bucket.gold);
        return { labels, xpSeries, goldSeries };
    }, [buckets]);

    const hasProgressionData = useMemo(() => {
        return buckets.some((bucket) => {
            if (bucket.xp > 0 || bucket.gold > 0 || bucket.activeMs > 0 || bucket.idleMs > 0) {
                return true;
            }
            return Object.keys(bucket.skillActiveMs).length > 0;
        });
    }, [buckets]);

    const topSkills = useMemo(() => {
        const totalsBySkill: Partial<Record<SkillId, number>> = {};
        buckets.forEach((bucket) => {
            Object.entries(bucket.skillActiveMs).forEach(([skillId, value]) => {
                const numeric = Number(value);
                if (!Number.isFinite(numeric) || numeric <= 0) {
                    return;
                }
                totalsBySkill[skillId as SkillId] = (totalsBySkill[skillId as SkillId] ?? 0) + numeric;
            });
        });
        const entries = SKILL_DEFINITIONS.map((skill) => ({
            id: skill.id,
            name: skill.name,
            ms: totalsBySkill[skill.id] ?? 0
        }))
            .filter((entry) => entry.ms > 0)
            .sort((a, b) => b.ms - a.ms);
        return entries;
    }, [buckets]);

    const permTotals = useMemo(() => accumulateTotals(stats.permanentMods), [stats.permanentMods]);
    const tempTotals = useMemo(() => accumulateTotals(stats.temporaryMods), [stats.temporaryMods]);
    const gearTotals = useMemo(
        () => (equipmentMods.length > 0 ? accumulateTotals(equipmentMods) : buildStatTotals()),
        [equipmentMods]
    );

    const activeRatio = totals.activeMs + totals.idleMs > 0
        ? totals.activeMs / (totals.activeMs + totals.idleMs)
        : 0;

    const hasTrendData = trend.xpSeries.some((value) => value > 0) || trend.goldSeries.some((value) => value > 0);

    return (
        <section className="generic-panel ts-panel ts-panel-stats">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Stats</h2>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <div className="ts-stats-tabs" role="tablist" aria-label="Stats tabs">
                        <button
                            type="button"
                            className={`ts-icon-button ts-panel-action-button ts-focusable ts-stats-tab${resolvedTab === "global-progression" ? " is-active" : ""}`}
                            onClick={() => setActiveTab("global-progression")}
                            role="tab"
                            aria-selected={resolvedTab === "global-progression"}
                            aria-label="Global progression"
                        >
                            <GlobalProgressIcon className="ts-stats-tab-icon" />
                            <span className="ts-stats-tab-label">Global progression</span>
                        </button>
                        <button
                            type="button"
                            className={`ts-icon-button ts-panel-action-button ts-focusable ts-stats-tab${resolvedTab === "hero-progression" ? " is-active" : ""}`}
                            onClick={() => setActiveTab("hero-progression")}
                            role="tab"
                            aria-selected={resolvedTab === "hero-progression"}
                            aria-label="Hero progression"
                        >
                            <HeroProgressIcon className="ts-stats-tab-icon" />
                            <span className="ts-stats-tab-label">Hero progression</span>
                        </button>
                        <button
                            type="button"
                            className={`ts-icon-button ts-panel-action-button ts-focusable ts-stats-tab${resolvedTab === "hero-stats" ? " is-active" : ""}`}
                            onClick={() => setActiveTab("hero-stats")}
                            role="tab"
                            aria-selected={resolvedTab === "hero-stats"}
                            aria-label="Hero statistics"
                        >
                            <HeroStatsIcon className="ts-stats-tab-icon" />
                            <span className="ts-stats-tab-label">Hero statistics</span>
                        </button>
                    </div>
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable"
                        onClick={onToggleCollapsed}
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <span className="ts-collapse-label">
                            <CollapseIcon isCollapsed={isCollapsed} />
                        </span>
                    </button>
                </div>
            </div>
            {!isCollapsed ? (
                <div className="ts-panel-body">
                    {resolvedTab === "hero-stats" ? (
                        <div className="ts-character-breakdown">
                            <div className="ts-character-header">
                                <span>Stat</span>
                                <span>Base</span>
                                <span>Perm</span>
                                <span>Temp</span>
                                <span>Gear</span>
                                <span>Total</span>
                            </div>
                            <div className="ts-character-grid">
                                {STAT_IDS.map((statId) => {
                                    const baseValue = stats.base[statId] ?? 0;
                                    const perm = permTotals[statId];
                                    const temp = tempTotals[statId];
                                    const gear = gearTotals[statId];
                                    const totalValue = effectiveStats[statId] ?? baseValue;
                                    return (
                                        <div key={statId} className="ts-character-row">
                                            <div className="ts-character-cell ts-character-cell--stat">
                                                <span className="ts-character-cell-label">Stat</span>
                                                <span className="ts-character-cell-value">{statId}</span>
                                            </div>
                                            <div className="ts-character-cell">
                                                <span className="ts-character-cell-label">Base</span>
                                                <span className="ts-character-cell-value">{formatStatValue(baseValue)}</span>
                                            </div>
                                            <div className="ts-character-cell ts-character-cell--perm">
                                                <span className="ts-character-cell-label">Perm</span>
                                                <span className="ts-character-cell-value">
                                                    {formatModSummary(perm.flat, perm.mult)}
                                                </span>
                                            </div>
                                            <div className="ts-character-cell ts-character-cell--temp">
                                                <span className="ts-character-cell-label">Temp</span>
                                                <span className="ts-character-cell-value">
                                                    {formatModSummary(temp.flat, temp.mult)}
                                                </span>
                                            </div>
                                            <div className="ts-character-cell ts-character-cell--gear">
                                                <span className="ts-character-cell-label">Gear</span>
                                                <span className="ts-character-cell-value">
                                                    {formatModSummary(gear.flat, gear.mult)}
                                                </span>
                                            </div>
                                            <div className="ts-character-cell ts-character-cell--total">
                                                <span className="ts-character-cell-label">Total</span>
                                                <span className="ts-character-cell-value">{formatStatValue(totalValue)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="ts-progression">
                            {resolvedTab === "hero-progression" && !hasProgressionData ? (
                                <div className="ts-prog-callout">
                                    No hero data yet — start an action to begin tracking.
                                </div>
                            ) : null}
                            <div className="ts-prog-cards">
                                <div className="ts-prog-card">
                                    <span className="ts-prog-label">XP / 7d</span>
                                    <span className="ts-prog-value">{formatNumber(totals.xp)}</span>
                                </div>
                                <div className="ts-prog-card">
                                    <span className="ts-prog-label">Gold / 7d</span>
                                    <span className="ts-prog-value">{formatNumber(totals.gold)}</span>
                                </div>
                                <div className="ts-prog-card">
                                    <span className="ts-prog-label">Virtual score</span>
                                    <span className="ts-prog-value">{formatNumber(scopedVirtualScore)}</span>
                                </div>
                                <div className="ts-prog-card">
                                    <span className="ts-prog-label">Total action time</span>
                                    <span className="ts-prog-value">{formatDuration(totals.activeMs)}</span>
                                </div>
                            </div>

                            <div
                                className="ts-prog-split ts-prog-split--full"
                                style={{ "--ts-split-active": `${activeRatio * 100}%` } as CSSProperties}
                            >
                                <span className="ts-prog-label">Action / idle split</span>
                                <div className="ts-prog-split-bar">
                                    <span className="ts-prog-split-fill" />
                                </div>
                                <div className="ts-prog-split-meta">
                                    <span>Active {formatDuration(totals.activeMs)}</span>
                                    <span>Idle {formatDuration(totals.idleMs)}</span>
                                </div>
                            </div>

                            <div className="ts-prog-row">
                                <div className="ts-prog-list">
                                    <span className="ts-prog-label">Top skills (time)</span>
                                    {topSkills.length === 0 ? (
                                        <div className="ts-prog-empty">No activity yet.</div>
                                    ) : (
                                        <ul className="ts-prog-list-items">
                                            {topSkills.map((entry) => {
                                                const share = totals.activeMs > 0
                                                    ? Math.round((entry.ms / totals.activeMs) * 100)
                                                    : 0;
                                                return (
                                                    <li key={entry.id} className="ts-prog-list-row">
                                                        <span className="ts-prog-list-name">{entry.name}</span>
                                                        <span className="ts-prog-list-metrics">
                                                            <span>{formatDuration(entry.ms)}</span>
                                                            <span className="ts-prog-list-sep">·</span>
                                                            <span>{share}%</span>
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                                <div className="ts-prog-chart">
                                    <span className="ts-prog-label">XP + Gold trend</span>
                                    {hasTrendData ? (
                                        <ProgressionTrendChart
                                            labels={trend.labels}
                                            xpSeries={trend.xpSeries}
                                            goldSeries={trend.goldSeries}
                                            formatNumber={formatNumber}
                                            hoverIndex={hoverIndex}
                                            onHoverIndexChange={setHoverIndex}
                                        />
                                    ) : (
                                        <div className="ts-prog-empty">No data yet.</div>
                                    )}
                                    <div className="ts-prog-chart-legend">
                                        <span className="ts-prog-legend-item">
                                            <span className="ts-prog-legend-dot ts-prog-legend-dot--xp" aria-hidden="true" />
                                            XP
                                        </span>
                                        <span className="ts-prog-legend-item">
                                            <span className="ts-prog-legend-dot ts-prog-legend-dot--gold" aria-hidden="true" />
                                            Gold
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
});

StatsDashboardPanel.displayName = "StatsDashboardPanel";
