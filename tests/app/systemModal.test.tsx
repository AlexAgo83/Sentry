import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrashReport } from "../../src/observability/crashReporter";
import { SystemModal } from "../../src/app/components/SystemModal";

const baseProps = () => ({
    version: "0.8.0",
    lastTick: 123,
    lastTickDurationMs: 4.2,
    lastDeltaMs: 250,
    lastDriftMs: 12,
    driftEmaMs: 9.5,
    driftLabel: "0",
    lastOfflineTicks: 0,
    lastOfflineDurationMs: 0,
    tickRate: "4",
    loopInterval: 250,
    offlineInterval: 500,
    activeActionLabel: "none",
    crashReports: [] as CrashReport[],
    onClearCrashReports: vi.fn(),
    onExportSave: vi.fn(),
    onImportSave: vi.fn(),
    onSimulateOffline: vi.fn(),
    onResetSave: vi.fn(),
    onClose: vi.fn()
});

describe("SystemModal", () => {
    it("renders telemetry and system actions", () => {
        const props = baseProps();
        render(<SystemModal {...props} />);

        expect(screen.getByText("v0.8.0 • Action: none • Crashes: 0")).toBeTruthy();
        expect(screen.getByText("Tick: Δ250ms • tick 4.20ms • drift 0ms (last +12ms, ema 9.5ms)")).toBeTruthy();
        expect(screen.getByText("Loop: 250ms (4/s) • Offline: 500ms • Catch-up: 0 / 0ms")).toBeTruthy();
        expect(screen.getByText(/Last tick:/)).toBeTruthy();
        expect(screen.getByText("1970-01-01T00:00:00.123Z")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Simulate +30 min" }));
        expect(props.onSimulateOffline).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "Export save" }));
        expect(props.onExportSave).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "Import save" }));
        expect(props.onImportSave).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole("button", { name: "Reset save" }));
        expect(props.onResetSave).toHaveBeenCalledTimes(1);
    });

    it("shows crash report preview and clears", () => {
        const props = baseProps();
        props.crashReports = [
            {
                id: "a",
                kind: "error",
                message: "Boom",
                stack: "stack",
                timestamp: Date.now()
            },
            {
                id: "b",
                kind: "unhandledrejection",
                message: "Nope",
                timestamp: Date.now()
            }
        ];

        render(<SystemModal {...props} />);

        expect(screen.getByText("[error] Boom")).toBeTruthy();
        expect(screen.getByText("[unhandledrejection] Nope")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Clear crash reports" }));
        expect(props.onClearCrashReports).toHaveBeenCalledTimes(1);
    });
});
