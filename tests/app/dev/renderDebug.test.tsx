import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DevProfiler, useRenderCount } from "../../../src/app/dev/renderDebug";

const RenderCountHarness = ({ label }: { label: string }) => {
    useRenderCount(label);
    return <div>ok</div>;
};

describe("renderDebug", () => {
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
        vi.useRealTimers();
        spy.mockRestore();
        window.localStorage.removeItem("sentry.debug.profiler");
    });
});
