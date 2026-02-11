import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { CharacterSkinPanel } from "../components/CharacterSkinPanel";
import { getActiveDungeonRuns } from "../../core/dungeon";
import { MIN_ACTION_INTERVAL_MS, STAT_PERCENT_PER_POINT } from "../../core/constants";
import { resolveEffectiveStats } from "../../core/stats";
import { getSkillIconColor } from "../ui/skillColors";
import { getSkillBackgroundUrl } from "../ui/skillBackgrounds";
import { getFaceIndex, normalizeFaceIndex } from "../ui/heroFaces";
import { getHairColor, getHairIndex, getSkinColor, normalizeHairIndex } from "../ui/heroHair";
import { getActionDefinition, getRecipeDefinition, isRecipeUnlocked } from "../../data/definitions";
import { getEquipmentModifiers } from "../../data/equipment";

type HeroSkinPanelContainerProps = {
    onRenameHero: () => void;
    useDungeonProgress?: boolean;
};

export const HeroSkinPanelContainer = ({ onRenameHero, useDungeonProgress = false }: HeroSkinPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const activePlayerId = activePlayer?.id ?? null;
    const combatSkillIds = new Set(["CombatMelee", "CombatRanged", "CombatMagic"]);
    const [isSkinCollapsed, setSkinCollapsed] = usePersistedCollapse("skin", false);
    const [isSkinEditMode, setSkinEditMode] = usePersistedCollapse("skin-edit", false);
    const dungeonProgressPercent = useGameStore((state) => {
        if (!useDungeonProgress) {
            return null;
        }
        const playerId = state.activePlayerId;
        if (!playerId) {
            return null;
        }
        const run = getActiveDungeonRuns(state.dungeon)
            .find((candidate) => candidate.party.some((member) => member.playerId === playerId));
        if (!run) {
            return null;
        }
        const floorCount = Math.max(1, Math.floor(run.floorCount || 0));
        const floor = Math.max(1, Math.min(floorCount, Math.floor(run.floor || 1)));
        const progress = floorCount > 0 ? (floor / floorCount) * 100 : 0;
        return Math.max(0, Math.min(100, Math.round(progress)));
    });
    const isInDungeon = useGameStore((state) => {
        if (!useDungeonProgress) {
            return false;
        }
        const playerId = state.activePlayerId;
        if (!playerId) {
            return false;
        }
        return getActiveDungeonRuns(state.dungeon)
            .some((candidate) => candidate.party.some((member) => member.playerId === playerId));
    });

    const avatarColor = getSkillIconColor(activePlayer?.selectedActionId);
    const faceIndex = activePlayer?.appearance?.faceIndex ?? getFaceIndex(activePlayerId ?? "default");
    const hairIndex = activePlayer?.appearance?.hairIndex ?? getHairIndex(activePlayerId ?? "default");
    const hairColor = activePlayer?.appearance?.hairColor ?? getHairColor(activePlayerId ?? "default");
    const skinColor = activePlayer?.appearance?.skinColor ?? getSkinColor(activePlayerId ?? "default");
    const showHelmet = activePlayer?.appearance?.showHelmet ?? true;
    const skillBackgroundUrl = isInDungeon
        ? getSkillBackgroundUrl("Roaming")
        : getSkillBackgroundUrl(activePlayer?.selectedActionId ?? null);
    const isCombatSkill = Boolean(activePlayer?.selectedActionId && combatSkillIds.has(activePlayer.selectedActionId));
    const progressColor = (isInDungeon || isCombatSkill) ? "rgba(239, 77, 67, 0.85)" : undefined;
    const actionProgressPercent = activePlayer?.actionProgress?.progressPercent ?? 0;
    const isUsingDungeonProgress = Number.isFinite(dungeonProgressPercent ?? Number.NaN);
    const progressAnimation = (() => {
        if (isUsingDungeonProgress || !activePlayer?.selectedActionId) {
            return null;
        }
        const actionDef = getActionDefinition(activePlayer.selectedActionId);
        if (!actionDef) {
            return null;
        }
        const skill = activePlayer.skills[actionDef.skillId];
        const selectedRecipeId = skill?.selectedRecipeId;
        if (!skill || !selectedRecipeId) {
            return null;
        }
        const recipeDef = getRecipeDefinition(actionDef.skillId, selectedRecipeId);
        if (recipeDef && !isRecipeUnlocked(recipeDef, skill.level)) {
            return null;
        }

        const equipmentModifiers = getEquipmentModifiers(activePlayer.equipment);
        const { effective } = resolveEffectiveStats(activePlayer.stats, Date.now(), equipmentModifiers);
        const intervalMultiplier = 1 - effective.Agility * STAT_PERCENT_PER_POINT;
        const baseInterval = Math.ceil(skill.baseInterval * intervalMultiplier);
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval)
            + ((activePlayer.stamina ?? 0) <= 0 ? actionDef.stunTime : 0);
        if (!Number.isFinite(actionInterval) || actionInterval <= 0) {
            return null;
        }

        return {
            key: `${activePlayer.id}:${actionDef.skillId}:${selectedRecipeId}:${actionInterval}`,
            intervalMs: actionInterval,
            currentIntervalMs: activePlayer.actionProgress.currentInterval ?? 0,
            lastExecutionTimeMs: activePlayer.actionProgress.lastExecutionTime ?? null
        };
    })();
    const baseProgressPercent = progressAnimation ? 0 : actionProgressPercent;
    const progressPercent = isUsingDungeonProgress
        ? (dungeonProgressPercent as number)
        : baseProgressPercent;
    const isStunned = Boolean(activePlayer?.selectedActionId) && (activePlayer?.stamina ?? 0) <= 0;

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

    const handleToggleHelmet = () => {
        if (!activePlayerId) {
            return;
        }
        gameStore.dispatch({ type: "updateAppearance", playerId: activePlayerId, appearance: { showHelmet: !showHelmet } });
    };

    return (
        <CharacterSkinPanel
            avatarColor={avatarColor}
            faceIndex={faceIndex}
            hairIndex={hairIndex}
            hairColor={hairColor}
            skinColor={skinColor}
            showHelmet={showHelmet}
            equipment={activePlayer?.equipment ?? null}
            skillBackgroundUrl={skillBackgroundUrl}
            progressPercent={progressPercent}
            progressAnimation={progressAnimation}
            progressColor={progressColor}
            isStunned={isStunned}
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
            onToggleHelmet={handleToggleHelmet}
            onToggleCollapsed={() => setSkinCollapsed((value) => !value)}
            onToggleEditMode={() => setSkinEditMode((value) => !value)}
        />
    );
};
