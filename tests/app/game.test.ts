import { describe, expect, it, vi } from "vitest";

const loadGameModule = async () => {
    const module = await import("../../src/app/game");
    return module;
};

describe("app game module", () => {
    it("uses __APP_VERSION__ when provided", async () => {
        vi.resetModules();
        (globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "9.9.9";

        const { gameStore, gameRuntime } = await loadGameModule();

        expect(gameStore.getState().version).toBe("9.9.9");
        expect(gameRuntime).toBeTruthy();
    });

    it("falls back to default version when __APP_VERSION__ is missing", async () => {
        vi.resetModules();
        delete (globalThis as { __APP_VERSION__?: string }).__APP_VERSION__;

        const { gameStore } = await loadGameModule();

        expect(gameStore.getState().version).toBe("0.3.0");
    });
});
