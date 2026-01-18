import React from "react";
import { describe, expect, it, vi } from "vitest";
import { createInitialGameState } from "../src/core/state";
import { createGameStore } from "../src/store/gameStore";

const mockAppModule = () => {
    vi.doMock("../src/app/App", () => ({
        App: () => <div>Mock App</div>
    }));
};

const mockServiceWorkerModule = (registerImpl?: ReturnType<typeof vi.fn>) => {
    const registerServiceWorker = registerImpl ?? vi.fn().mockResolvedValue({});
    vi.doMock("../src/pwa/serviceWorker", () => ({
        registerServiceWorker
    }));
    return { registerServiceWorker };
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

        Object.defineProperty(navigator, "serviceWorker", {
            value: {},
            configurable: true
        });

        mockAppModule();
        mockGameModule("1.2.3");
        const { registerServiceWorker } = mockServiceWorkerModule();

        await import("../src/main");

        window.dispatchEvent(new Event("load"));
        expect(registerServiceWorker).toHaveBeenCalledWith("1.2.3");
    });

    it("registers the service worker with a dev version when __APP_VERSION__ is undefined", async () => {
        vi.resetModules();
        document.body.innerHTML = "<div id=\"root\"></div>";
        delete (globalThis as { __APP_VERSION__?: string }).__APP_VERSION__;

        Object.defineProperty(navigator, "serviceWorker", {
            value: {},
            configurable: true
        });

        mockAppModule();
        mockGameModule("0.4.0");
        const { registerServiceWorker } = mockServiceWorkerModule();

        await import("../src/main");

        window.dispatchEvent(new Event("load"));
        expect(registerServiceWorker).toHaveBeenCalledWith("dev");
    });

    it("logs a warning when service worker registration fails", async () => {
        vi.resetModules();
        document.body.innerHTML = "<div id=\"root\"></div>";
        (globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "1.2.3";

        const error = new Error("boom");
        Object.defineProperty(navigator, "serviceWorker", {
            value: {},
            configurable: true
        });

        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        mockAppModule();
        mockGameModule("1.2.3");
        const { registerServiceWorker } = mockServiceWorkerModule(vi.fn().mockRejectedValue(error));

        await import("../src/main");

        window.dispatchEvent(new Event("load"));
        await Promise.resolve();
        await Promise.resolve();

        expect(registerServiceWorker).toHaveBeenCalledWith("1.2.3");
        expect(consoleError).toHaveBeenCalledWith("Service worker registration failed", error);
    });

    it("throws when the root element is missing", async () => {
        vi.resetModules();
        document.body.innerHTML = "";
        mockAppModule();
        mockGameModule("0.4.0");
        mockServiceWorkerModule();

        await expect(import("../src/main")).rejects.toThrow("Root element not found.");
    });
});
