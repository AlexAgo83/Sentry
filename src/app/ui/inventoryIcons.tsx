import type { ItemId } from "../../core/types";
import type { ReactElement } from "react";

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

const ICON_SHAPES: Record<InventoryIconId, ReactElement> = {
    generic: <circle cx="16" cy="16" r="10" />,
    gold: (
        <>
            <circle cx="14" cy="16" r="7" />
            <circle cx="20" cy="12" r="5" />
            <path d="M10 16h8" />
            <path d="M16 12h8" />
        </>
    ),
    meat: (
        <>
            <path d="M12 18c-3-3 1-8 5-9c4-1 8 3 7 7c-1 4-6 8-9 5" />
            <path d="M10 20l-4 4" />
            <circle cx="6" cy="24" r="2" />
            <circle cx="10" cy="20" r="2" />
        </>
    ),
    bones: (
        <>
            <circle cx="10" cy="16" r="3" />
            <circle cx="22" cy="16" r="3" />
            <rect x="10" y="14" width="12" height="4" rx="2" />
        </>
    ),
    food: (
        <>
            <path d="M8 18c0 4 4 6 8 6s8-2 8-6" />
            <path d="M6 18h20" />
            <path d="M12 10c-2 2-2 4 0 6" />
            <path d="M16 9c-2 2-2 4 0 6" />
            <path d="M20 10c-2 2-2 4 0 6" />
        </>
    ),
    herbs: (
        <>
            <path d="M16 6c6 4 8 10 0 20c-8-10-6-16 0-20z" />
            <path d="M16 12v10" />
        </>
    ),
    fish: (
        <>
            <path d="M8 16c4-4 12-4 16 0c-4 4-12 4-16 0z" />
            <path d="M6 12l-4 4l4 4" />
            <circle cx="20" cy="14" r="1.5" />
        </>
    ),
    cloth: (
        <>
            <rect x="8" y="10" width="16" height="12" rx="2" />
            <path d="M8 16h16" />
            <path d="M14 10v12" />
        </>
    ),
    leather: (
        <path d="M8 12c0-2 2-4 4-4l4 2l4-2c2 0 4 2 4 4l2 6-2 6c0 2-2 4-4 4l-4-2l-4 2c-2 0-4-2-4-4l-2-6z" />
    ),
    wood: (
        <>
            <rect x="6" y="12" width="20" height="8" rx="4" />
            <circle cx="10" cy="16" r="2" />
            <circle cx="22" cy="16" r="2" />
        </>
    ),
    stone: <path d="M8 20l4-10h8l4 6-3 8z" />,
    ore: (
        <>
            <path d="M10 6h12l4 8-4 12h-12l-4-12z" />
            <path d="M10 6l6 6l6-6" />
        </>
    ),
    crystal: (
        <>
            <path d="M16 4l8 8-8 16-8-16z" />
            <path d="M16 4l-4 8h8z" />
        </>
    ),
    ingot: (
        <>
            <rect x="6" y="14" width="20" height="8" rx="2" />
            <path d="M10 14l4-6h12l-4 6z" />
        </>
    ),
    tools: (
        <>
            <rect x="10" y="6" width="12" height="6" rx="1" />
            <path d="M16 12l8 8" />
            <path d="M12 14l-4 4" />
        </>
    ),
    artifact: (
        <path d="M16 6l3 6l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z" />
    ),
    garment: (
        <path d="M10 8l6 4l6-4l4 4l-4 4v10h-12v-10l-4-4z" />
    ),
    armor: (
        <>
            <path d="M16 4l8 4v6c0 6-4 10-8 14c-4-4-8-8-8-14v-6z" />
            <path d="M16 10v12" />
        </>
    ),
    traveler_cape: (
        <>
            <path d="M16 6c4 0 8 3 9 8l-2 12h-14l-2-12c1-5 5-8 9-8z" />
            <path d="M16 6v20" />
        </>
    ),
    cloth_cap: (
        <>
            <path d="M6 18c2-6 6-9 10-9s8 3 10 9" />
            <path d="M6 18h20" />
            <path d="M10 18v4h12v-4" />
        </>
    ),
    linen_tunic: (
        <path d="M10 8l6 4l6-4l4 4l-4 4v10h-12v-10l-4-4z" />
    ),
    worn_trousers: (
        <>
            <path d="M12 8h8l2 18h-5l-1-8l-1 8h-5z" />
            <path d="M12 8l-2 6h12l-2-6" />
        </>
    ),
    leather_gloves: (
        <>
            <path d="M12 10l4-2l4 2v8l-2 6h-8l-2-6v-8z" />
            <path d="M16 10v14" />
        </>
    ),
    simple_boots: (
        <>
            <path d="M10 10h6v8h8v6h-14z" />
            <path d="M10 24h14" />
        </>
    ),
    signet_ring: (
        <>
            <circle cx="16" cy="18" r="6" />
            <path d="M12 10h8" />
            <path d="M16 8v2" />
        </>
    ),
    warding_amulet: (
        <>
            <path d="M10 10c2-3 4-4 6-4s4 1 6 4" />
            <path d="M10 10v4c0 4 2 8 6 12c4-4 6-8 6-12v-4" />
            <circle cx="16" cy="18.5" r="2" />
        </>
    ),
    invocation_tablet: (
        <>
            <rect x="9" y="6" width="14" height="20" rx="2" />
            <path d="M12 12h8" />
            <path d="M12 16h6" />
        </>
    ),
    rusty_blade: (
        <>
            <path d="M16 6v14" />
            <path d="M12 12h8" />
            <path d="M16 20l-3 6h6z" />
        </>
    ),
    simple_bow: (
        <>
            <path d="M10 6c6 4 10 10 10 20" />
            <path d="M22 6c-6 4-10 10-10 20" />
            <path d="M12 16h8" />
        </>
    ),
    apprentice_staff: (
        <>
            <path d="M16 6v18" />
            <path d="M14 24h4" />
            <path d="M16 4l3 4h-6z" />
        </>
    ),
    furniture: (
        <>
            <rect x="10" y="8" width="12" height="8" rx="1" />
            <path d="M12 16v8" />
            <path d="M20 16v8" />
            <path d="M8 16h16" />
        </>
    ),
    tonic: (
        <>
            <path d="M14 6h4" />
            <path d="M14 6v4l-2 3v9c0 2 2 4 4 4s4-2 4-4v-9l-2-3v-4" />
            <path d="M12 18h8" />
        </>
    ),
    elixir: (
        <>
            <path d="M12 6h8" />
            <path d="M14 6v6l-4 6v6c0 2 2 4 6 4s6-2 6-4v-6l-4-6v-6" />
            <path d="M12 18h8" />
        </>
    ),
    potion: (
        <>
            <path d="M14 6h4" />
            <path d="M14 6v6l-4 4v6c0 3 2 6 6 6s6-3 6-6v-6l-4-4v-6" />
            <path d="M12 20h8" />
        </>
    ),
    slot_head: (
        <>
            <circle cx="16" cy="12" r="4" />
            <path d="M8 24c2-4 6-6 8-6s6 2 8 6" />
        </>
    ),
    slot_cape: (
        <>
            <path d="M16 8c4 0 7 2 8 6l-2 12h-12l-2-12c1-4 4-6 8-6z" />
            <path d="M16 8v18" />
        </>
    ),
    slot_torso: (
        <>
            <path d="M10 8l6 4l6-4l3 6v10h-18v-10z" />
            <path d="M10 14h12" />
        </>
    ),
    slot_legs: (
        <>
            <path d="M12 8h8l2 18h-5l-1-8l-1 8h-5z" />
        </>
    ),
    slot_hands: (
        <>
            <circle cx="12" cy="12" r="3" />
            <circle cx="20" cy="12" r="3" />
            <path d="M9 16h6" />
            <path d="M17 16h6" />
        </>
    ),
    slot_feet: (
        <>
            <path d="M8 18h8v6h-8z" />
            <path d="M16 18h8v6h-8z" />
        </>
    ),
    slot_ring: (
        <>
            <circle cx="16" cy="18" r="6" />
            <path d="M14 10h4" />
            <path d="M16 6v4" />
        </>
    ),
    slot_amulet: (
        <>
            <path d="M10 10c2-3 4-4 6-4s4 1 6 4" />
            <path d="M10 10v4c0 4 2 8 6 12c4-4 6-8 6-12v-4" />
            <circle cx="16" cy="19" r="2" />
        </>
    ),
    slot_weapon: (
        <>
            <path d="M10 22l12-12" />
            <path d="M10 10h4" />
            <path d="M20 22h4" />
        </>
    ),
    slot_tablet: (
        <>
            <rect x="9" y="6" width="14" height="20" rx="2" />
            <path d="M12 12h8" />
            <path d="M12 16h6" />
        </>
    )
};

export const InventoryIconSprite = () => (
    <svg className="ts-inventory-sprite" aria-hidden="true" focusable="false">
        <defs>
            {Object.entries(ICON_SHAPES).map(([iconId, shape]) => (
                <symbol
                    key={iconId}
                    id={`inventory-${iconId}`}
                    viewBox="0 0 32 32"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {shape}
                </symbol>
            ))}
        </defs>
    </svg>
);

export const InventoryIcon = ({ iconId }: { iconId: InventoryIconId }) => (
    <svg
        viewBox="0 0 32 32"
        className="ts-inventory-icon"
        aria-hidden="true"
        focusable="false"
    >
        <use href={`#inventory-${iconId}`} />
    </svg>
);
