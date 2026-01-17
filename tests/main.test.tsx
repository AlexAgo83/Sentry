import React from "react";
import { describe, expect, it, vi } from "vitest";
import { createInitialGameState } from "../src/core/state";
import { createGameStore } from "../src/store/gameStore";

const mockAppModule = () => {
    vi.doMock("../src/app/App", () => ({
        App: () => <div>Mock App</div>
    }));
};

const mockGameModule = (version: string) => {
    const store = createGameStore(createInitialGameState(version));
    const runtime = {
        start: vi.fn(),
        stop: vi.fn(),
        simulateOffline: vi.fn(),
        reset: vi.fn()
    };
    vi.doMock("../src/app/game", () => ({
        gameStore: store,
        gameRuntime: runtime
    }));
    return { store, runtime };
};

describe("main entry", () => {
    it("renders when root exists and registers the service worker", async () => {
        vi.resetModules();
        document.body.innerHTML = "<div id=\"root\"></div>";
        (globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "1.2.3";

        const register = vi.fn().mockResolvedValue({});
        Object.defineProperty(navigator, "serviceWorker", {
            value: { register },
            configurable: true
        });

        mockAppModule();
        mockGameModule("1.2.3");

        await import("../src/main");

        window.dispatchEvent(new Event("load"));
        expect(register).toHaveBeenCalledWith("/sw.js?v=1.2.3");
    });

    it("throws when the root element is missing", async () => {
        vi.resetModules();
        document.body.innerHTML = "";
        mockAppModule();
        mockGameModule("0.4.0");

        await expect(import("../src/main")).rejects.toThrow("Root element not found.");
    });
});
