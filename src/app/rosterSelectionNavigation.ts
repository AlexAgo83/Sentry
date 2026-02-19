import { getActiveDungeonRuns } from "../core/dungeon";
import type { DungeonState } from "../core/types";
import type { AppActiveScreen } from "./AppView";

type ResolveRosterSelectionDungeonNavigationInput = {
    activeScreen: AppActiveScreen;
    selectedPlayerId: string;
    dungeon: DungeonState;
};

type ResolveRosterSelectionDungeonNavigationResult = {
    nextActiveRunId: string | null;
    shouldExitDungeonToAction: boolean;
};

type ResolveDungeonRunForPlayerInput = {
    playerId: string | null;
    dungeon: DungeonState;
};

export const resolveActiveDungeonRunIdForPlayer = ({
    playerId,
    dungeon
}: ResolveDungeonRunForPlayerInput): string | null => {
    if (!playerId) {
        return null;
    }

    return getActiveDungeonRuns(dungeon).find((run) => (
        run.party.some((member) => member.playerId === playerId)
    ))?.id ?? null;
};

export const resolveRosterSelectionDungeonNavigation = ({
    activeScreen,
    selectedPlayerId,
    dungeon
}: ResolveRosterSelectionDungeonNavigationInput): ResolveRosterSelectionDungeonNavigationResult => {
    if (activeScreen !== "dungeon") {
        return {
            nextActiveRunId: null,
            shouldExitDungeonToAction: false
        };
    }

    const runForPlayerId = resolveActiveDungeonRunIdForPlayer({
        playerId: selectedPlayerId,
        dungeon
    });

    if (runForPlayerId) {
        return {
            nextActiveRunId: runForPlayerId !== dungeon.activeRunId ? runForPlayerId : null,
            shouldExitDungeonToAction: false
        };
    }

    return {
        nextActiveRunId: null,
        shouldExitDungeonToAction: true
    };
};
