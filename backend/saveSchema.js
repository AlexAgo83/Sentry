const SAVE_SCHEMA_V1 = {
    $id: "sentry.save.schema.v1",
    type: "object",
    additionalProperties: true,
    required: ["version", "players"],
    properties: {
        schemaVersion: { type: "number" },
        version: { type: "string", minLength: 1 },
        lastTick: { anyOf: [{ type: "number" }, { type: "null" }] },
        lastHiddenAt: { anyOf: [{ type: "number" }, { type: "null" }] },
        activePlayerId: { anyOf: [{ type: "string" }, { type: "null" }] },
        players: { type: "object" },
        rosterLimit: { type: "number" },
        inventory: { type: "object" },
        quests: { type: "object" }
    }
};

const isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const validateSavePayload = (payload) => {
    if (!isPlainObject(payload)) {
        return { ok: false, error: "Save payload must be an object." };
    }
    if (typeof payload.version !== "string" || payload.version.trim().length === 0) {
        return { ok: false, error: "Save payload must include a version string." };
    }
    if (!isPlainObject(payload.players)) {
        return { ok: false, error: "Save payload must include a players object." };
    }
    if ("schemaVersion" in payload && !Number.isFinite(payload.schemaVersion)) {
        return { ok: false, error: "Save payload schemaVersion must be a number." };
    }
    if ("lastTick" in payload && payload.lastTick !== null && !Number.isFinite(payload.lastTick)) {
        return { ok: false, error: "Save payload lastTick must be a number or null." };
    }
    if ("lastHiddenAt" in payload && payload.lastHiddenAt !== null && !Number.isFinite(payload.lastHiddenAt)) {
        return { ok: false, error: "Save payload lastHiddenAt must be a number or null." };
    }
    if ("activePlayerId" in payload && payload.activePlayerId !== null && typeof payload.activePlayerId !== "string") {
        return { ok: false, error: "Save payload activePlayerId must be a string or null." };
    }
    if ("rosterLimit" in payload && !Number.isFinite(payload.rosterLimit)) {
        return { ok: false, error: "Save payload rosterLimit must be a number." };
    }
    if ("inventory" in payload && !isPlainObject(payload.inventory)) {
        return { ok: false, error: "Save payload inventory must be an object." };
    }
    if ("quests" in payload && !isPlainObject(payload.quests)) {
        return { ok: false, error: "Save payload quests must be an object." };
    }
    return { ok: true };
};

module.exports = { SAVE_SCHEMA_V1, validateSavePayload };
