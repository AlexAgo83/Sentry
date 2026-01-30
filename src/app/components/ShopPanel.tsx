import { memo } from "react";
import { CollapseIcon } from "../ui/collapseIcon";
import { formatNumberCompact, formatNumberFull } from "../ui/numberFormatters";

type ShopPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    gold: number;
    rosterLimit: number;
    maxRosterLimit: number;
    rosterSlotPrice: number;
    rosterSlotUpcomingCosts: number[];
    isRosterMaxed: boolean;
    onBuyRosterSlot: () => void;
};

export const ShopPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    gold,
    rosterLimit,
    maxRosterLimit,
    rosterSlotPrice,
    rosterSlotUpcomingCosts,
    isRosterMaxed,
    onBuyRosterSlot
}: ShopPanelProps) => {
    const canBuyRosterSlot = !isRosterMaxed && gold >= rosterSlotPrice;
    const formattedRosterSlotPrice = formatNumberCompact(rosterSlotPrice);
    const formattedRosterSlotFullPrice = formatNumberFull(rosterSlotPrice);
    const upcomingCostsLabel = rosterSlotUpcomingCosts.length > 0
        ? rosterSlotUpcomingCosts.map((cost) => formatNumberCompact(cost)).join(" / ")
        : "";
    const upcomingCostsFullLabel = rosterSlotUpcomingCosts.length > 0
        ? rosterSlotUpcomingCosts.map((cost) => formatNumberFull(cost)).join(" / ")
        : "";
    const priceTitle = isRosterMaxed
        ? "Roster cap reached."
        : upcomingCostsLabel
            ? `Buy for ${formattedRosterSlotFullPrice} gold. Next: ${upcomingCostsLabel}.`
            : `Buy for ${formattedRosterSlotFullPrice} gold.`;

    return (
        <section className="generic-panel ts-panel ts-shop-panel">
            <div className="ts-panel-header">
                <h2 className="ts-panel-title">Shop</h2>
                <button
                    type="button"
                    className="ts-collapse-button ts-focusable"
                    onClick={onToggleCollapsed}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                    <span className="ts-collapse-label">
                        <CollapseIcon isCollapsed={isCollapsed} />
                    </span>
                </button>
            </div>
            {!isCollapsed ? (
                <div className="ts-shop-grid is-single">
                    <div className={`ts-shop-tile${isRosterMaxed ? " is-maxed" : ""}`}>
                        <div className="ts-shop-tile-title">Roster slot</div>
                        <div className="ts-shop-tile-subtitle">+1 max hero</div>
                        <div className="ts-shop-tile-meta">
                            Current cap: {rosterLimit} / {maxRosterLimit}
                        </div>
                        <div className="ts-shop-tile-footer">
                            <span className="ts-shop-tile-price" title={priceTitle}>
                                {isRosterMaxed ? "Maxed" : `${formattedRosterSlotPrice} gold`}
                            </span>
                            <button
                                type="button"
                                className="generic-field button ts-shop-buy ts-focusable"
                                onClick={onBuyRosterSlot}
                                disabled={!canBuyRosterSlot}
                                aria-disabled={!canBuyRosterSlot}
                                title={isRosterMaxed
                                    ? "Roster cap reached."
                                    : !canBuyRosterSlot
                                        ? "Not enough gold"
                                        : `Buy for ${formattedRosterSlotFullPrice} gold`}
                            >
                                {isRosterMaxed ? "Max" : "Buy"}
                            </button>
                        </div>
                        {!isRosterMaxed && upcomingCostsLabel ? (
                            <div className="ts-shop-tile-next" title={`Next: ${upcomingCostsFullLabel} gold`}>
                                Next: {upcomingCostsLabel} gold
                            </div>
                        ) : null}
                        {isRosterMaxed ? (
                            <div className="ts-shop-tile-warning">Roster cap reached.</div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </section>
    );
});

ShopPanel.displayName = "ShopPanel";
