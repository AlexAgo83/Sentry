import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DevProfiler, getRenderCountsSnapshot, resetRenderCounts, useRenderCount } from "../../../src/app/dev/renderDebug";

const RenderCountHarness = ({ label }: { label: string }) => {
    useRenderCount(label);
    return <div>ok</div>;
};

describe("renderDebug", () => {
    afterEach(() => {
        window.localStorage.removeItem("sentry.debug.profiler");
        window.localStorage.removeItem("sentry.debug.renderCounts");
        resetRenderCounts();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("DevProfiler renders children (disabled by default)", () => {
        render(
            <DevProfiler id="Test">
                <div data-testid="child">child</div>
            </DevProfiler>
        );
        expect(screen.getByTestId("child").textContent).toBe("child");
    });

    it("useRenderCount does not crash", () => {
        render(<RenderCountHarness label="X" />);
        expect(screen.getByText("ok")).toBeTruthy();
    });

    it("DevProfiler logs when enabled", () => {
        vi.useFakeTimers();
        const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
        window.localStorage.setItem("sentry.debug.profiler", "1");

        render(
            <DevProfiler id="Profiled" thresholdMs={0}>
                <div data-testid="child">child</div>
            </DevProfiler>
        );

        vi.runOnlyPendingTimers();
        expect(spy).toHaveBeenCalled();
    });

    it("useRenderCount logs deltas periodically when enabled", () => {
        vi.useFakeTimers();
        const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
        window.localStorage.setItem("sentry.debug.renderCounts", "1");
        resetRenderCounts();

        const { rerender } = render(<RenderCountHarness label="Counts" />);
        rerender(<RenderCountHarness label="Counts" />);
        rerender(<RenderCountHarness label="Counts" />);

        vi.advanceTimersByTime(1000);
        expect(spy).toHaveBeenCalledWith("[renderCounts] (+1s)", expect.objectContaining({ Counts: 3 }));

        const snapshot = getRenderCountsSnapshot();
        expect(snapshot.Counts).toBe(3);

        window.localStorage.removeItem("sentry.debug.renderCounts");
        const callsBefore = spy.mock.calls.length;
        vi.advanceTimersByTime(2000);
        expect(spy.mock.calls.length).toBe(callsBefore);
    });

    it("DevProfiler aggregates commits into a periodic summary", () => {
        vi.useFakeTimers();
        const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
        window.localStorage.setItem("sentry.debug.profiler", "1");

        const { unmount } = render(
            <DevProfiler id="Aggregated" thresholdMs={0}>
                <div data-testid="child">child</div>
            </DevProfiler>
        );

        vi.advanceTimersByTime(1000);
        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining("[profiler]"),
            expect.any(Array)
        );

        window.localStorage.removeItem("sentry.debug.profiler");
        const callsBefore = spy.mock.calls.length;
        vi.advanceTimersByTime(2000);
        expect(spy.mock.calls.length).toBe(callsBefore);

        unmount();
    });
});
