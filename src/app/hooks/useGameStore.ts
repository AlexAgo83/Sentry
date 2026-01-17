import { useSyncExternalStore } from "react";
import { gameStore } from "../game";
import { GameState } from "../../core/types";

export const useGameStore = <T>(selector: (state: GameState) => T): T => {
    return useSyncExternalStore(
        gameStore.subscribe,
        () => selector(gameStore.getState()),
        () => selector(gameStore.getState())
    );
};
