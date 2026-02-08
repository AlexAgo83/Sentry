import type {
    ActionId,
    DungeonState,
    GameSave,
    InventoryState,
    LastNonDungeonAction,
    LastNonDungeonActionByPlayer,
    PlayerId,
    PlayerSaveState,
    QuestProgressState,
    SkillId,
    SkillState
} from "../../core/types";
import type { ProgressionState } from "../../core/types";
import { normalizeProgressionState } from "../../core/progression";
import { normalizeDungeonState } from "../../core/dungeon";
import { DEFAULT_SKILL_XP_NEXT, SKILL_MAX_LEVEL, XP_NEXT_MULTIPLIER } from "../../core/constants";
import { getActionDefinition, getRecipeDefinition } from "../../data/definitions";

export const LATEST_SAVE_SCHEMA_VERSION = 3;

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

const toNonNegativeNullableNumber = (value: unknown): number | null => {
    const numeric = toNullableNumber(value);
    if (numeric === null) {
        return null;
    }
    return numeric >= 0 ? numeric : null;
};

const normalizeRosterLimit = (value: unknown, minimum = 1): number => {
    const numeric = toNonNegativeNullableNumber(value);
    if (numeric === null) {
        return Math.max(1, Math.floor(minimum));
    }
    return Math.max(1, Math.floor(minimum), Math.floor(numeric));
};

const toNullableString = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const normalizeLastNonDungeonActionEntry = (value: unknown): LastNonDungeonAction | null => {
    if (!isObject(value)) {
        return null;
    }
    const skillId = toNullableString((value as { skillId?: unknown }).skillId);
    const recipeId = toNullableString((value as { recipeId?: unknown }).recipeId);
    if (!skillId || !recipeId) {
        return null;
    }
    if (!getActionDefinition(skillId as SkillId)) {
        return null;
    }
    const recipeDef = getRecipeDefinition(skillId as SkillId, recipeId);
    if (!recipeDef) {
        return null;
    }
    return { skillId: skillId as ActionId, recipeId };
};

