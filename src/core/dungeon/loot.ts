import { hashStringToSeed, seededRandom } from "../rng";
import type { DungeonDefinition, DungeonLootEntry, DungeonLootTable, ItemId } from "../types";

export type DungeonLootReward = {
    itemId: ItemId;
    quantity: number;
    entry: DungeonLootEntry;
};

const normalizePositiveInteger = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.floor(value));
};

const normalizeQuantityBounds = (entry: DungeonLootEntry) => {
    const min = Math.max(1, normalizePositiveInteger(entry.quantityMin));
    const max = Math.max(min, normalizePositiveInteger(entry.quantityMax));
    return { min, max };
};

export const buildDungeonLootValidationErrors = (
    definition: Pick<DungeonDefinition, "id" | "lootTable">,
    validItemIds: ReadonlySet<ItemId>
): string[] => {
    const errors: string[] = [];
    const lootTable = definition.lootTable;

    if (!lootTable || lootTable.rewardsPerClear !== 1) {
        errors.push(`Dungeon "${definition.id}" must define lootTable.rewardsPerClear as 1.`);
        return errors;
    }

    if (!Array.isArray(lootTable.entries) || lootTable.entries.length === 0) {
        errors.push(`Dungeon "${definition.id}" must define at least one loot entry.`);
        return errors;
    }

    lootTable.entries.forEach((entry, index) => {
        if (!entry || typeof entry.itemId !== "string" || !entry.itemId.trim()) {
            errors.push(`Dungeon "${definition.id}" loot entry #${index + 1} has an invalid item id.`);
            return;
        }
        if (!validItemIds.has(entry.itemId)) {
            errors.push(`Dungeon "${definition.id}" loot entry #${index + 1} references unknown item "${entry.itemId}".`);
        }
        if (!Number.isFinite(entry.weight) || entry.weight <= 0) {
            errors.push(`Dungeon "${definition.id}" loot entry #${index + 1} must have a positive weight.`);
        }
        const { min, max } = normalizeQuantityBounds(entry);
        if (!Number.isFinite(entry.quantityMin) || !Number.isFinite(entry.quantityMax)) {
            errors.push(`Dungeon "${definition.id}" loot entry #${index + 1} quantity bounds must be finite numbers.`);
            return;
        }
        if (min > max) {
            errors.push(`Dungeon "${definition.id}" loot entry #${index + 1} has invalid quantity bounds.`);
        }
    });

    return errors;
};

export const validateDungeonLootTable = (
    definition: Pick<DungeonDefinition, "id" | "lootTable">,
    validItemIds: ReadonlySet<ItemId>
) => {
    const errors = buildDungeonLootValidationErrors(definition, validItemIds);
    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }
};

export const validateDungeonDefinitionsLootTables = (
    definitions: ReadonlyArray<Pick<DungeonDefinition, "id" | "lootTable">>,
    validItemIds: ReadonlySet<ItemId>
) => {
    const errors = definitions.flatMap((definition) => buildDungeonLootValidationErrors(definition, validItemIds));
    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }
};

export const getDungeonLootTotalWeight = (lootTable: DungeonLootTable): number => {
    return lootTable.entries.reduce((sum, entry) => {
        const weight = Number.isFinite(entry.weight) ? Math.max(0, entry.weight) : 0;
        return sum + weight;
    }, 0);
};

const selectDungeonLootEntry = (lootTable: DungeonLootTable, seed: number): DungeonLootEntry | null => {
    const totalWeight = getDungeonLootTotalWeight(lootTable);
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
        return null;
    }
    let cursor = seededRandom(seed) * totalWeight;
    for (const entry of lootTable.entries) {
        const weight = Math.max(0, entry.weight);
        if (weight <= 0) {
            continue;
        }
        if (cursor < weight) {
            return entry;
        }
        cursor -= weight;
    }
    return lootTable.entries[lootTable.entries.length - 1] ?? null;
};

const rollDungeonLootQuantity = (entry: DungeonLootEntry, seed: number): number => {
    const { min, max } = normalizeQuantityBounds(entry);
    if (min >= max) {
        return min;
    }
    const spread = max - min + 1;
    return min + Math.floor(seededRandom(seed) * spread);
};

export const rollDungeonLootReward = (lootTable: DungeonLootTable, seed: number): DungeonLootReward | null => {
    const selected = selectDungeonLootEntry(lootTable, seed);
    if (!selected) {
        return null;
    }
    const quantitySeed = hashStringToSeed(`${seed}:${selected.itemId}:quantity`);
    return {
        itemId: selected.itemId,
        quantity: rollDungeonLootQuantity(selected, quantitySeed),
        entry: selected
    };
};
