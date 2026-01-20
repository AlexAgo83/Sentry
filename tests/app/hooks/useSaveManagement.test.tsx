import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { useSaveManagement } from "../../../src/app/hooks/useSaveManagement";
import { createGameStore } from "../../../src/store/gameStore";
import { createInitialGameState } from "../../../src/core/state";
import type { GameStore } from "../../../src/store/gameStore";

let testStore: GameStore;
let testRuntime: {
    reset: ReturnType<typeof vi.fn>;
    importSave: ReturnType<typeof vi.fn>;
};

const parseSpy = vi.fn();
const readRawSaveSpy = vi.fn();
const readRawLastGoodSaveSpy = vi.fn();

vi.mock("../../../src/app/game", () => ({
    get gameStore() {
        return testStore;
    },
    get gameRuntime() {
        return testRuntime;
    }
}));

vi.mock("../../../src/adapters/persistence/saveEnvelope", async () => {
    const actual = await vi.importActual<typeof import("../../../src/adapters/persistence/saveEnvelope")>(
        "../../../src/adapters/persistence/saveEnvelope"
    );
    return {
        ...actual,
        parseSaveEnvelopeOrLegacy: (...args: unknown[]) => parseSpy(...args),
    };
});

vi.mock("../../../src/adapters/persistence/localStorageKeys", () => ({
    readRawSave: () => readRawSaveSpy(),
    readRawLastGoodSave: () => readRawLastGoodSaveSpy(),
}));

type UseSaveManagementOptions = {
    isSafeModeOpen: boolean;
    closeActionSelection: () => void;
    closeAllHeroNameModals: () => void;
    refreshLoadReport: () => void;
    closeSafeMode: () => void;
};

type SaveManagementApi = {
    closeOfflineSummary: () => void;
    resetSave: () => void;
    exportSave: () => void;
    importSave: () => void;
    canCopyCurrentRawSave: boolean;
    canCopyLastGoodRawSave: boolean;
    copyCurrentRawSave: () => void;
    copyLastGoodRawSave: () => void;
};

const TestHarness = (props: {
    onReady: (api: SaveManagementApi) => void;
    options: UseSaveManagementOptions;
}) => {
    const api = useSaveManagement(props.options);
    useEffect(() => {
        props.onReady(api);
    }, [api, props]);
    return null;
};

