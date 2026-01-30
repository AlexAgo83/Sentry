import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { CharacterSkinPanel } from "../components/CharacterSkinPanel";
import { getSkillIconColor } from "../ui/skillColors";
import { getFaceIndex, normalizeFaceIndex } from "../ui/heroFaces";
import { getHairColor, getHairIndex, getSkinColor, normalizeHairIndex } from "../ui/heroHair";

type HeroSkinPanelContainerProps = {
    onRenameHero: () => void;
};

export const HeroSkinPanelContainer = ({ onRenameHero }: HeroSkinPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const activePlayerId = activePlayer?.id ?? null;
    const [isSkinCollapsed, setSkinCollapsed] = usePersistedCollapse("skin", false);
    const [isSkinEditMode, setSkinEditMode] = usePersistedCollapse("skin-edit", false);

    const avatarColor = getSkillIconColor(activePlayer?.selectedActionId);
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
        <CharacterSkinPanel
            avatarColor={avatarColor}
            avatarSkillId={activePlayer?.selectedActionId ?? null}
            faceIndex={faceIndex}
            hairIndex={hairIndex}
            hairColor={hairColor}
            skinColor={skinColor}
            equipment={activePlayer?.equipment ?? null}
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
    );
};
