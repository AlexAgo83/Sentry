import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppContainer } from "../../src/app/AppContainer";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import type { GameStore } from "../../src/store/gameStore";

let testStore: GameStore;
let testRuntime: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    simulateOffline: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
};

const cloudMock = {
    status: "idle" as "idle" | "authenticating" | "ready" | "error" | "offline" | "warming",
    error: null as string | null,
    warmupRetrySeconds: null as number | null,
    isBackendAwake: true,
    cloudMeta: null,
    localMeta: {
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        virtualScore: 0,
        appVersion: "0.9.3",
        revision: null
    },
    lastSyncAt: null,
    hasCloudSave: false,
    localHasActiveDungeonRun: false,
    cloudHasActiveDungeonRun: false,
    profile: null as {
        email: string;
        username: string | null;
        maskedEmail: string;
        displayName: string;
    } | null,
    isUpdatingProfile: false,
    isAvailable: true,
    accessToken: null as string | null,
    autoSyncEnabled: false,
    autoSyncStatus: "idle" as const,
    autoSyncConflict: null as { meta: any; message: string } | null,
    authenticate: vi.fn(async () => {}),
    refreshCloud: vi.fn(async () => {}),
    refreshProfile: vi.fn(async () => {}),
    updateUsername: vi.fn(async (): Promise<{ ok: true } | { ok: false; error: string }> => ({ ok: true })),
    loadCloud: vi.fn(async () => true),
    overwriteCloud: vi.fn(async () => {}),
    setAutoSyncEnabled: vi.fn(),
    resolveAutoSyncConflictByLoadingCloud: vi.fn(async () => {}),
    resolveAutoSyncConflictByOverwritingCloud: vi.fn(async () => {}),
    logout: vi.fn(),
    retryWarmupNow: vi.fn()
};

vi.mock("../../src/app/hooks/useCloudSave", () => ({
    useCloudSave: () => cloudMock
}));

vi.mock("../../src/app/game", () => ({
    get gameStore() {
        return testStore;
    },
    get gameRuntime() {
        return testRuntime;
    }
}));

const buildState = () => {
    const state = createInitialGameState("0.9.31", { seedHero: true });
    state.appReady = true;
    state.players["2"] = createPlayerState("2", "Mara");
    // Keep onboarding closed to avoid blocking the prompt.
    state.dungeon.onboardingRequired = false;
    return state;
};

const renderAppContainer = () => {
    Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
    testStore = createGameStore(buildState());
    testRuntime = {
        start: vi.fn(),
        stop: vi.fn(),
        simulateOffline: vi.fn(),
        reset: vi.fn()
    };
    render(<AppContainer />);
};

describe("Startup login prompt", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        cloudMock.status = "idle";
        cloudMock.isBackendAwake = true;
        cloudMock.isAvailable = true;
        cloudMock.accessToken = null;
        cloudMock.error = null;
        cloudMock.updateUsername.mockReset();
        cloudMock.updateUsername.mockResolvedValue({ ok: true });
    });

    it("shows when backend is online and user is logged out, then dismisses for session", async () => {
        renderAppContainer();
        expect(await screen.findByText("Log in to enable cloud backups and sync across devices.")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Not now" }));
        expect(screen.queryByText("Log in to enable cloud backups and sync across devices.")).toBeNull();
    });

    it("does not show when backend is warming", async () => {
        cloudMock.status = "warming";
        renderAppContainer();
        expect(screen.queryByText("Log in to enable cloud backups and sync across devices.")).toBeNull();
    });

    it("persists opt-out when user clicks Don't ask again", async () => {
        renderAppContainer();
        expect(await screen.findByText("Log in to enable cloud backups and sync across devices.")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Don't ask again" }));
        expect(testStore.getState().ui.cloud.loginPromptDisabled).toBe(true);

        // New mount (new session) should not show again.
        render(<AppContainer />);
        expect(screen.queryByText("Log in to enable cloud backups and sync across devices.")).toBeNull();
    });

    it("routes to Cloud Save login when user clicks Log in", async () => {
        renderAppContainer();
        expect(await screen.findByText("Log in to enable cloud backups and sync across devices.")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Log in" }));
        expect(await screen.findByTestId("cloud-login")).toBeTruthy();
        expect(screen.queryByText("Log in to enable cloud backups and sync across devices.")).toBeNull();
    });
});