describe("useSaveManagement", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        parseSpy.mockReset();
        readRawSaveSpy.mockReset();
        readRawLastGoodSaveSpy.mockReset();

        Object.defineProperty(navigator, "clipboard", {
            value: undefined,
            configurable: true,
        });

        testStore = createGameStore(createInitialGameState("0.8.3"));
        testRuntime = {
            reset: vi.fn(),
            importSave: vi.fn(),
        };
    });

    it("resetSave does nothing when confirm is cancelled", async () => {
        const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
        const closeActionSelection = vi.fn();
        const closeAllHeroNameModals = vi.fn();
        const refreshLoadReport = vi.fn();
        const closeSafeMode = vi.fn();

        let api: SaveManagementApi | null = null;
        render(
            <TestHarness
                options={{
                    isSafeModeOpen: false,
                    closeActionSelection,
                    closeAllHeroNameModals,
                    refreshLoadReport,
                    closeSafeMode,
                }}
                onReady={(next) => { api = next; }}
            />
        );

        await waitFor(() => {
            expect(api).not.toBeNull();
        });

        (api as unknown as SaveManagementApi).resetSave();
        expect(confirm).toHaveBeenCalledTimes(1);
        expect(closeActionSelection).not.toHaveBeenCalled();
        expect(closeAllHeroNameModals).not.toHaveBeenCalled();
        expect(testRuntime.reset).not.toHaveBeenCalled();
        expect(closeSafeMode).not.toHaveBeenCalled();
        expect(refreshLoadReport).not.toHaveBeenCalled();
    });

    it("resetSave closes overlays and refreshes when confirmed", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const closeActionSelection = vi.fn();
        const closeAllHeroNameModals = vi.fn();
        const refreshLoadReport = vi.fn();
        const closeSafeMode = vi.fn();
        const dispatchSpy = vi.spyOn(testStore, "dispatch");

        let api: SaveManagementApi | null = null;
        render(
            <TestHarness
                options={{
                    isSafeModeOpen: true,
                    closeActionSelection,
                    closeAllHeroNameModals,
                    refreshLoadReport,
                    closeSafeMode,
                }}
                onReady={(next) => { api = next; }}
            />
        );

        await waitFor(() => {
            expect(api).not.toBeNull();
        });

        (api as unknown as SaveManagementApi).resetSave();
        expect(closeActionSelection).toHaveBeenCalledTimes(1);
        expect(closeAllHeroNameModals).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith({ type: "setOfflineSummary", summary: null });
        expect(testRuntime.reset).toHaveBeenCalledTimes(1);
        expect(closeSafeMode).toHaveBeenCalledTimes(1);
        expect(refreshLoadReport).toHaveBeenCalledTimes(1);
    });

    it("exportSave prefers clipboard and falls back to prompt when clipboard rejects", async () => {
        const prompt = vi.spyOn(window, "prompt").mockReturnValue(null);
        const writeText = vi.fn().mockRejectedValue(new Error("nope"));
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText },
            configurable: true
        });

        let api: SaveManagementApi | null = null;
        render(
            <TestHarness
                options={{
                    isSafeModeOpen: false,
                    closeActionSelection: vi.fn(),
                    closeAllHeroNameModals: vi.fn(),
                    refreshLoadReport: vi.fn(),
                    closeSafeMode: vi.fn(),
                }}
                onReady={(next) => { api = next; }}
            />
        );

        await waitFor(() => {
            expect(api).not.toBeNull();
        });

        (api as unknown as SaveManagementApi).exportSave();
        expect(writeText).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(prompt).toHaveBeenCalledTimes(1);
        });
    });

    it("importSave validates prompt and imports when parse succeeds", async () => {
        const prompt = vi.spyOn(window, "prompt").mockReturnValue("{\"fake\":true}");
        const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
        const refreshLoadReport = vi.fn();
        parseSpy.mockReturnValue({ status: "ok", save: { version: "0.1.0", players: {}, lastTick: null } });

        let api: SaveManagementApi | null = null;
        render(
            <TestHarness
                options={{
                    isSafeModeOpen: false,
                    closeActionSelection: vi.fn(),
                    closeAllHeroNameModals: vi.fn(),
                    refreshLoadReport,
                    closeSafeMode: vi.fn(),
                }}
                onReady={(next) => { api = next; }}
            />
        );

        await waitFor(() => {
            expect(api).not.toBeNull();
        });

        (api as unknown as SaveManagementApi).importSave();
        expect(prompt).toHaveBeenCalledTimes(1);
        expect(alert).not.toHaveBeenCalled();
        expect(testRuntime.importSave).toHaveBeenCalledTimes(1);
        expect(refreshLoadReport).toHaveBeenCalledTimes(1);
    });

    it("raw save copy handlers alert when no raw saves exist", async () => {
        const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
        readRawSaveSpy.mockReturnValue(null);
        readRawLastGoodSaveSpy.mockReturnValue(null);

        let api: SaveManagementApi | null = null;
        render(
            <TestHarness
                options={{
                    isSafeModeOpen: true,
                    closeActionSelection: vi.fn(),
                    closeAllHeroNameModals: vi.fn(),
                    refreshLoadReport: vi.fn(),
                    closeSafeMode: vi.fn(),
                }}
                onReady={(next) => { api = next; }}
            />
        );

        await waitFor(() => {
            expect(api).not.toBeNull();
        });

        expect((api as unknown as SaveManagementApi).canCopyCurrentRawSave).toBe(false);
        expect((api as unknown as SaveManagementApi).canCopyLastGoodRawSave).toBe(false);

        (api as unknown as SaveManagementApi).copyCurrentRawSave();
        (api as unknown as SaveManagementApi).copyLastGoodRawSave();
        expect(alert).toHaveBeenCalledWith("No current save found.");
        expect(alert).toHaveBeenCalledWith("No last good save found.");
    });
});
