import { gameReducer, GameAction } from "../core/reducer";
import { GameState } from "../core/types";

export type StoreListener = () => void;

export interface GameStore {
    getState: () => GameState;
    dispatch: (action: GameAction) => void;
    subscribe: (listener: StoreListener) => () => void;
}

export const createGameStore = (initialState: GameState): GameStore => {
    let state = initialState;
    const listeners = new Set<StoreListener>();

    return {
        getState: () => state,
        dispatch: (action) => {
            state = gameReducer(state, action);
            listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
};
