import type { GameSave } from "../../core/types";
import { migrateAndValidateSave } from "./saveMigrations";

export type SaveEnvelopeV2 = {
    schemaVersion: 2;
    savedAt: number;
    checksum: string;
    payload: GameSave;
};

export type SaveLoadResult =
    | { status: "empty"; save: null }
    | { status: "ok"; save: GameSave }
    | { status: "migrated"; save: GameSave }
    | { status: "recovered_last_good"; save: GameSave }
    | { status: "corrupt"; save: null };

const isObject = (value: unknown): value is Record<string, unknown> => {
    return Boolean(value) && typeof value === "object";
};

const isGameSaveLike = (value: unknown): value is GameSave => {
    if (!isObject(value)) {
        return false;
    }
    if (typeof value.version !== "string") {
        return false;
    }
    if (!("players" in value) || !isObject(value.players)) {
        return false;
    }
    return true;
};

const utf8ToBytes = (text: string) => {
    return new TextEncoder().encode(text);
};

const toHex = (bytes: Uint8Array) => {
    let out = "";
    bytes.forEach((byte) => {
        out += byte.toString(16).padStart(2, "0");
    });
    return out;
};

const sha256Hex = (message: string): string => {
    const bytes = utf8ToBytes(message);
    const K = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    const H = new Uint32Array([
        0x6a09e667,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19
    ]);

    const bitLen = bytes.length * 8;
    const withOne = new Uint8Array(bytes.length + 1);
    withOne.set(bytes);
    withOne[bytes.length] = 0x80;

    const padLen = (64 - ((withOne.length + 8) % 64)) % 64;
    const totalLen = withOne.length + padLen + 8;
    const padded = new Uint8Array(totalLen);
    padded.set(withOne);

    const view = new DataView(padded.buffer);
    view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
    view.setUint32(totalLen - 4, bitLen >>> 0, false);

    const w = new Uint32Array(64);
    const rotr = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));
    const ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
    const maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
    const bigSigma0 = (x: number) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
    const bigSigma1 = (x: number) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
    const smallSigma0 = (x: number) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
    const smallSigma1 = (x: number) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

    for (let offset = 0; offset < padded.length; offset += 64) {
        for (let i = 0; i < 16; i += 1) {
            w[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i += 1) {
            w[i] = (smallSigma1(w[i - 2]) + w[i - 7] + smallSigma0(w[i - 15]) + w[i - 16]) >>> 0;
        }

        let a = H[0];
        let b = H[1];
        let c = H[2];
        let d = H[3];
        let e = H[4];
        let f = H[5];
        let g = H[6];
        let h = H[7];

        for (let i = 0; i < 64; i += 1) {
            const t1 = (h + bigSigma1(e) + ch(e, f, g) + K[i] + w[i]) >>> 0;
            const t2 = (bigSigma0(a) + maj(a, b, c)) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) >>> 0;
        }

        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
        H[5] = (H[5] + f) >>> 0;
        H[6] = (H[6] + g) >>> 0;
        H[7] = (H[7] + h) >>> 0;
    }

    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    for (let i = 0; i < 8; i += 1) {
        outView.setUint32(i * 4, H[i], false);
    }
    return toHex(out);
};

export const createSaveEnvelopeV2 = (save: GameSave, savedAt = Date.now()): SaveEnvelopeV2 => {
    const payloadJson = JSON.stringify(save);
    return {
        schemaVersion: 2,
        savedAt,
        checksum: sha256Hex(payloadJson),
        payload: save
    };
};

export const parseSaveEnvelopeOrLegacy = (raw: string): SaveLoadResult => {
    const parsed = (() => {
        try {
            return JSON.parse(raw) as unknown;
        } catch {
            return null;
        }
    })();

    if (!parsed) {
        return { status: "corrupt", save: null };
    }

    if (isObject(parsed) && parsed.schemaVersion === 2) {
        const envelope = parsed as Partial<SaveEnvelopeV2>;
        if (!isGameSaveLike(envelope.payload) || typeof envelope.checksum !== "string") {
            return { status: "corrupt", save: null };
        }
        const computed = sha256Hex(JSON.stringify(envelope.payload));
        if (computed !== envelope.checksum) {
            return { status: "corrupt", save: null };
        }
        const migrated = migrateAndValidateSave(envelope.payload);
        if (!migrated.ok) {
            return { status: "corrupt", save: null };
        }
        return { status: migrated.migrated ? "migrated" : "ok", save: migrated.save };
    }

    if (isGameSaveLike(parsed)) {
        const migrated = migrateAndValidateSave(parsed);
        if (!migrated.ok) {
            return { status: "corrupt", save: null };
        }
        return { status: "migrated", save: migrated.save };
    }

    return { status: "corrupt", save: null };
};
