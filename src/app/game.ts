import { createLocalStorageAdapter } from "../adapters/persistence/localStorageAdapter";
import { createInitialGameState } from "../core/state";
import { GameRuntime } from "../core/runtime";
import { createGameStore } from "../store/gameStore";

declare const __APP_VERSION__: string;

const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.3.0";

export const gameStore = createGameStore(createInitialGameState(version));
export const gameRuntime = new GameRuntime(gameStore, createLocalStorageAdapter(), version);
