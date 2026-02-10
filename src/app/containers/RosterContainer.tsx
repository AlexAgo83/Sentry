import { useMemo } from "react";
import type { SkillId } from "../../core/types";
import { getActiveDungeonRuns } from "../../core/dungeon";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectPlayersSortedFromPlayers } from "../selectors/gameSelectors";
import { RosterPanel } from "../components/RosterPanel";

type RosterContainerProps = {
    onAddPlayer: () => void;
    onAfterSetActivePlayer?: () => void;
    forceExpanded?: boolean;
    onOpenSystem: () => void;
    showSettingsButton?: boolean;
    getSkillLabel: (skillId: SkillId) => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string) => string;
};

export const RosterContainer = ({
    onAddPlayer,
    onAfterSetActivePlayer,
    forceExpanded = false,
    onOpenSystem,
    showSettingsButton = false,
    getSkillLabel,
    getRecipeLabel,
}: RosterContainerProps) => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("roster", false);
    const activePlayerId = useGameStore((state) => state.activePlayerId);
    const playersById = useGameStore((state) => state.players);
    const rosterOrder = useGameStore((state) => state.rosterOrder);
    const rosterLimit = useGameStore((state) => state.rosterLimit);
    const dungeon = useGameStore((state) => state.dungeon);
    const players = useMemo(
        () => selectPlayersSortedFromPlayers(playersById, rosterOrder),
        [playersById, rosterOrder]
    );
    const activeDungeonPartyPlayerIds = useMemo(() => (
        getActiveDungeonRuns(dungeon).flatMap((run) => run.party.map((member) => member.playerId))
    ), [dungeon]);

    const rosterCollapsed = forceExpanded ? false : isCollapsed;
    const handleToggleCollapsed = forceExpanded
        ? () => {}
        : () => setCollapsed((value) => !value);
    const showCollapseButton = !forceExpanded;
    const resolvedShowSettingsButton = Boolean(showSettingsButton);

    return (
        <RosterPanel
            players={players}
            activePlayerId={activePlayerId}
            activeDungeonPartyPlayerIds={activeDungeonPartyPlayerIds}
            rosterLimit={rosterLimit}
            isCollapsed={rosterCollapsed}
            showCollapseButton={showCollapseButton}
            showSettingsButton={resolvedShowSettingsButton}
            onToggleCollapsed={handleToggleCollapsed}
            onSetActivePlayer={(playerId) => {
                gameStore.dispatch({ type: "setActivePlayer", playerId });
                onAfterSetActivePlayer?.();
            }}
            onReorderPlayer={(playerId, targetIndex) => {
                gameStore.dispatch({ type: "reorderRoster", playerId, targetIndex });
            }}
            onAddPlayer={onAddPlayer}
            onOpenSystem={onOpenSystem}
            getSkillLabel={(skillId) => getSkillLabel(skillId as SkillId)}
            getRecipeLabel={(skillId, recipeId) => getRecipeLabel(skillId as SkillId, recipeId)}
        />
    );
};
