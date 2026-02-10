import { useMemo } from "react";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType, getEquipmentModifiers } from "../../data/equipment";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer, selectHeroVirtualScore, selectVirtualScore } from "../selectors/gameSelectors";
import { buildCombatDisplay } from "../selectors/combatSelectors";
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
    const weaponType = activePlayer ? getEquippedWeaponType(activePlayer.equipment) : null;
    const combatSkillId = activePlayer
        ? getCombatSkillIdForWeaponType(weaponType)
        : null;
    const combatDisplay = activePlayer
        ? buildCombatDisplay(
            activePlayer.skills[combatSkillId ?? "CombatMelee"]?.level ?? 0,
            statsState,
            effectiveStats,
            weaponType
        )
        : buildCombatDisplay(0, statsState, effectiveStats, weaponType);
    const combatSkillProgress = activePlayer
        ? {
            CombatMelee: {
                level: activePlayer.skills.CombatMelee?.level ?? 0,
                xp: activePlayer.skills.CombatMelee?.xp ?? 0,
                xpNext: activePlayer.skills.CombatMelee?.xpNext ?? 0
            },
            CombatRanged: {
                level: activePlayer.skills.CombatRanged?.level ?? 0,
                xp: activePlayer.skills.CombatRanged?.xp ?? 0,
                xpNext: activePlayer.skills.CombatRanged?.xpNext ?? 0
            },
            CombatMagic: {
                level: activePlayer.skills.CombatMagic?.level ?? 0,
                xp: activePlayer.skills.CombatMagic?.xp ?? 0,
                xpNext: activePlayer.skills.CombatMagic?.xpNext ?? 0
            }
        }
        : {};

    return (
        <>
            <HeroSkinPanelContainer onRenameHero={onRenameHero} useDungeonProgress />
            <StatsDashboardPanel
                heroProgression={heroProgression}
                globalProgression={globalProgression}
                globalVirtualScore={globalVirtualScore}
                heroVirtualScore={heroVirtualScore}
                stats={statsState}
                effectiveStats={effectiveStats}
                equipmentMods={equipmentMods}
                combatDisplay={combatDisplay}
                combatSkillProgress={combatSkillProgress}
                weaponType={weaponType}
                isCollapsed={isCollapsed}
                onToggleCollapsed={() => setCollapsed((value) => !value)}
            />
        </>
    );
};
