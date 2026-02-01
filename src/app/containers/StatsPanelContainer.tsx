import { useMemo } from "react";
import { getEquipmentModifiers } from "../../data/equipment";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer, selectHeroVirtualScore, selectVirtualScore } from "../selectors/gameSelectors";
import { StatsDashboardPanel } from "../components/StatsDashboardPanel";
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
    const globalProgression = useGameStore((state) => state.progression);
    const globalVirtualScore = useGameStore(selectVirtualScore);
    const heroVirtualScore = useGameStore(selectHeroVirtualScore);
    const heroProgression = activePlayer?.progression ?? globalProgression;

    return (
        <>
            <HeroSkinPanelContainer onRenameHero={onRenameHero} />
            <StatsDashboardPanel
                heroProgression={heroProgression}
                globalProgression={globalProgression}
                globalVirtualScore={globalVirtualScore}
                heroVirtualScore={heroVirtualScore}
                stats={statsState}
                effectiveStats={effectiveStats}
                equipmentMods={equipmentMods}
                isCollapsed={isCollapsed}
                onToggleCollapsed={() => setCollapsed((value) => !value)}
            />
        </>
    );
};
