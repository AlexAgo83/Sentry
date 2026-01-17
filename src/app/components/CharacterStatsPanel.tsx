import { memo } from "react";
import type { SkillDefinition, SkillId } from "../../core/types";

const resolveSkillLevel = (levels: Partial<Record<SkillId, number>>, skillId: SkillId) => {
    return levels[skillId] ?? 0;
};

type CharacterStatsPanelProps = {
    skills: SkillDefinition[];
    skillLevels: Partial<Record<SkillId, number>>;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
};

export const CharacterStatsPanel = memo(({
    skills,
    skillLevels,
    isCollapsed,
    onToggleCollapsed
}: CharacterStatsPanelProps) => (
    <section className="generic-panel ts-panel">
        <div className="ts-panel-header">
            <h2 className="ts-panel-title">Character stats</h2>
            <span className="ts-panel-meta">Focused hero</span>
            <button
                type="button"
                className="ts-collapse-button ts-focusable"
                onClick={onToggleCollapsed}
            >
                {isCollapsed ? "Expand" : "Collapse"}
            </button>
        </div>
        {!isCollapsed ? (
            <>
                <div className="ts-stat-grid">
                    {skills.map((skill) => (
                        <div key={skill.id} className="ts-stat">
                            <div className="ts-stat-label">{skill.name}</div>
                            <div className="ts-stat-value">Lv {resolveSkillLevel(skillLevels, skill.id)}</div>
                        </div>
                    ))}
                </div>
                <div className="ts-stat-placeholder">Statistics overview coming soon.</div>
            </>
        ) : null}
    </section>
));

CharacterStatsPanel.displayName = "CharacterStatsPanel";
