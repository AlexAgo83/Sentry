import { beforeEach, describe, expect, it } from "vitest";
import {
    clearCrashReports,
    installGlobalCrashHandlers,
    readCrashReports,
    recordCrashReport
} from "../../src/observability/crashReporter";

describe("crashReporter (more)", () => {
    beforeEach(() => {
        window.localStorage.clear();
        clearCrashReports();
    });

    it("caps stored crash reports to 10", () => {
        for (let i = 0; i < 15; i += 1) {
            recordCrashReport({ kind: "error", message: `boom-${i}` });
        }
        const reports = readCrashReports();
        expect(reports).toHaveLength(10);
        expect(reports[0].message).toBe("boom-14");
        expect(reports[9].message).toBe("boom-5");
    });

    it("treats invalid stored data as empty", () => {
        window.localStorage.setItem("sentry.crashReports", "not-json");
        expect(readCrashReports()).toEqual([]);
        window.localStorage.setItem("sentry.crashReports", JSON.stringify({ nope: true }));
        expect(readCrashReports()).toEqual([]);
    });

    it("captures window error and unhandledrejection events", () => {
        const uninstall = installGlobalCrashHandlers({ appVersion: "1.2.3" });

        const error = new Error("boom");
        const errorEvent = new Event("error") as unknown as ErrorEvent;
        (errorEvent as unknown as { message?: string }).message = "boom";
        (errorEvent as unknown as { filename?: string }).filename = "test.js";
        (errorEvent as unknown as { error?: unknown }).error = error;
        window.dispatchEvent(errorEvent as unknown as Event);

        const rejectionEvent = new Event("unhandledrejection") as unknown as PromiseRejectionEvent;
        (rejectionEvent as unknown as { reason?: unknown }).reason = { message: "nope", stack: "stack" };
        window.dispatchEvent(rejectionEvent as unknown as Event);

        const reports = readCrashReports();
        expect(reports.length).toBeGreaterThanOrEqual(2);

        const rejection = reports.find((report) => report.kind === "unhandledrejection" && report.message === "nope");
        expect(rejection).toBeDefined();
        expect(rejection?.appVersion).toBe("1.2.3");

        const errorReport = reports.find((report) => report.kind === "error" && report.url === "test.js");
        expect(errorReport).toBeDefined();

        uninstall();
    });
});
