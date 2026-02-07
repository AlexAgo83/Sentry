import { memo, type CSSProperties } from "react";
import type { CombatSkillId, PlayerStatsState, SkillDefinition, SkillId, StatId, StatModifier } from "../../core/types";
import { STAT_IDS } from "../../core/stats";
import { SKILL_MAX_LEVEL } from "../../core/constants";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { getSkillIconColor } from "../ui/skillColors";
import { buildCombatDisplay } from "../selectors/combatSelectors";

type CharacterStatsPanelProps = {
    skills: SkillDefinition[];
    skillLevels: Partial<Record<SkillId, number>>;
    skillProgress: Partial<Record<SkillId, number>>;
    stats: PlayerStatsState;
    effectiveStats: Record<StatId, number>;
    equipmentMods: StatModifier[];
    now: number;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
};

const resolveSkillLevel = (levels: Partial<Record<SkillId, number>>, skillId: SkillId) => {
    return levels[skillId] ?? 0;
};

const COMBAT_SKILL_IDS: CombatSkillId[] = ["CombatMelee", "CombatRanged", "CombatMagic"];
const COMBAT_SKILL_LABELS: Record<CombatSkillId, string> = {
    CombatMelee: "Melee",
    CombatRanged: "Ranged",
    CombatMagic: "Magic"
};

type StatRowProps = {
    skill: SkillDefinition;
    level: number;
    color: string;
    progress: number;
};

const StatRow = memo(({ skill, level, color, progress }: StatRowProps) => {
    const progressPercent = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
    const progressColor = color.startsWith("#") && color.length === 7
        ? `${color}33`
        : "rgba(93, 217, 193, 0.2)";
    const style = {
        "--ts-skill-progress": progressPercent,
        "--ts-skill-progress-color": progressColor
    } as CSSProperties;

    return (
        <div className="ts-stat" style={style}>
        <div className="ts-stat-left">
            <div className="ts-stat-icon" style={{ borderColor: color, color }}>
                <SkillIcon skillId={skill.id} color={color} />
            </div>
            <div className="ts-stat-label">{skill.name}</div>
        </div>
        <div className="ts-stat-value ts-stat-level">
            <span className="ts-stat-level-value">{level}</span>
            <span className="ts-stat-level-max">/{SKILL_MAX_LEVEL}</span>
        </div>
        </div>
    );
});

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

const formatCombatValue = (value: number, digits = 0): string => {
    if (!Number.isFinite(value)) {
        return "0";
    }
    if (digits > 0) {
        return value.toFixed(digits);
    }
    return String(Math.round(value));
};

