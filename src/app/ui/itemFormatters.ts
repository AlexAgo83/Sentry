type ItemDefinition = {
    id: string;
    name: string;
};

type ItemEntry = {
    id: string;
    name: string;
    amount: number;
};

export const getItemDeltaEntries = (definitions: ItemDefinition[], deltas?: Record<string, number>): ItemEntry[] => {
    if (!deltas) {
        return [];
    }
    return definitions
        .map((item) => ({
            id: item.id,
            name: item.name,
            amount: deltas[item.id] ?? 0
        }))
        .filter((entry) => entry.amount !== 0);
};

export const getItemListEntries = (definitions: ItemDefinition[], items?: Record<string, number>): ItemEntry[] => {
    if (!items) {
        return [];
    }
    return definitions
        .map((item) => ({
            id: item.id,
            name: item.name,
            amount: items[item.id] ?? 0
        }))
        .filter((entry) => entry.amount > 0);
};

export const formatItemDeltaEntries = (entries: ItemEntry[]): string => {
    return entries.map((entry) => `${entry.amount > 0 ? "+" : ""}${entry.amount} ${entry.name}`).join(", ");
};

export const formatItemListEntries = (entries: ItemEntry[]): string => {
    return entries.map((entry) => `${entry.amount} ${entry.name}`).join(", ");
};
