import { useCallback, useEffect, useState } from "react";
import { clearCrashReports, onCrashReportsUpdated, readCrashReports } from "../../observability/crashReporter";

export const useCrashReportsState = () => {
    const [crashReports, setCrashReports] = useState(() => readCrashReports());

    useEffect(() => {
        const handleUpdate = () => {
            setCrashReports(readCrashReports());
        };
        const unsubscribe = onCrashReportsUpdated(handleUpdate);
        // Catch any reports recorded before the listener was attached.
        handleUpdate();
        return unsubscribe;
    }, []);

    const handleClearCrashReports = useCallback(() => {
        clearCrashReports();
        setCrashReports([]);
    }, []);

    return { crashReports, clearCrashReports: handleClearCrashReports };
};
