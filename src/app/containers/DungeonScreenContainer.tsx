import { useCallback, useMemo, useState } from "react";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { DUNGEON_DEFINITIONS } from "../../data/dungeons";
import { getActiveDungeonRun } from "../../core/dungeon";
import type { PlayerId } from "../../core/types";
import { DungeonScreen } from "../components/DungeonScreen";
import { computePlayerSkillScore } from "../selectors/gameSelectors";

export const DungeonScreenContainer = () => {
    const players = useGameStore((state) => state.players);
    const activePlayerId = useGameStore((state) => state.activePlayerId);
    const setup = useGameStore((state) => state.dungeon.setup);
    const dungeon = useGameStore((state) => state.dungeon);
    const foodCount = useGameStore((state) => state.inventory.items.food ?? 0);
    const activeRun = useMemo(() => getActiveDungeonRun(dungeon), [dungeon]);
    const playerCount = Object.keys(players).length;
    const canEnterDungeon = playerCount >= 4;
    const [showReplay, setShowReplay] = useState(false);
    const hasPartySelection = setup.selectedPartyPlayerIds.length > 0;
    const currentPower = useMemo(() => {
        const resolvePlayerPower = (playerId: PlayerId) => {
            const player = players[playerId];
            return player ? computePlayerSkillScore(player) : 0;
        };
        if (hasPartySelection) {
            const total = setup.selectedPartyPlayerIds.reduce((sum, playerId) => {
                return sum + resolvePlayerPower(playerId);
            }, 0);
            return Math.max(0, Math.round(total));
        }
        if (activePlayerId && players[activePlayerId]) {
            return Math.max(0, Math.round(resolvePlayerPower(activePlayerId)));
        }
        return 0;
    }, [activePlayerId, hasPartySelection, players, setup.selectedPartyPlayerIds]);

    const handleSelectDungeon = useCallback((dungeonId: string) => {
        gameStore.dispatch({ type: "dungeonSetupSelectDungeon", dungeonId });
    }, []);

    const handleTogglePartyPlayer = useCallback((playerId: PlayerId) => {
        const selected = setup.selectedPartyPlayerIds.includes(playerId);
        const next = selected
            ? setup.selectedPartyPlayerIds.filter((id) => id !== playerId)
            : [...setup.selectedPartyPlayerIds, playerId].slice(0, 4);
        gameStore.dispatch({ type: "dungeonSetupSetParty", playerIds: next });
    }, [setup.selectedPartyPlayerIds]);

    const handleAutoRestartToggle = useCallback((autoRestart: boolean) => {
        gameStore.dispatch({ type: "dungeonSetupSetAutoRestart", autoRestart });
    }, []);

    const handleStartRun = useCallback(() => {
        gameStore.dispatch({
            type: "dungeonStartRun",
            dungeonId: setup.selectedDungeonId,
            playerIds: setup.selectedPartyPlayerIds,
            timestamp: Date.now()
        });
    }, [setup.selectedDungeonId, setup.selectedPartyPlayerIds]);

    const handleStopRun = useCallback(() => {
        gameStore.dispatch({ type: "dungeonStopRun" });
    }, []);

    const handleToggleReplay = useCallback(() => {
        setShowReplay((prev) => !prev);
    }, []);

    return (
        <DungeonScreen
            definitions={DUNGEON_DEFINITIONS}
            players={players}
            selectedDungeonId={setup.selectedDungeonId}
            selectedPartyPlayerIds={setup.selectedPartyPlayerIds}
            canEnterDungeon={canEnterDungeon}
            foodCount={foodCount}
            currentPower={currentPower}
            usesPartyPower={hasPartySelection}
            activeRun={activeRun}
            latestReplay={dungeon.latestReplay}
            completionCounts={dungeon.completionCounts ?? {}}
            showReplay={showReplay}
            onToggleReplay={handleToggleReplay}
            onSelectDungeon={handleSelectDungeon}
            onTogglePartyPlayer={handleTogglePartyPlayer}
            onToggleAutoRestart={handleAutoRestartToggle}
            onStartRun={handleStartRun}
            onStopRun={handleStopRun}
        />
    );
};
