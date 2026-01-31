import { memo } from "react";
import type { CSSProperties } from "react";
import type { PlayerState } from "../../core/types";
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

    return (
        <section className="generic-panel ts-panel">
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
                            const currentAction = player.selectedActionId;
                            const currentSkill = currentAction ? player.skills[currentAction] : null;
                            const currentRecipe = currentSkill?.selectedRecipeId ?? null;
                            const actionLabel = currentAction ? getSkillLabel(currentAction) : "";
                            const recipeLabel = currentAction && currentRecipe
                                ? getRecipeLabel(currentAction, currentRecipe)
                                : null;
                            const metaLabel = recipeLabel ?? "No recipe";
                            const skillColor = getSkillIconColor(currentAction);
                            const skillLevel = currentAction ? currentSkill?.level ?? 0 : 0;
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
                                                <SkillIcon skillId={currentAction ?? ""} color={skillColor} />
                                            </span>
                                            <span className="ts-player-skill-label">
                                                {actionLabel}
                                                <span className="ts-player-skill-badge">{skillLevel}</span>
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
