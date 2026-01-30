import { ShopPanel } from "../components/ShopPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { useGameStore } from "../hooks/useGameStore";
import { gameStore } from "../game";
import { getRosterSlotCost } from "../../core/economy";
import { MAX_ROSTER_LIMIT } from "../../core/constants";

export const ShopPanelContainer = () => {
    const [isCollapsed, setCollapsed] = usePersistedCollapse("shop", false);
    const gold = useGameStore((state) => state.inventory.items.gold ?? 0);
    const rosterLimit = useGameStore((state) => state.rosterLimit);
    const rosterSlotPrice = getRosterSlotCost(rosterLimit);
    const isRosterMaxed = rosterLimit >= MAX_ROSTER_LIMIT;
    const rosterSlotUpcomingCosts = isRosterMaxed
        ? []
        : [1, 2, 3].map((offset) => getRosterSlotCost(rosterLimit + offset));

    return (
        <ShopPanel
            isCollapsed={isCollapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            gold={gold}
            rosterLimit={rosterLimit}
            maxRosterLimit={MAX_ROSTER_LIMIT}
            rosterSlotPrice={rosterSlotPrice}
            rosterSlotUpcomingCosts={rosterSlotUpcomingCosts}
            isRosterMaxed={isRosterMaxed}
            onBuyRosterSlot={() => gameStore.dispatch({ type: "purchaseRosterSlot" })}
        />
    );
};