const formatCombatDelta = (value: number, digits = 0): string => {
    if (!Number.isFinite(value) || value === 0) {
        return "0";
    }
    const sign = value > 0 ? "+" : "-";
    const abs = Math.abs(value);
    const formatted = digits > 0 ? abs.toFixed(digits) : String(Math.round(abs));
    return `${sign}${formatted}`;
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
    skillProgress,
    stats,
    effectiveStats,
    equipmentMods,
    now,
    isCollapsed,
    onToggleCollapsed
}: CharacterStatsPanelProps) => {
    const permTotals = accumulateTotals(stats.permanentMods);
    const tempTotals = accumulateTotals(stats.temporaryMods);
    const gearTotals = equipmentMods.length > 0 ? accumulateTotals(equipmentMods) : buildStatTotals();
    const tempMods = stats.temporaryMods;
    const combatLevel = resolveSkillLevel(skillLevels, "CombatMelee");
    const combatDisplay = buildCombatDisplay(combatLevel, stats, effectiveStats, null);
    const combatSkills = COMBAT_SKILL_IDS.map((skillId) => ({
        id: skillId,
        name: COMBAT_SKILL_LABELS[skillId],
        level: resolveSkillLevel(skillLevels, skillId)
    }));
    const displaySkills = skills.filter((skill) => !COMBAT_SKILL_IDS.includes(skill.id as CombatSkillId));

    return (
        <section className="generic-panel ts-panel ts-panel-stats">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Stats</h2>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
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
                                {displaySkills.map((skill) => {
                                    const level = resolveSkillLevel(skillLevels, skill.id);
                                    const color = getSkillIconColor(skill.id);
                                    const progress = skillProgress[skill.id] ?? 0;
                                    return (
                                        <StatRow
                                            key={skill.id}
                                            skill={skill}
                                            level={level}
                                            color={color}
                                            progress={progress}
                                        />
                                    );
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
                            <div className="ts-character-breakdown ts-character-breakdown--combat">
                                <div className="ts-character-title">Combat</div>
                                <div className="ts-combat-skill-lines">
                                    {combatSkills.map((skill) => {
                                        const color = getSkillIconColor(skill.id);
                                        return (
                                            <div key={skill.id} className="ts-combat-skill-line">
                                                <span className="ts-combat-skill-icon" style={{ color }}>
                                                    <SkillIcon skillId={skill.id} color={color} />
                                                </span>
                                                <span className="ts-combat-skill-label" style={{ color }}>{skill.name}</span>
                                                <span className="ts-combat-skill-level ts-stat-level">
                                                    <span className="ts-stat-level-value">{skill.level}</span>
                                                    <span className="ts-stat-level-max">/{SKILL_MAX_LEVEL}</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="ts-character-header ts-character-header--combat">
                                    <span>Metric</span>
                                    <span>Base</span>
                                    <span>Modifiers</span>
                                    <span>Total</span>
                                </div>
                                <div className="ts-character-grid">
                                    <div className="ts-character-row ts-character-row--combat">
                                        <div className="ts-character-cell ts-character-cell--stat">
                                            <span className="ts-character-cell-label">Metric</span>
                                            <span className="ts-character-cell-value">Combat Lv</span>
                                        </div>
                                        <div className="ts-character-cell">
                                            <span className="ts-character-cell-label">Base</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.level.base)}
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--mods">
                                            <span className="ts-character-cell-label">Modifiers</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatDelta(combatDisplay.level.modifiers)}
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--total">
                                            <span className="ts-character-cell-label">Total</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.level.total)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ts-character-row ts-character-row--combat">
                                        <div className="ts-character-cell ts-character-cell--stat">
                                            <span className="ts-character-cell-label">Metric</span>
                                            <span className="ts-character-cell-value">Attack cadence</span>
                                        </div>
                                        <div className="ts-character-cell">
                                            <span className="ts-character-cell-label">Base</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.attackIntervalMs.base)}ms
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--mods">
                                            <span className="ts-character-cell-label">Modifiers</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatDelta(combatDisplay.attackIntervalMs.modifiers)}ms
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--total">
                                            <span className="ts-character-cell-label">Total</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.attackIntervalMs.total)}ms
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ts-character-row ts-character-row--combat">
                                        <div className="ts-character-cell ts-character-cell--stat">
                                            <span className="ts-character-cell-label">Metric</span>
                                            <span className="ts-character-cell-value">Attacks/sec</span>
                                        </div>
                                        <div className="ts-character-cell">
                                            <span className="ts-character-cell-label">Base</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.attacksPerSecond.base, 2)}
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--mods">
                                            <span className="ts-character-cell-label">Modifiers</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatDelta(combatDisplay.attacksPerSecond.modifiers, 2)}
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--total">
                                            <span className="ts-character-cell-label">Total</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.attacksPerSecond.total, 2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ts-character-row ts-character-row--combat">
                                        <div className="ts-character-cell ts-character-cell--stat">
                                            <span className="ts-character-cell-label">Metric</span>
                                            <span className="ts-character-cell-value">Damage</span>
                                        </div>
                                        <div className="ts-character-cell">
                                            <span className="ts-character-cell-label">Base</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.damage.base)}
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--mods">
                                            <span className="ts-character-cell-label">Modifiers</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatDelta(combatDisplay.damage.modifiers)}
                                            </span>
                                        </div>
                                        <div className="ts-character-cell ts-character-cell--total">
                                            <span className="ts-character-cell-label">Total</span>
                                            <span className="ts-character-cell-value">
                                                {formatCombatValue(combatDisplay.damage.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
});

CharacterStatsPanel.displayName = "CharacterStatsPanel";
StatRow.displayName = "StatRow";
