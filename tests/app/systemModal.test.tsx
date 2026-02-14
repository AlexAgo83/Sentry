import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    virtualScore: 128,
    actionJournal: [],
    crashReports: [] as CrashReport[],
    onExportSave: vi.fn().mockResolvedValue("clipboard"),
    onImportSave: vi.fn(),
    onResetSave: vi.fn(),
    onSimulateOffline: vi.fn(),
    onSimulateOfflineHour: vi.fn(),
    onSimulateOfflineDay: vi.fn(),
    onClearCrashReports: vi.fn(),
    onClose: vi.fn()
});

describe("SystemModal", () => {
    beforeEach(() => {
        window.localStorage.removeItem("sentry.graphicsSettings");
    });

    it("navigates modal screens without stacking and closes back to previous", () => {
        const props = baseProps();
        render(<SystemModal {...props} />);

        expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Action journal" }));
        expect(screen.getByRole("heading", { name: "Action journal" })).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "Settings" })).toBeNull();
        expect(screen.getByText("No actions recorded yet.")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Save options" }));
        expect(screen.getByRole("heading", { name: "Save options" })).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "Settings" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Local save" }));
        expect(screen.getByRole("heading", { name: "Local save" })).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "Save options" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Save options" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Cloud save" }));
        expect(screen.getByRole("heading", { name: "Cloud Save" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Save options" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Telemetry" }));
        expect(screen.getByRole("heading", { name: "Telemetry" })).toBeTruthy();
        expect(screen.getByText("Overview")).toBeTruthy();
        expect(screen.getByText("Tick")).toBeTruthy();
        expect(screen.getByText("Drift")).toBeTruthy();
        expect(screen.getByText("Loop")).toBeTruthy();
        expect(screen.getByText("Backend")).toBeTruthy();
        expect(screen.getByText("Last Tick")).toBeTruthy();
        expect(screen.getByText("v0.8.0")).toBeTruthy();
        expect(screen.getByText("Response time")).toBeTruthy();
        expect(screen.getByText("128")).toBeTruthy();
        expect(screen.getByText("250ms")).toBeTruthy();
        expect(screen.getByText("4.20ms")).toBeTruthy();
        expect(screen.getByText("0 ticks / 0ms")).toBeTruthy();
        expect(screen.getByText("1970-01-01T00:00:00.123Z")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Graphics" }));
        expect(screen.getByRole("heading", { name: "Graphics" })).toBeTruthy();
        const smoothToggle = screen.getByRole("checkbox", { name: "Smooth action progress" }) as HTMLInputElement;
        expect(smoothToggle.checked).toBe(true);
        expect(screen.getByText("If disabled, action progress updates once per loop tick.")).toBeTruthy();
        const forceCollapsedToggle = screen.getByRole("checkbox", { name: "Disable character rendering" }) as HTMLInputElement;
        expect(forceCollapsedToggle.checked).toBe(false);
        fireEvent.click(forceCollapsedToggle);
        expect(forceCollapsedToggle.checked).toBe(true);
        expect(smoothToggle.checked).toBe(false);
        expect(smoothToggle.disabled).toBe(true);
        expect(screen.getByText("Keep skin preview panels collapsed on screens.")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();

        const devButton = screen.queryByRole("button", { name: "Dev tools" });
        if (devButton) {
            fireEvent.click(devButton);
            expect(screen.getByRole("heading", { name: "Dev tools" })).toBeTruthy();
            fireEvent.click(screen.getByRole("button", { name: "Back" }));
            expect(screen.getByRole("heading", { name: "Settings" })).toBeTruthy();
        }
    });

    it("opens crash reports modal and clears entries", async () => {
        const props = baseProps();
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText }
        });
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

        fireEvent.click(screen.getByRole("button", { name: "Crash reports" }));
        expect(screen.getByRole("heading", { name: "Crash reports" })).toBeTruthy();
        expect(screen.getByText("[error] Boom")).toBeTruthy();
        expect(screen.getByText("[unhandledrejection] Nope")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Copy crash logs" }));
        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0]?.[0]).toContain("message: Boom");
        expect(writeText.mock.calls[0]?.[0]).toContain("stack:");
        expect(writeText.mock.calls[0]?.[0]).toContain("message: Nope");

        await waitFor(() => {
            expect(screen.getByTestId("crash-copy-feedback")).toBeTruthy();
        });

        fireEvent.click(screen.getByRole("button", { name: "Clear crash reports" }));
        expect(props.onClearCrashReports).toHaveBeenCalledTimes(1);
    });
});
