import { createLocalStorageAdapter } from "../adapters/persistence/localStorageAdapter";
import { createInitialGameState } from "../core/state";
import { toGameSave } from "../core/serialization";
import type { ItemId } from "../core/types";
import { GameRuntime } from "../core/runtime";
import { createGameStore } from "../store/gameStore";

declare const __APP_VERSION__: string;

const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.3.0";

export const gameStore = createGameStore(createInitialGameState(version, { seedHero: false }));
export const gameRuntime = new GameRuntime(gameStore, createLocalStorageAdapter(), version);

if (import.meta.env.VITE_E2E && typeof window !== "undefined") {
    (window as unknown as { __E2E__?: Record<string, unknown> }).__E2E__ = {
        addInventoryItem: (itemId: ItemId, count: number) => {
            gameStore.dispatch({ type: "debugAddItem", itemId, count });
        },
        getSavePayload: () => toGameSave(gameStore.getState())
    };
}
