import { memo } from "react";
import type { PlayerStatsState, SkillDefinition, SkillId, StatId, StatModifier } from "../../core/types";
import { STAT_IDS } from "../../core/stats";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { getSkillIconColor } from "../ui/skillColors";

type CharacterStatsPanelProps = {
    skills: SkillDefinition[];
    skillLevels: Partial<Record<SkillId, number>>;
    stats: PlayerStatsState;
    effectiveStats: Record<StatId, number>;
    equipmentMods: StatModifier[];
    now: number;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    onRenameHero: () => void;
    canRenameHero: boolean;
};

const resolveSkillLevel = (levels: Partial<Record<SkillId, number>>, skillId: SkillId) => {
    return levels[skillId] ?? 0;
};

type StatRowProps = {
    skill: SkillDefinition;
    level: number;
    color: string;
};

const StatRow = memo(({ skill, level, color }: StatRowProps) => (
    <div className="ts-stat">
        <div className="ts-stat-left">
            <div className="ts-stat-icon" style={{ borderColor: color, color }}>
                <SkillIcon skillId={skill.id} color={color} />
            </div>
            <div className="ts-stat-label">{skill.name}</div>
        </div>
        <div className="ts-stat-value">Lv {level}</div>
    </div>
));

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
    return parts.length > 0 ? parts.join(" ") : "0";
};

const formatStatValue = (value: number): string => {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const formatTimeLeft = (ms: number): string => {
    if (ms < 60000) {
        return `${Math.ceil(ms / 1000)}s`;
    }
    if (ms < 3600000) {
        return `${Math.ceil(ms / 60000)}m`;
    }
    return `${Math.ceil(ms / 3600000)}h`;
};

export const CharacterStatsPanel = memo(({
    skills,
    skillLevels,
    stats,
    equipmentMods,
    now,
    isCollapsed,
    onToggleCollapsed,
    onRenameHero,
    canRenameHero
}: CharacterStatsPanelProps) => {
    const permTotals = accumulateTotals(stats.permanentMods);
    const tempTotals = accumulateTotals(stats.temporaryMods);
    const gearTotals = equipmentMods.length > 0 ? accumulateTotals(equipmentMods) : buildStatTotals();
    const tempMods = stats.temporaryMods;

    return (
        <section className="generic-panel ts-panel ts-panel-stats">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Stats</h2>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className="ts-icon-button ts-panel-action-button ts-focusable"
                        onClick={onRenameHero}
                        disabled={!canRenameHero}
                        aria-label="Rename"
                    >
                        Rename
                    </button>
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
                <>
                    <div className="ts-stats-layout">
                        <div className="ts-stats-column ts-stats-skills">
                            <div className="ts-stat-grid">
                                {skills.map((skill) => {
                                    const level = resolveSkillLevel(skillLevels, skill.id);
                                    const color = getSkillIconColor(skill.id);
                                    return <StatRow key={skill.id} skill={skill} level={level} color={color} />;
                                })}
                            </div>
                        </div>
                        <div className="ts-stats-column ts-stats-attributes">
                            <div className="ts-attribute-grid">
                                {STAT_IDS.map((statId) => {
                                    const baseValue = stats.base[statId] ?? 0;
                                    const perm = permTotals[statId];
                                    const temp = tempTotals[statId];
                                    const gear = gearTotals[statId];
                                    const totalFlat = perm.flat + temp.flat + gear.flat;
                                    const totalMult = perm.mult + temp.mult + gear.mult;
                                    const modifierLabel = formatModSummary(totalFlat, totalMult);
                                    const modifierDisplay = modifierLabel === "0" ? "+0" : modifierLabel;
                                    const tooltipParts = [
                                        `Base: ${baseValue}`,
                                        `Perm: ${formatModSummary(perm.flat, perm.mult)}`,
                                        `Temp: ${formatModSummary(temp.flat, temp.mult)}`
                                    ];
                                    if (equipmentMods.length > 0) {
                                        tooltipParts.push(`Gear: ${formatModSummary(gear.flat, gear.mult)}`);
                                    }
                                    const tooltip = tooltipParts.join(" | ");
                                    return (
                                        <div key={statId} className="ts-attribute-row" title={tooltip}>
                                            <span className="ts-attribute-label">{statId}</span>
                                            <span className="ts-attribute-value">
                                                {formatStatValue(baseValue)} {modifierDisplay}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {tempMods.length > 0 ? (
                                <div className="ts-attribute-buffs">
                                    {tempMods.map((mod) => {
                                        const timeLeft = mod.expiresAt ? Math.max(0, mod.expiresAt - now) : 0;
                                        const label = `${mod.source} ${mod.stat}`;
                                        return (
                                            <span key={mod.id} className="ts-attribute-buff">
                                                {label} {timeLeft > 0 ? formatTimeLeft(timeLeft) : ""}
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
});

CharacterStatsPanel.displayName = "CharacterStatsPanel";
StatRow.displayName = "StatRow";
