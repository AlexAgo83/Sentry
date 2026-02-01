import type { ItemId } from "../../core/types";
import { EQUIPMENT_DEFINITIONS } from "../../data/equipment";

type EquipmentSlotIconId =
    | "slot_head"
    | "slot_cape"
    | "slot_torso"
    | "slot_legs"
    | "slot_hands"
    | "slot_feet"
    | "slot_ring"
    | "slot_amulet"
    | "slot_weapon"
    | "slot_tablet";

export type InventoryIconId = ItemId | EquipmentSlotIconId | "generic";

const EQUIPMENT_ICON_IDS = new Set(EQUIPMENT_DEFINITIONS.map((item) => item.id));
const SLOT_ICON_IDS = new Set<EquipmentSlotIconId>([
    "slot_head",
    "slot_cape",
    "slot_torso",
    "slot_legs",
    "slot_hands",
    "slot_feet",
    "slot_ring",
    "slot_amulet",
    "slot_weapon",
    "slot_tablet"
]);

const ITEM_ICON_PATH = `${__ASSETS_PATH__}items/`;
const EQUIPMENT_ICON_PATH = `${__ASSETS_PATH__}icons/equipment/`;
const SLOT_ICON_PATH = `${__ASSETS_PATH__}icons/slots/`;

const getInventoryIconUrl = (iconId: InventoryIconId) => {
    if (iconId === "generic") {
        return `${ITEM_ICON_PATH}generic.svg`;
    }
    if (SLOT_ICON_IDS.has(iconId as EquipmentSlotIconId)) {
        const slotId = iconId.replace("slot_", "");
        return `${SLOT_ICON_PATH}${slotId}.svg`;
    }
    if (EQUIPMENT_ICON_IDS.has(iconId)) {
        return `${EQUIPMENT_ICON_PATH}${iconId}.svg`;
    }
    return `${ITEM_ICON_PATH}${iconId}.svg`;
};

export const InventoryIcon = ({ iconId }: { iconId: InventoryIconId }) => (
    <svg
        viewBox="0 0 32 32"
        className="ts-inventory-icon"
        aria-hidden="true"
        focusable="false"
    >
        <use href={`${getInventoryIconUrl(iconId)}#icon`} />
    </svg>
);