const normalizeLastNonDungeonActionByPlayer = (
    value: unknown,
    players: Record<PlayerId, PlayerSaveState>,
    activePlayerId: PlayerId | null
): LastNonDungeonActionByPlayer => {
    if (!isObject(value)) {
        return {};
    }

    if ("skillId" in value || "recipeId" in value) {
        const legacy = normalizeLastNonDungeonActionEntry(value);
        if (legacy && activePlayerId && players[activePlayerId]) {
            return { [activePlayerId]: legacy };
        }
        return {};
    }

    return Object.entries(value).reduce<LastNonDungeonActionByPlayer>((acc, [playerId, entry]) => {
        if (!players[playerId as PlayerId]) {
            return acc;
        }
        const normalized = normalizeLastNonDungeonActionEntry(entry);
        if (normalized) {
            acc[playerId as PlayerId] = normalized;
        }
        return acc;
    }, {});
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

const normalizeQuests = (value: unknown): QuestProgressState | undefined => {
    if (!isObject(value)) {
        return undefined;
    }
    const craftCountsRaw = isObject(value.craftCounts) ? value.craftCounts : {};
    const completedRaw = isObject(value.completed) ? value.completed : {};
    const craftCounts: Record<string, number> = {};
    Object.entries(craftCountsRaw).forEach(([key, amount]) => {
        const numeric = typeof amount === "number" ? amount : Number(amount);
        if (Number.isFinite(numeric)) {
            craftCounts[key] = Math.max(0, Math.floor(numeric));
        }
    });
    const completed: Record<string, boolean> = {};
    Object.entries(completedRaw).forEach(([key, value]) => {
        if (typeof value === "boolean") {
            completed[key] = value;
        }
    });
    return { craftCounts, completed };
};

const COMBAT_SKILL_IDS = ["CombatMelee", "CombatRanged", "CombatMagic"] as const;
type LegacySkillMap = Record<string, SkillState>;

const computeTotalSkillXp = (level: number, xp: number): number => {
    const safeLevel = Math.max(1, Math.floor(level));
    let total = Math.max(0, Math.floor(xp));
    let xpNext = DEFAULT_SKILL_XP_NEXT;
    let currentLevel = 1;
    while (currentLevel < safeLevel) {
        total += xpNext;
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
        currentLevel += 1;
    }
    return total;
};

const buildSkillProgressFromXp = (xp: number): Pick<SkillState, "xp" | "level" | "xpNext"> => {
    let remaining = Math.max(0, Math.floor(xp));
    let level = 1;
    let xpNext = DEFAULT_SKILL_XP_NEXT;
    while (remaining >= xpNext && level < SKILL_MAX_LEVEL) {
        remaining -= xpNext;
        level += 1;
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
    }
    return { xp: remaining, level, xpNext };
};

const splitLegacyCombatProgress = (
    legacy: SkillState
): Record<(typeof COMBAT_SKILL_IDS)[number], Pick<SkillState, "xp" | "level" | "xpNext">> => {
    const totalXp = computeTotalSkillXp(legacy.level, legacy.xp);
    const base = Math.floor(totalXp / COMBAT_SKILL_IDS.length);
    const remainder = totalXp - base * COMBAT_SKILL_IDS.length;
    return COMBAT_SKILL_IDS.reduce<Record<(typeof COMBAT_SKILL_IDS)[number], Pick<SkillState, "xp" | "level" | "xpNext">>>((acc, skillId, index) => {
        const splitXp = base + (index < remainder ? 1 : 0);
        acc[skillId] = buildSkillProgressFromXp(splitXp);
        return acc;
    }, {} as Record<(typeof COMBAT_SKILL_IDS)[number], Pick<SkillState, "xp" | "level" | "xpNext">>);
};

const migrateCombatSkills = (players: Record<PlayerId, PlayerSaveState>) => {
    Object.values(players).forEach((player) => {
        const skills = (player as PlayerSaveState & { skills?: LegacySkillMap }).skills as LegacySkillMap | undefined;
        if (!skills) {
            return;
        }
        const hasSplit = COMBAT_SKILL_IDS.some((skillId) => skillId in skills);
        const legacy = skills["Combat"];
        if (hasSplit || !legacy) {
            return;
        }
        const progressBySkill = splitLegacyCombatProgress(legacy);
        COMBAT_SKILL_IDS.forEach((skillId) => {
            const progress = progressBySkill[skillId];
            skills[skillId] = {
                id: skillId,
                xp: progress.xp,
                level: progress.level,
                xpNext: progress.xpNext,
                maxLevel: SKILL_MAX_LEVEL,
                baseInterval: 5000,
                selectedRecipeId: null,
                recipes: {}
            };
        });
        delete skills["Combat"];
        const legacySelectedActionId = (player as { selectedActionId?: string | null }).selectedActionId ?? null;
        if (legacySelectedActionId === "Combat") {
            player.selectedActionId = "Roaming";
        }
    });
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

const sanitizePlayers = (rawPlayers: unknown, now: number): Record<PlayerId, PlayerSaveState> => {
    if (!isObject(rawPlayers)) {
        return {};
    }
    const next: Record<PlayerId, PlayerSaveState> = {};
    Object.entries(rawPlayers).forEach(([id, value]) => {
        if (!isObject(value)) {
            return;
        }
        const name = toNullableString(value.name) ?? `Player_${id}`;
        const rawProgression = (value as { progression?: unknown }).progression;
        const progression = normalizeProgressionState(
            isObject(rawProgression)
                ? (rawProgression as unknown as ProgressionState)
                : undefined,
            now
        );
        next[id] = {
            ...(value as unknown as PlayerSaveState),
            id,
            name,
            progression
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

    const now = Date.now();
    const players = sanitizePlayers(input.players, now);
    if (Object.keys(players).length === 0) {
        return { ok: false, reason: "Save has no valid players." };
    }

    const lastTick = toNonNegativeNullableNumber(input.lastTick);
    const lastHiddenAt = toNonNegativeNullableNumber(input.lastHiddenAt);
    const candidateActivePlayerId = toNullableString(input.activePlayerId);
    const schemaVersionRaw = typeof input.schemaVersion === "number" ? input.schemaVersion : Number(input.schemaVersion);
    const schemaVersion = Number.isFinite(schemaVersionRaw) ? schemaVersionRaw : 0;
    if (schemaVersion < LATEST_SAVE_SCHEMA_VERSION) {
        migrateCombatSkills(players);
    }

    const inventory = normalizeInventory(input.inventory);
    const legacyGold = legacyGoldFromPlayers(players);
    const finalInventory: InventoryState | undefined = (() => {
        const base = inventory ?? { items: {} };
        if (!base) {
            return undefined;
        }
        if (base.items.gold === undefined) {
            base.items.gold = legacyGold;
        }
        return base;
    })();

    const playerIds = Object.keys(players);
    const activePlayerId = candidateActivePlayerId && players[candidateActivePlayerId]
        ? candidateActivePlayerId
        : playerIds.length > 0
            ? playerIds[0]
            : null;
    const rosterLimit = normalizeRosterLimit(input.rosterLimit, playerIds.length);
    const rawLastNonDungeonAction = (input as {
        lastNonDungeonActionByPlayer?: unknown;
        lastNonDungeonAction?: unknown;
    }).lastNonDungeonActionByPlayer ?? (input as { lastNonDungeonAction?: unknown }).lastNonDungeonAction;
    const lastNonDungeonActionByPlayer = normalizeLastNonDungeonActionByPlayer(
        rawLastNonDungeonAction,
        players,
        activePlayerId
    );

    const migrated = schemaVersion !== LATEST_SAVE_SCHEMA_VERSION;
    const quests = normalizeQuests(input.quests);
    const progressionInput = isObject(input.progression)
        ? input.progression as unknown as ProgressionState
        : undefined;
    const progression = normalizeProgressionState(progressionInput, now);
    const dungeonInput = isObject(input.dungeon)
        ? input.dungeon as unknown as DungeonState
        : undefined;
    const dungeon = normalizeDungeonState(dungeonInput);
    if (!dungeonInput) {
        dungeon.onboardingRequired = false;
    }
    if (!dungeon.completionCounts) {
        dungeon.completionCounts = {};
    }

    return {
        ok: true,
        migrated,
        save: {
            schemaVersion: LATEST_SAVE_SCHEMA_VERSION,
            version,
            lastTick,
            lastHiddenAt,
            activePlayerId,
            lastNonDungeonActionByPlayer,
            players,
            rosterLimit,
            inventory: finalInventory,
            ...(quests ? { quests } : {}),
            progression,
            dungeon
        }
    };
};
