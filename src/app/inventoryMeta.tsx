import type { ItemId } from "../core/types";

export type InventoryMeta = {
    description: string;
    icon: JSX.Element;
};

const createIcon = (children: JSX.Element | JSX.Element[]) => (
    <svg
        viewBox="0 0 32 32"
        className="ts-inventory-icon"
        aria-hidden="true"
        focusable="false"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

export const getInventoryMeta = (itemId: ItemId): InventoryMeta => {
    return INVENTORY_META[itemId] ?? {
        description: "No description available.",
        icon: createIcon(<circle cx="16" cy="16" r="10" />)
    };
};

const INVENTORY_META: Record<ItemId, InventoryMeta> = {
    gold: {
        description: "Polished coins used for trade and rewards.",
        icon: createIcon(
            <>
                <circle cx="14" cy="16" r="7" />
                <circle cx="20" cy="12" r="5" />
                <path d="M10 16h8" />
                <path d="M16 12h8" />
            </>
        )
    },
    meat: {
        description: "Fresh cuts from the hunt, used in cooking.",
        icon: createIcon(
            <>
                <path d="M12 18c-3-3 1-8 5-9c4-1 8 3 7 7c-1 4-6 8-9 5" />
                <path d="M10 20l-4 4" />
                <circle cx="6" cy="24" r="2" />
                <circle cx="10" cy="20" r="2" />
            </>
        )
    },
    bones: {
        description: "Rough bone shards salvaged from battles.",
        icon: createIcon(
            <>
                <circle cx="10" cy="16" r="3" />
                <circle cx="22" cy="16" r="3" />
                <rect x="10" y="14" width="12" height="4" rx="2" />
            </>
        )
    },
    food: {
        description: "Prepared rations that fuel action.",
        icon: createIcon(
            <>
                <path d="M8 18c0 4 4 6 8 6s8-2 8-6" />
                <path d="M6 18h20" />
                <path d="M12 10c-2 2-2 4 0 6" />
                <path d="M16 9c-2 2-2 4 0 6" />
                <path d="M20 10c-2 2-2 4 0 6" />
            </>
        )
    },
    herbs: {
        description: "Wild herbs for tinctures and cooking.",
        icon: createIcon(
            <>
                <path d="M16 6c6 4 8 10 0 20c-8-10-6-16 0-20z" />
                <path d="M16 12v10" />
            </>
        )
    },
    fish: {
        description: "River fish ready for smoking or stew.",
        icon: createIcon(
            <>
                <path d="M8 16c4-4 12-4 16 0c-4 4-12 4-16 0z" />
                <path d="M6 12l-4 4l4 4" />
                <circle cx="20" cy="14" r="1.5" />
            </>
        )
    },
    cloth: {
        description: "Woven cloth for tailoring work.",
        icon: createIcon(
            <>
                <rect x="8" y="10" width="16" height="12" rx="2" />
                <path d="M8 16h16" />
                <path d="M14 10v12" />
            </>
        )
    },
    leather: {
        description: "Tanned hide used for armor and gear.",
        icon: createIcon(
            <path d="M8 12c0-2 2-4 4-4l4 2l4-2c2 0 4 2 4 4l2 6-2 6c0 2-2 4-4 4l-4-2l-4 2c-2 0-4-2-4-4l-2-6z" />
        )
    },
    wood: {
        description: "Sturdy timber for carpentry and fires.",
        icon: createIcon(
            <>
                <rect x="6" y="12" width="20" height="8" rx="4" />
                <circle cx="10" cy="16" r="2" />
                <circle cx="22" cy="16" r="2" />
            </>
        )
    },
    stone: {
        description: "Raw stone for building and forging.",
        icon: createIcon(<path d="M8 20l4-10h8l4 6-3 8z" />)
    },
    ore: {
        description: "Mineral ore awaiting smelting.",
        icon: createIcon(
            <>
                <path d="M10 6h12l4 8-4 12h-12l-4-12z" />
                <path d="M10 6l6 6l6-6" />
            </>
        )
    },
    crystal: {
        description: "Glowing crystal with arcane charge.",
        icon: createIcon(
            <>
                <path d="M16 4l8 8-8 16-8-16z" />
                <path d="M16 4l-4 8h8z" />
            </>
        )
    },
    ingot: {
        description: "Refined metal bars for crafting.",
        icon: createIcon(
            <>
                <rect x="6" y="14" width="20" height="8" rx="2" />
                <path d="M10 14l4-6h12l-4 6z" />
            </>
        )
    },
    tools: {
        description: "Working tools to speed production.",
        icon: createIcon(
            <>
                <rect x="10" y="6" width="12" height="6" rx="1" />
                <path d="M16 12l8 8" />
                <path d="M12 14l-4 4" />
            </>
        )
    },
    artifact: {
        description: "Ancient relic with unknown power.",
        icon: createIcon(
            <path d="M16 6l3 6l7 1l-5 5l1 7l-6-3l-6 3l1-7l-5-5l7-1z" />
        )
    },
    garment: {
        description: "Finished clothing from skilled hands.",
        icon: createIcon(
            <path d="M10 8l6 4l6-4l4 4l-4 4v10h-12v-10l-4-4z" />
        )
    },
    armor: {
        description: "Protective gear for hardened fighters.",
        icon: createIcon(
            <>
                <path d="M16 4l8 4v6c0 6-4 10-8 14c-4-4-8-8-8-14v-6z" />
                <path d="M16 10v12" />
            </>
        )
    },
    furniture: {
        description: "Crafted furnishings for camp upgrades.",
        icon: createIcon(
            <>
                <rect x="10" y="8" width="12" height="8" rx="1" />
                <path d="M12 16v8" />
                <path d="M20 16v8" />
                <path d="M8 16h16" />
            </>
        )
    },
    tonic: {
        description: "Light tonic for quick recovery.",
        icon: createIcon(
            <>
                <path d="M14 6h4" />
                <path d="M14 6v4l-2 3v9c0 2 2 4 4 4s4-2 4-4v-9l-2-3v-4" />
                <path d="M12 18h8" />
            </>
        )
    },
    elixir: {
        description: "Distilled elixir with potent effects.",
        icon: createIcon(
            <>
                <path d="M12 6h8" />
                <path d="M14 6v6l-6 10c0 4 4 6 8 6s8-2 8-6l-6-10v-6" />
                <path d="M10 20h12" />
            </>
        )
    },
    potion: {
        description: "Bottled potion for emergencies.",
        icon: createIcon(
            <>
                <path d="M12 6h8" />
                <path d="M14 6v4l-4 6v8c0 2 2 4 6 4s6-2 6-4v-8l-4-6v-4" />
                <circle cx="18" cy="22" r="2" />
            </>
        )
    }
};
