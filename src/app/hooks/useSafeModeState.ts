import { useCallback, useEffect, useState } from "react";
import { getPersistenceLoadReport, type PersistenceLoadReport } from "../../adapters/persistence/loadReport";

export const useSafeModeState = () => {
    const [loadReport, setLoadReport] = useState<PersistenceLoadReport>(() => getPersistenceLoadReport());
    const [isSafeModeOpen, setSafeModeOpen] = useState(false);

    const refreshLoadReport = useCallback(() => {
        setLoadReport(getPersistenceLoadReport());
    }, []);

    const closeSafeMode = useCallback(() => {
        setSafeModeOpen(false);
    }, []);

    useEffect(() => {
        if (loadReport.status === "empty" || loadReport.status === "ok") {
            return;
        }
        setSafeModeOpen(true);
    }, [loadReport.status]);

    return {
        loadReport,
        isSafeModeOpen,
        refreshLoadReport,
        closeSafeMode,
    };
};
