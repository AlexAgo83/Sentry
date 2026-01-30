import { formatNumberCompact, formatNumberFull } from "./numberFormatters";

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

const formatSignedAmount = (
    amount: number,
    formatter: (value: number) => string,
    includePlus: boolean
): string => {
    const sign = amount < 0 ? "-" : includePlus && amount > 0 ? "+" : "";
    return `${sign}${formatter(Math.abs(amount))}`;
};

export const formatItemDeltaEntries = (entries: ItemEntry[]): string => {
    return entries.map((entry) => `${formatSignedAmount(entry.amount, formatNumberCompact, true)} ${entry.name}`).join(", ");
};

export const formatItemDeltaEntriesFull = (entries: ItemEntry[]): string => {
    return entries.map((entry) => `${formatSignedAmount(entry.amount, formatNumberFull, true)} ${entry.name}`).join(", ");
};

export const formatItemListEntries = (entries: ItemEntry[]): string => {
    return entries.map((entry) => `${formatNumberCompact(entry.amount)} ${entry.name}`).join(", ");
};

export const formatItemListEntriesFull = (entries: ItemEntry[]): string => {
    return entries.map((entry) => `${formatNumberFull(entry.amount)} ${entry.name}`).join(", ");
};
