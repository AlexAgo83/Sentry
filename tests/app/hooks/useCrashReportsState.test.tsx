import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEffect } from "react";
import { recordCrashReport } from "../../../src/observability/crashReporter";
import { useCrashReportsState } from "../../../src/app/hooks/useCrashReportsState";

const TestHarness = (props: { onCount: (count: number) => void }) => {
    const { crashReports } = useCrashReportsState();
    useEffect(() => {
        props.onCount(crashReports.length);
    }, [crashReports.length, props]);
    return <div data-testid="count">{crashReports.length}</div>;
};

describe("useCrashReportsState", () => {
    it("updates count when a report is recorded", async () => {
        let count = 0;
        render(<TestHarness onCount={(next) => { count = next; }} />);

        const initialCount = Number(screen.getByTestId("count").textContent ?? "0");
        recordCrashReport({ kind: "react", message: "oops" });
        await waitFor(() => {
            const nextCount = Number(screen.getByTestId("count").textContent ?? "0");
            expect(nextCount).toBe(initialCount + 1);
        });
        expect(count).toBe(initialCount + 1);
    });
});
