import { ShopPanel } from "../components/ShopPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { useGameStore } from "../hooks/useGameStore";
import { gameStore } from "../game";
import { ROSTER_SLOT_PRICE } from "../../core/constants";

export const ShopPanelContainer = () => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("shop", false);
    const gold = useGameStore((state) => state.inventory.items.gold ?? 0);
    const rosterLimit = useGameStore((state) => state.rosterLimit);

    return (
        <ShopPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            gold={gold}
            rosterLimit={rosterLimit}
            rosterSlotPrice={ROSTER_SLOT_PRICE}
            onBuyRosterSlot={() => gameStore.dispatch({ type: "purchaseRosterSlot" })}
        />
    );
};
