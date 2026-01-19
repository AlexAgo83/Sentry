import type { GameSave, InventoryState, PlayerId, PlayerSaveState } from "../../core/types";

export const LATEST_SAVE_SCHEMA_VERSION = 1;

const isObject = (value: unknown): value is Record<string, unknown> => {
    return Boolean(value) && typeof value === "object";
};

const toNullableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) {
        return null;
    }
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};

const toNullableString = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const normalizeInventory = (value: unknown): InventoryState | undefined => {
    if (!isObject(value)) {
        return undefined;
    }
    const items = isObject(value.items) ? value.items : null;
    if (!items) {
        return { items: {} };
    }
    const next: Record<string, number> = {};
    Object.entries(items).forEach(([key, amount]) => {
        const numeric = typeof amount === "number" ? amount : Number(amount);
        if (Number.isFinite(numeric)) {
            next[key] = Math.max(0, Math.floor(numeric));
        }
    });
    return { items: next };
};

const legacyGoldFromPlayers = (players: Record<PlayerId, PlayerSaveState>): number => {
    return Object.values(players).reduce((acc, player) => {
        const storage = (player as unknown as { storage?: unknown }).storage;
        if (!isObject(storage)) {
            return acc;
        }
        const gold = typeof storage.gold === "number" ? storage.gold : Number(storage.gold);
        if (!Number.isFinite(gold)) {
            return acc;
        }
        return acc + gold;
    }, 0);
};

const sanitizePlayers = (rawPlayers: unknown): Record<PlayerId, PlayerSaveState> => {
    if (!isObject(rawPlayers)) {
        return {};
    }
    const next: Record<PlayerId, PlayerSaveState> = {};
    Object.entries(rawPlayers).forEach(([id, value]) => {
        if (!isObject(value)) {
            return;
        }
        const name = toNullableString(value.name) ?? `Player_${id}`;
        next[id] = {
            ...(value as unknown as PlayerSaveState),
            id,
            name,
        };
    });
    return next;
};

export type MigrateSaveResult =
    | { ok: true; save: GameSave; migrated: boolean }
    | { ok: false; reason: string };

export const migrateAndValidateSave = (input: unknown): MigrateSaveResult => {
    if (!isObject(input)) {
        return { ok: false, reason: "Save must be an object." };
    }

    const version = toNullableString(input.version);
    if (!version) {
        return { ok: false, reason: "Save version is missing." };
    }

    const players = sanitizePlayers(input.players);
    if (Object.keys(players).length === 0) {
        return { ok: false, reason: "Save has no valid players." };
    }

    const lastTick = toNullableNumber(input.lastTick);
    const lastHiddenAt = toNullableNumber(input.lastHiddenAt);
    const activePlayerId = toNullableString(input.activePlayerId);
    const schemaVersionRaw = typeof input.schemaVersion === "number" ? input.schemaVersion : Number(input.schemaVersion);
    const schemaVersion = Number.isFinite(schemaVersionRaw) ? schemaVersionRaw : 0;

    const inventory = normalizeInventory(input.inventory);
    const legacyGold = legacyGoldFromPlayers(players);
    const finalInventory: InventoryState | undefined = (() => {
        const base = inventory ?? (legacyGold > 0 ? { items: {} } : undefined);
        if (!base) {
            return undefined;
        }
        if (base.items.gold === undefined) {
            base.items.gold = legacyGold;
        }
        return base;
    })();

    const migrated = schemaVersion !== LATEST_SAVE_SCHEMA_VERSION;

    return {
        ok: true,
        migrated,
        save: {
            schemaVersion: LATEST_SAVE_SCHEMA_VERSION,
            version,
            lastTick,
            lastHiddenAt,
            activePlayerId,
            players,
            inventory: finalInventory,
        }
    };
};

