import { useMemo } from "react";
import { SKILL_DEFINITIONS } from "../../data/definitions";
import { getEquipmentModifiers } from "../../data/equipment";
import type { SkillId } from "../../core/types";
import { computeEffectiveStats, createPlayerStatsState, resolveEffectiveStats } from "../../core/stats";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { CharacterStatsPanel } from "../components/CharacterStatsPanel";
import { CharacterSkinPanel } from "../components/CharacterSkinPanel";
import { getSkillIconColor } from "../ui/skillColors";
import { getFaceIndex, normalizeFaceIndex } from "../ui/heroFaces";
import { getHairColor, getHairIndex, getSkinColor, normalizeHairIndex } from "../ui/heroHair";

type StatsPanelContainerProps = {
    onRenameHero: () => void;
};

export const StatsPanelContainer = ({ onRenameHero }: StatsPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const activePlayerId = activePlayer?.id ?? null;
    const [isCollapsed, setCollapsed] = usePersistedCollapse("stats", false);
    const [isSkinCollapsed, setSkinCollapsed] = usePersistedCollapse("skin", false);
    const [isSkinEditMode, setSkinEditMode] = usePersistedCollapse("skin-edit", false);
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
    const faceIndex = activePlayer?.appearance?.faceIndex ?? getFaceIndex(activePlayerId ?? "default");
    const hairIndex = activePlayer?.appearance?.hairIndex ?? getHairIndex(activePlayerId ?? "default");
    const hairColor = activePlayer?.appearance?.hairColor ?? getHairColor(activePlayerId ?? "default");
    const skinColor = activePlayer?.appearance?.skinColor ?? getSkinColor(activePlayerId ?? "default");

    const handleNextFace = () => {
        if (!activePlayerId) {
            return;
        }
        const next = normalizeFaceIndex(faceIndex + 1);
        gameStore.dispatch({ type: "updateAppearance", playerId: activePlayerId, appearance: { faceIndex: next } });
    };

    const handleNextHair = () => {
        if (!activePlayerId) {
            return;
        }
        const next = normalizeHairIndex(hairIndex + 1);
        gameStore.dispatch({ type: "updateAppearance", playerId: activePlayerId, appearance: { hairIndex: next } });
    };

    const handleHairColorChange = (color: string) => {
        if (!activePlayerId) {
            return;
        }
        gameStore.dispatch({ type: "updateAppearance", playerId: activePlayerId, appearance: { hairColor: color } });
    };

    const handleSkinColorChange = (color: string) => {
        if (!activePlayerId) {
            return;
        }
        gameStore.dispatch({ type: "updateAppearance", playerId: activePlayerId, appearance: { skinColor: color } });
    };

    return (
        <>
            <CharacterSkinPanel
                avatarColor={avatarColor}
                avatarSkillId={activePlayer?.selectedActionId ?? null}
                faceIndex={faceIndex}
                hairIndex={hairIndex}
                hairColor={hairColor}
                skinColor={skinColor}
                heroName={activePlayer?.name ?? null}
                isPlaceholder={!activePlayer}
                isCollapsed={isSkinCollapsed}
                isEditMode={isSkinEditMode}
                onRenameHero={onRenameHero}
                canRenameHero={Boolean(activePlayer)}
                onNextFace={handleNextFace}
                onNextHair={handleNextHair}
                onHairColorChange={handleHairColorChange}
                onSkinColorChange={handleSkinColorChange}
                onToggleCollapsed={() => setSkinCollapsed((value) => !value)}
                onToggleEditMode={() => setSkinEditMode((value) => !value)}
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
