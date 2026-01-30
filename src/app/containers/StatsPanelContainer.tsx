import { useMemo } from "react";
import { SKILL_DEFINITIONS } from "../../data/definitions";
import { getEquipmentModifiers } from "../../data/equipment";
import type { SkillId } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { CharacterStatsPanel } from "../components/CharacterStatsPanel";
import { HeroSkinPanelContainer } from "./HeroSkinPanelContainer";

type StatsPanelContainerProps = {
    onRenameHero: () => void;
};

export const StatsPanelContainer = ({ onRenameHero }: StatsPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const [isCollapsed, setCollapsed] = usePersistedCollapse("stats", false);
    const now = Date.now();
    const activeEquipment = activePlayer?.equipment ?? null;
    const equipmentMods = useMemo(
        () => (activeEquipment ? getEquipmentModifiers(activeEquipment) : []),
        [activeEquipment]
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
    const skillProgress = useMemo(() => SKILL_DEFINITIONS.reduce<Partial<Record<SkillId, number>>>((acc, skill) => {
        const state = activePlayer?.skills[skill.id];
        if (!state) {
            acc[skill.id] = 0;
            return acc;
        }
        if (state.maxLevel > 0 && state.level >= state.maxLevel) {
            acc[skill.id] = 1;
            return acc;
        }
        const progress = state.xpNext > 0 ? state.xp / state.xpNext : 0;
        acc[skill.id] = Math.max(0, Math.min(1, progress));
        return acc;
    }, {}), [activePlayer]);

    return (
        <>
            <HeroSkinPanelContainer onRenameHero={onRenameHero} />
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={skillLevels}
                skillProgress={skillProgress}
                stats={statsState}
                effectiveStats={effectiveStats}
                equipmentMods={equipmentMods}
                now={now}
                isCollapsed={isCollapsed}
                onToggleCollapsed={() => setCollapsed((value) => !value)}
            />
        </>
    );
};
