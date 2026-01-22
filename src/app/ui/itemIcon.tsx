import { memo } from "react";
import type { ItemId } from "../../core/types";
import { getInventoryMeta } from "./inventoryMeta";
import { InventoryIcon } from "./inventoryIcons";

export type ItemIconTone = "consume" | "produce";

export const ItemIcon = memo(({ itemId, tone, size = 12 }: { itemId: ItemId; tone: ItemIconTone; size?: number }) => {
    const { iconId } = getInventoryMeta(itemId);

    return (
        <span
            className={`ts-item-icon ts-item-icon-${tone}`}
            aria-hidden="true"
            style={{
                width: size,
                height: size
            }}
        >
            <InventoryIcon iconId={iconId} />
        </span>
    );
});

ItemIcon.displayName = "ItemIcon";
