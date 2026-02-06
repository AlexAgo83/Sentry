import { memo } from "react";
import type { CSSProperties } from "react";
import type { PlayerState } from "../../core/types";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../data/equipment";
import { getSkillIconColor } from "../ui/skillColors";
import { getFaceIndex, getFaceUrlByIndex } from "../ui/heroFaces";
import { getHairColor, getHairIndex, getHairUrlByIndex, getSkinColor } from "../ui/heroHair";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";
import { getEquipmentSkinVars } from "../ui/heroEquipmentSkins";
import { Avatar } from "./Avatar";

type RosterPanelProps = {
    players: PlayerState[];
    activePlayerId: string | null;
    activeDungeonPartyPlayerIds: string[];
    rosterLimit: number;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    onSetActivePlayer: (playerId: string) => void;
    onAddPlayer: () => void;
    getSkillLabel: (skillId: string) => string;
    getRecipeLabel: (skillId: string, recipeId: string) => string;
};

export const RosterPanel = memo(({
    players,
    activePlayerId,
    activeDungeonPartyPlayerIds,
    rosterLimit,
    isCollapsed,
    onToggleCollapsed,
    onSetActivePlayer,
    onAddPlayer,
    getSkillLabel,
    getRecipeLabel
}: RosterPanelProps) => {
    const rosterCount = players.length;
    const canAddPlayer = rosterCount < rosterLimit;
    const activeDungeonPartySet = new Set(activeDungeonPartyPlayerIds);
    const combatLabelBySkillId: Partial<Record<string, string>> = {
        CombatMelee: "Melee",
        CombatRanged: "Ranged",
        CombatMagic: "Magic"
    };

    return (
        <section className="generic-panel ts-panel" data-testid="roster-panel">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Roster</h2>
                    <span className="ts-panel-counter">{rosterCount}/{rosterLimit}</span>
                </div>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className="ts-collapse-button ts-focusable"
                        onClick={onToggleCollapsed}
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <span className="ts-collapse-label">
                            <CollapseIcon isCollapsed={isCollapsed} />
                        </span>
                    </button>
                </div>
            </div>
            {!isCollapsed ? (
                <>
                    <div className="ts-player-list">
                        {players.map((player) => {
                            const isAssignedToDungeon = activeDungeonPartySet.has(player.id);
                            const currentAction = player.selectedActionId;
                            const combatSkillId = getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment));
                            const displaySkillId = isAssignedToDungeon ? combatSkillId : currentAction;
                            const currentSkill = displaySkillId ? player.skills[displaySkillId] : null;
                            const currentRecipe = currentSkill?.selectedRecipeId ?? null;
                            const combatLabel = displaySkillId ? combatLabelBySkillId[displaySkillId] : null;
                            const actionLabel = combatLabel ?? (displaySkillId ? getSkillLabel(displaySkillId) : "");
                            const recipeLabel = displaySkillId && currentRecipe
                                ? getRecipeLabel(displaySkillId, currentRecipe)
                                : null;
                            const metaLabel = isAssignedToDungeon ? "Dungeon run" : (recipeLabel ?? "No recipe");
                            const skillColor = getSkillIconColor(displaySkillId);
                            const skillLevel = displaySkillId ? currentSkill?.level ?? 0 : 0;
                            const isCombatLabel = Boolean(combatLabel);
                            const faceIndex = player.appearance?.faceIndex ?? getFaceIndex(player.id);
                            const hairIndex = player.appearance?.hairIndex ?? getHairIndex(player.id);
                            const hairColor = player.appearance?.hairColor ?? getHairColor(player.id);
                            const skinColor = player.appearance?.skinColor ?? getSkinColor(player.id);
                            const showHelmet = player.appearance?.showHelmet ?? true;
                            const avatarStyle = {
                                "--ts-avatar-torso": skillColor,
                                "--ts-avatar-face": `url("${getFaceUrlByIndex(faceIndex)}")`,
                                "--ts-avatar-hair": `url("${getHairUrlByIndex(hairIndex)}")`,
                                "--ts-avatar-hair-color": hairColor,
                                "--ts-avatar-skin": skinColor,
                                ...getEquipmentSkinVars(player.equipment, { showHelmet })
                            } as CSSProperties;

                            return (
                                <div
                                    key={player.id}
                                    className={`ts-player-card ${player.id === activePlayerId ? "is-active" : ""}`}
                                    onClick={() => onSetActivePlayer(player.id)}
                                    data-testid={`roster-player-${player.id}`}
                                >
                                    <div className="ts-player-main">
                                    <Avatar style={avatarStyle} />
                                        <div className="ts-player-info">
                                            <span className="ts-player-name">{player.name}</span>
                                            <span className="ts-player-meta">{metaLabel}</span>
                                        </div>
                                    </div>
                                    {actionLabel ? (
                                        <div className="ts-player-skill">
                                            <span className="ts-player-skill-icon" aria-hidden="true">
                                                <SkillIcon skillId={displaySkillId ?? ""} color={skillColor} />
                                            </span>
                                            <span className={`ts-player-skill-label${isCombatLabel ? " is-combat" : ""}`}>
                                                {actionLabel}
                                                <span className={`ts-player-skill-badge${isCombatLabel ? " is-combat" : ""}`}>{skillLevel}</span>
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            className={`ts-player-card ts-player-card-add ts-focusable${canAddPlayer ? "" : " is-disabled"}`}
                            onClick={onAddPlayer}
                            disabled={!canAddPlayer}
                            aria-disabled={!canAddPlayer}
                            aria-label="Enlist a new hero"
                            title={!canAddPlayer ? "Roster limit reached" : undefined}
                        >
                            <div className="ts-player-main">
                                <Avatar isPlaceholder />
                                <div className="ts-player-info">
                                    <span className="ts-player-name">Enlist a new hero</span>
                                    <span className="ts-player-meta">Recruit a character</span>
                                </div>
                            </div>
                            <div className="ts-player-skill" aria-hidden="true">
                                <span className="ts-player-skill-label">+</span>
                            </div>
                        </button>
                    </div>
                </>
            ) : null}
        </section>
    );
});

RosterPanel.displayName = "RosterPanel";
