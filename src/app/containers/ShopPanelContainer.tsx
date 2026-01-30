import { ShopPanel } from "../components/ShopPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { useGameStore } from "../hooks/useGameStore";
import { gameStore } from "../game";
import { getRosterSlotCost } from "../../core/economy";

export const ShopPanelContainer = () => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("shop", false);
    const gold = useGameStore((state) => state.inventory.items.gold ?? 0);
    const rosterLimit = useGameStore((state) => state.rosterLimit);
    const rosterSlotPrice = getRosterSlotCost(rosterLimit);

    return (
        <ShopPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            gold={gold}
            rosterLimit={rosterLimit}
            rosterSlotPrice={rosterSlotPrice}
            onBuyRosterSlot={() => gameStore.dispatch({ type: "purchaseRosterSlot" })}
        />
    );
};
