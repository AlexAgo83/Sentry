import type { SaveLoadResult } from "./saveEnvelope";

export type PersistenceLoadReport = {
    status: SaveLoadResult["status"];
    recoveredFromLastGood: boolean;
};

let lastReport: PersistenceLoadReport = { status: "empty", recoveredFromLastGood: false };

export const setPersistenceLoadReport = (report: PersistenceLoadReport) => {
    lastReport = report;
};

export const getPersistenceLoadReport = (): PersistenceLoadReport => lastReport;

