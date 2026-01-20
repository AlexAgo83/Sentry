import { useRef, useSyncExternalStore } from "react";
import { gameStore } from "../game";
import { GameState } from "../../core/types";

export const useGameStore = <T>(
    selector: (state: GameState) => T,
    isEqual: (a: T, b: T) => boolean = Object.is
): T => {
    const hasSelectionRef = useRef(false);
    const selectionRef = useRef<T | null>(null);

    const getSnapshot = () => {
        const nextSelection = selector(gameStore.getState());
        if (hasSelectionRef.current) {
            const previous = selectionRef.current as T;
            if (isEqual(previous, nextSelection)) {
                return previous;
            }
        }
        hasSelectionRef.current = true;
        selectionRef.current = nextSelection as unknown as T;
        return nextSelection;
    };

    return useSyncExternalStore(gameStore.subscribe, getSnapshot, getSnapshot);
};
