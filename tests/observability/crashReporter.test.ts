import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    clearCrashReports,
    onCrashReportsUpdated,
    readCrashReports,
    recordCrashReport
} from "../../src/observability/crashReporter";

describe("crashReporter", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("records and reads crash reports", () => {
        recordCrashReport({ kind: "error", message: "boom", appVersion: "1.0.0" });

        const reports = readCrashReports();
        expect(reports.length).toBe(1);
        expect(reports[0].kind).toBe("error");
        expect(reports[0].message).toBe("boom");
        expect(reports[0].appVersion).toBe("1.0.0");
        expect(typeof reports[0].id).toBe("string");
        expect(typeof reports[0].timestamp).toBe("number");
    });

    it("notifies listeners on updates and can clear", () => {
        const handler = vi.fn();
        const unlisten = onCrashReportsUpdated(handler);

        recordCrashReport({ kind: "react", message: "oops" });
        expect(handler).toHaveBeenCalledTimes(1);

        clearCrashReports();
        expect(handler).toHaveBeenCalledTimes(2);
        expect(readCrashReports()).toEqual([]);

        unlisten();
    });
});

