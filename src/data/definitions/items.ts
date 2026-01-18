import type { ItemId } from "../../core/types";
import { EQUIPMENT_DEFINITIONS } from "../equipment";

const BASE_ITEM_DEFINITIONS: Array<{ id: ItemId; name: string }> = [
    { id: "gold", name: "Gold" },
    { id: "meat", name: "Meat" },
    { id: "bones", name: "Bones" },
    { id: "food", name: "Food" },
    { id: "herbs", name: "Herbs" },
    { id: "fish", name: "Fish" },
    { id: "cloth", name: "Cloth" },
    { id: "leather", name: "Leather" },
    { id: "wood", name: "Wood" },
    { id: "stone", name: "Stone" },
    { id: "ore", name: "Ore" },
    { id: "crystal", name: "Crystal" },
    { id: "ingot", name: "Ingot" },
    { id: "tools", name: "Tools" },
    { id: "artifact", name: "Artifact" },
    { id: "garment", name: "Garment" },
    { id: "armor", name: "Armor" },
    { id: "furniture", name: "Furniture" },
    { id: "tonic", name: "Tonic" },
    { id: "elixir", name: "Elixir" },
    { id: "potion", name: "Potion" }
];

export const ITEM_DEFINITIONS: Array<{ id: ItemId; name: string }> = [
    ...BASE_ITEM_DEFINITIONS,
    ...EQUIPMENT_DEFINITIONS.map((item) => ({ id: item.id, name: item.name }))
];
