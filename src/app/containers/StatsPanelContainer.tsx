import { useMemo } from "react";
import { SKILL_DEFINITIONS } from "../../data/definitions";
import { getEquipmentModifiers } from "../../data/equipment";
import type { SkillId } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { CharacterStatsPanel } from "../components/CharacterStatsPanel";

type StatsPanelContainerProps = {
    onRenameHero: () => void;
};

export const StatsPanelContainer = ({ onRenameHero }: StatsPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const [isCollapsed, setCollapsed] = usePersistedCollapse("stats", false);
    const now = Date.now();
    const equipmentMods = useMemo(
        () => (activePlayer ? getEquipmentModifiers(activePlayer.equipment) : []),
        [activePlayer?.equipment]
    );
    const statsSnapshot = activePlayer
        ? resolveEffectiveStats(activePlayer.stats, now, equipmentMods)
        : null;
    const statsState = statsSnapshot?.stats ?? createPlayerStatsState();
    const effectiveStats = statsSnapshot?.effective ?? computeEffectiveStats(statsState, equipmentMods);
    const skillLevels = useMemo(() => SKILL_DEFINITIONS.reduce<Partial<Record<SkillId, number>>>((acc, skill) => {
        acc[skill.id] = activePlayer?.skills[skill.id]?.level ?? 0;
        return acc;
    }, {}), [activePlayer]);

    return (
        <CharacterStatsPanel
            skills={SKILL_DEFINITIONS}
            skillLevels={skillLevels}
            stats={statsState}
            effectiveStats={effectiveStats}
            equipmentMods={equipmentMods}
            now={now}
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            onRenameHero={onRenameHero}
            canRenameHero={Boolean(activePlayer)}
        />
    );
};
