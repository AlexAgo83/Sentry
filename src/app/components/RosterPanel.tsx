import { memo } from "react";
import type { PlayerState } from "../../core/types";
import { getSkillIconColor } from "../ui/skillColors";
import { SkillIcon } from "../ui/skillIcons";
import { CollapseIcon } from "../ui/collapseIcon";

type RosterPanelProps = {
    players: PlayerState[];
    activePlayerId: string | null;
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
    isCollapsed,
    onToggleCollapsed,
    onSetActivePlayer,
    onAddPlayer,
    getSkillLabel,
    getRecipeLabel
}: RosterPanelProps) => {
    return (
        <section className="generic-panel ts-panel">
            <div className="ts-panel-header">
                <h2 className="ts-panel-title">Roster</h2>
                <div className="ts-panel-actions ts-panel-actions-inline">
                    <button
                        type="button"
                        className="ts-icon-button ts-panel-action-button ts-focusable"
                        onClick={onAddPlayer}
                    >
                        NEW
                    </button>
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

                            return (
                                <div
                                    key={player.id}
                                    className={`ts-player-card ${player.id === activePlayerId ? "is-active" : ""}`}
                                    onClick={() => onSetActivePlayer(player.id)}
                                >
                                    <div className="ts-player-info">
                                        <span className="ts-player-name">{player.name}</span>
                                        <span className="ts-player-meta">{metaLabel}</span>
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
                    </div>
                </>
            ) : null}
        </section>
    );
});

RosterPanel.displayName = "RosterPanel";
