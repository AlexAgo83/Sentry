import { memo } from "react";
import { CollapseIcon } from "../ui/collapseIcon";

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
    const formatGoldFull = (value: number): string => {
        if (!Number.isFinite(value)) {
            return "0";
        }
        return Math.max(0, Math.floor(value)).toLocaleString();
    };
    const formatGoldCompact = (value: number): string => {
        if (!Number.isFinite(value)) {
            return "0";
        }
        const safeValue = Math.max(0, value);
        const units = [
            { threshold: 1e12, suffix: "T" },
            { threshold: 1e9, suffix: "B" },
            { threshold: 1e6, suffix: "M" },
            { threshold: 1e3, suffix: "K" }
        ];
        for (const unit of units) {
            if (safeValue >= unit.threshold) {
                const scaled = safeValue / unit.threshold;
                const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
                const trimmed = scaled.toFixed(decimals).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
                return `${trimmed}${unit.suffix}`;
            }
        }
        return String(Math.round(safeValue));
    };
    const formattedRosterSlotPrice = formatGoldCompact(rosterSlotPrice);
    const formattedRosterSlotFullPrice = formatGoldFull(rosterSlotPrice);
    const upcomingCostsLabel = rosterSlotUpcomingCosts.length > 0
        ? rosterSlotUpcomingCosts.map((cost) => formatGoldCompact(cost)).join(" / ")
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
                    </div>
                </div>
            ) : null}
        </section>
    );
});

ShopPanel.displayName = "ShopPanel";
