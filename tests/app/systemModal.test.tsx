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

        expect(screen.getByText("Version: 0.8.0")).toBeTruthy();
        expect(screen.getByText("Active action: none")).toBeTruthy();
        expect(screen.getByText("Last drift: 12ms")).toBeTruthy();
        expect(screen.getByText("Drift EMA: 10ms")).toBeTruthy();

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
                createdAt: Date.now()
            },
            {
                id: "b",
                kind: "unhandledrejection",
                message: "Nope",
                stack: null,
                createdAt: Date.now()
            }
        ];

        render(<SystemModal {...props} />);

        expect(screen.getByText("[error] Boom")).toBeTruthy();
        expect(screen.getByText("[unhandledrejection] Nope")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Clear crash reports" }));
        expect(props.onClearCrashReports).toHaveBeenCalledTimes(1);
    });

    it("renders devtools and toggles localStorage flags", () => {
        const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
        window.localStorage.removeItem("sentry.debug.renderCounts");
        window.localStorage.removeItem("sentry.debug.profiler");

        const props = baseProps();
        render(<SystemModal {...props} />);

        const printButton = screen.getByRole("button", { name: "Print renderCounts" });
        const resetButton = screen.getByRole("button", { name: "Reset renderCounts" });
        expect((printButton as HTMLButtonElement).disabled).toBe(true);
        expect((resetButton as HTMLButtonElement).disabled).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "Toggle renderCounts" }));
        expect(window.localStorage.getItem("sentry.debug.renderCounts")).toBe("1");
        expect((printButton as HTMLButtonElement).disabled).toBe(false);
        expect((resetButton as HTMLButtonElement).disabled).toBe(false);

        fireEvent.click(printButton);
        expect(spy).toHaveBeenCalledWith("[renderCounts]", expect.any(Object));

        fireEvent.click(resetButton);
        expect(spy).toHaveBeenCalledWith("[renderCounts] reset");

        fireEvent.click(screen.getByRole("button", { name: "Toggle profiler" }));
        expect(window.localStorage.getItem("sentry.debug.profiler")).toBe("1");

        spy.mockRestore();
        window.localStorage.removeItem("sentry.debug.renderCounts");
        window.localStorage.removeItem("sentry.debug.profiler");
    });
});
