import { useEffect } from "react";
import { gameRuntime } from "../game";

export const useGameRuntimeLifecycle = (refreshLoadReport: () => void) => {
    useEffect(() => {
        gameRuntime.start();
        refreshLoadReport();
        return () => gameRuntime.stop();
    }, [refreshLoadReport]);
};

