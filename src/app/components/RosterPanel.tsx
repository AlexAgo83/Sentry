import { memo } from "react";
import type { PlayerState } from "../../core/types";

type RosterPanelProps = {
    players: PlayerState[];
    activePlayerId: string | null;
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    onSetActivePlayer: (playerId: string) => void;
    onOpenLoadout: (playerId: string) => void;
    onOpenRename: (playerId: string) => void;
    onAddPlayer: () => void;
    onOpenInventory: () => void;
    onOpenSystem: () => void;
    getSkillLabel: (skillId: string) => string;
    getRecipeLabel: (skillId: string, recipeId: string) => string;
};

export const RosterPanel = memo(({
    players,
    activePlayerId,
    isCollapsed,
    onToggleCollapsed,
    onSetActivePlayer,
    onOpenLoadout,
    onOpenRename,
    onAddPlayer,
    onOpenInventory,
    onOpenSystem,
    getSkillLabel,
    getRecipeLabel
}: RosterPanelProps) => {
    return (
        <section className="generic-panel ts-panel">
            <div className="ts-panel-header">
                <h2 className="ts-panel-title">Roster</h2>
                <span className="ts-panel-meta">{players.length} heroes</span>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onToggleCollapsed}
                    data-mobile-label={isCollapsed ? "+" : "-"}
                    aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
                >
                    <span className="ts-collapse-label">
                        {isCollapsed ? "Expand" : "Collapse"}
                    </span>
                </button>
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
                            const metaLabel = currentAction
                                ? `Action ${actionLabel}${recipeLabel ? ` - Recipe ${recipeLabel}` : " - Recipe none"}`
                                : "No action selected";

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
                                    <div className="ts-player-actions">
                                        <button
                                            type="button"
                                            className="ts-icon-button is-action ts-focusable"
                                            onClick={() => onOpenLoadout(player.id)}
                                            aria-label={`Manage actions for ${player.name}`}
                                            title="Manage actions"
                                        >
                                            Act
                                        </button>
                                        <button
                                            type="button"
                                            className="ts-icon-button ts-focusable"
                                            onClick={() => onOpenRename(player.id)}
                                            aria-label={`Set name for ${player.name}`}
                                            title="Set name"
                                        >
                                            Set
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        className="generic-field button ts-add-player ts-focusable"
                        onClick={onAddPlayer}
                    >
                        Recruit new hero
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-add-player ts-inventory-toggle ts-focusable"
                        onClick={onOpenInventory}
                    >
                        Inventory
                    </button>
                    <button
                        type="button"
                        className="generic-field button ts-add-player ts-system-toggle ts-focusable"
                        onClick={onOpenSystem}
                    >
                        System
                    </button>
                </>
            ) : null}
        </section>
    );
});

RosterPanel.displayName = "RosterPanel";
