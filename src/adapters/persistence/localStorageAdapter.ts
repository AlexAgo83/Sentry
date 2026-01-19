import { PersistenceAdapter } from "./types";
import { setPersistenceLoadReport } from "./loadReport";
import { createSaveEnvelopeV2, parseSaveEnvelopeOrLegacy } from "./saveEnvelope";

const DEFAULT_STORAGE_KEY = "sentry-ts-save-v1";
const lastGoodKeyFor = (storageKey: string) => `${storageKey}:lastGood`;

export const createLocalStorageAdapter = (storageKey = DEFAULT_STORAGE_KEY): PersistenceAdapter => {
    return {
        load: () => {
            if (typeof localStorage === "undefined") {
                setPersistenceLoadReport({ status: "empty", recoveredFromLastGood: false });
                return null;
            }
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                setPersistenceLoadReport({ status: "empty", recoveredFromLastGood: false });
                return null;
            }
            const parsed = parseSaveEnvelopeOrLegacy(raw);
            if (parsed.status === "ok") {
                setPersistenceLoadReport({ status: "ok", recoveredFromLastGood: false });
                return parsed.save;
            }
            if (parsed.status === "migrated") {
                try {
                    const envelope = createSaveEnvelopeV2(parsed.save);
                    localStorage.setItem(storageKey, JSON.stringify(envelope));
                } catch {
                    // ignore migration write-back failures
                }
                setPersistenceLoadReport({ status: "migrated", recoveredFromLastGood: false });
                return parsed.save;
            }

            const lastGoodKey = lastGoodKeyFor(storageKey);
            const lastGoodRaw = localStorage.getItem(lastGoodKey);
            if (lastGoodRaw) {
                const lastGoodParsed = parseSaveEnvelopeOrLegacy(lastGoodRaw);
                if (lastGoodParsed.status === "ok" || lastGoodParsed.status === "migrated") {
                    setPersistenceLoadReport({ status: "recovered_last_good", recoveredFromLastGood: true });
                    return lastGoodParsed.save;
                }
            }

            setPersistenceLoadReport({ status: "corrupt", recoveredFromLastGood: false });
            console.error("Failed to parse save data", { status: parsed.status });
            return null;
        },
        save: (save) => {
            if (typeof localStorage === "undefined") {
                return;
            }
            const lastGoodKey = lastGoodKeyFor(storageKey);
            try {
                const currentRaw = localStorage.getItem(storageKey);
                if (currentRaw) {
                    const currentParsed = parseSaveEnvelopeOrLegacy(currentRaw);
                    if (currentParsed.status === "ok" || currentParsed.status === "migrated") {
                        localStorage.setItem(lastGoodKey, currentRaw);
                    }
                }
            } catch {
                // ignore last-good bookkeeping failures
            }

            const envelope = createSaveEnvelopeV2(save);
            localStorage.setItem(storageKey, JSON.stringify(envelope));
        }
    };
};
