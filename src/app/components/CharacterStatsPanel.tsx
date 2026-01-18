import { memo } from "react";
import type { SkillDefinition, SkillId } from "../../core/types";
import { SkillIcon } from "../ui/skillIcons";

const resolveSkillLevel = (levels: Partial<Record<SkillId, number>>, skillId: SkillId) => {
    return levels[skillId] ?? 0;
};

const SKILL_COLORS: Record<SkillId, string> = {
    Combat: "#f2c14e",
    Hunting: "#5dd9c1",
    Cooking: "#f07f4f",
    Excavation: "#9aa7c3",
    MetalWork: "#c68130",
    Alchemy: "#7fd1b9",
    Herbalism: "#8ac926",
    Tailoring: "#f4d35e",
    Fishing: "#4cc9f0",
    Carpentry: "#c97c5d",
    Leatherworking: "#a26769"
};

type CharacterStatsPanelProps = {
    skills: SkillDefinition[];
    skillLevels: Partial<Record<SkillId, number>>;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    onRenameHero: () => void;
    canRenameHero: boolean;
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

export const CharacterStatsPanel = memo(({
    skills,
    skillLevels,
    isCollapsed,
    onToggleCollapsed,
    onRenameHero,
    canRenameHero
}: CharacterStatsPanelProps) => (
    <section className="generic-panel ts-panel">
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
                    data-mobile-label={isCollapsed ? "+" : "-"}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                    <span className="ts-collapse-label">
                        {isCollapsed ? "Expand" : "Collapse"}
                    </span>
                </button>
            </div>
        </div>
        {!isCollapsed ? (
            <>
                <div className="ts-stat-grid">
                    {skills.map((skill) => {
                        const level = resolveSkillLevel(skillLevels, skill.id);
                        const color = SKILL_COLORS[skill.id];
                        return <StatRow key={skill.id} skill={skill} level={level} color={color} />;
                    })}
                </div>
            </>
        ) : null}
    </section>
));

CharacterStatsPanel.displayName = "CharacterStatsPanel";
StatRow.displayName = "StatRow";
