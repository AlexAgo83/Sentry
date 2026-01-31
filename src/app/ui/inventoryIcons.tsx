import type { ItemId } from "../../core/types";

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

const INVENTORY_ICON_PATH = `${__ASSETS_PATH__}icons/inventory/`;

const getInventoryIconUrl = (iconId: InventoryIconId) => `${INVENTORY_ICON_PATH}${iconId}.svg`;

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
