import { useCallback, useEffect, useState } from "react";
import { clearCrashReports, onCrashReportsUpdated, readCrashReports } from "../../observability/crashReporter";

export const useCrashReportsState = () => {
    const [crashReports, setCrashReports] = useState(() => readCrashReports());

    useEffect(() => {
        return onCrashReportsUpdated(() => {
            setCrashReports(readCrashReports());
        });
    }, []);

    const handleClearCrashReports = useCallback(() => {
        clearCrashReports();
        setCrashReports([]);
    }, []);

    return { crashReports, clearCrashReports: handleClearCrashReports };
};
