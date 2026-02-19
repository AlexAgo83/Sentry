import type { GameSave } from "./types";

const canonicalizeValue = (value: unknown): string => {
    if (value === null) {
        return "null";
    }
    const valueType = typeof value;
    if (valueType === "number") {
        if (!Number.isFinite(value as number)) {
            return "null";
        }
        return JSON.stringify(value);
    }
    if (valueType === "string" || valueType === "boolean") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((entry) => canonicalizeValue(entry)).join(",")}]`;
    }
    if (valueType !== "object") {
        return "null";
    }

    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalizeValue(record[key])}`);
    return `{${entries.join(",")}}`;
};

const hashFnv1a32 = (value: string): string => {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
};

export const toCanonicalSaveJson = (save: unknown): string => canonicalizeValue(save);

export const buildSaveFingerprint = (save: GameSave | unknown): string => {
    const canonical = toCanonicalSaveJson(save);
    return `fp1-${canonical.length.toString(16)}-${hashFnv1a32(canonical)}`;
};
