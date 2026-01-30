import { useMemo, useState } from "react";
import { SKILL_DEFINITIONS } from "../../data/definitions";
import { getEquipmentModifiers } from "../../data/equipment";
import type { SkillId } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { CharacterStatsPanel } from "../components/CharacterStatsPanel";
import { CharacterSkinPanel } from "../components/CharacterSkinPanel";
import { getSkillIconColor } from "../ui/skillColors";
import { getFaceIndex, normalizeFaceIndex } from "../ui/heroFaces";
import { getHairIndex, normalizeHairIndex } from "../ui/heroHair";

type StatsPanelContainerProps = {
    onRenameHero: () => void;
};

export const StatsPanelContainer = ({ onRenameHero }: StatsPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const activePlayerId = activePlayer?.id ?? null;
    const [isCollapsed, setCollapsed] = usePersistedCollapse("stats", false);
    const [faceByPlayer, setFaceByPlayer] = useState<Record<string, number>>({});
    const [hairByPlayer, setHairByPlayer] = useState<Record<string, number>>({});
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
    const avatarColor = getSkillIconColor(activePlayer?.selectedActionId);
    const skillLevels = useMemo(() => SKILL_DEFINITIONS.reduce<Partial<Record<SkillId, number>>>((acc, skill) => {
        acc[skill.id] = activePlayer?.skills[skill.id]?.level ?? 0;
        return acc;
    }, {}), [activePlayer]);
    const faceIndex = activePlayerId
        ? (faceByPlayer[activePlayerId] ?? getFaceIndex(activePlayerId))
        : getFaceIndex("default");
    const hairIndex = activePlayerId
        ? (hairByPlayer[activePlayerId] ?? getHairIndex(activePlayerId))
        : getHairIndex("default");

    const handleNextFace = () => {
        if (!activePlayerId) {
            return;
        }
        setFaceByPlayer((prev) => {
            const current = prev[activePlayerId] ?? getFaceIndex(activePlayerId);
            const next = normalizeFaceIndex(current + 1);
            return { ...prev, [activePlayerId]: next };
        });
    };

    const handleNextHair = () => {
        if (!activePlayerId) {
            return;
        }
        setHairByPlayer((prev) => {
            const current = prev[activePlayerId] ?? getHairIndex(activePlayerId);
            const next = normalizeHairIndex(current + 1);
            return { ...prev, [activePlayerId]: next };
        });
    };

    return (
        <>
            <CharacterSkinPanel
                avatarColor={avatarColor}
                avatarSkillId={activePlayer?.selectedActionId ?? null}
                faceIndex={faceIndex}
                hairIndex={hairIndex}
                hairSeed={activePlayerId}
                isPlaceholder={!activePlayer}
                onRenameHero={onRenameHero}
                canRenameHero={Boolean(activePlayer)}
                onNextFace={handleNextFace}
                onNextHair={handleNextHair}
            />
            <CharacterStatsPanel
                skills={SKILL_DEFINITIONS}
                skillLevels={skillLevels}
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
