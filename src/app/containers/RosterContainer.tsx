import { useMemo } from "react";
import type { SkillId } from "../../core/types";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { selectPlayersSortedFromPlayers } from "../selectors/gameSelectors";
import { RosterPanel } from "../components/RosterPanel";

type RosterContainerProps = {
    onAddPlayer: () => void;
    getSkillLabel: (skillId: SkillId) => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string) => string;
};

export const RosterContainer = ({
    onAddPlayer,
    getSkillLabel,
    getRecipeLabel,
}: RosterContainerProps) => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("roster", false);
    const activePlayerId = useGameStore((state) => state.activePlayerId);
    const playersById = useGameStore((state) => state.players);
    const players = useMemo(() => selectPlayersSortedFromPlayers(playersById), [playersById]);

    return (
        <RosterPanel
            players={players}
            activePlayerId={activePlayerId}
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            onSetActivePlayer={(playerId) => gameStore.dispatch({ type: "setActivePlayer", playerId })}
            onAddPlayer={onAddPlayer}
            getSkillLabel={(skillId) => getSkillLabel(skillId as SkillId)}
            getRecipeLabel={(skillId, recipeId) => getRecipeLabel(skillId as SkillId, recipeId)}
        />
    );
};
