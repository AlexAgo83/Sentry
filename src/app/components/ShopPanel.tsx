import { memo } from "react";
import { CollapseIcon } from "../ui/collapseIcon";

type ShopPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
    gold: number;
    rosterLimit: number;
    rosterSlotPrice: number;
    onBuyRosterSlot: () => void;
};

const PLACEHOLDER_TILES = [
    "Placeholder bundle",
    "Placeholder upgrade",
    "Placeholder pack",
    "Placeholder offer",
    "Placeholder slot"
];

export const ShopPanel = memo(({
    isCollapsed,
    onToggleCollapsed,
    gold,
    rosterLimit,
    rosterSlotPrice,
    onBuyRosterSlot
}: ShopPanelProps) => {
    const canBuyRosterSlot = gold >= rosterSlotPrice;

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
                <div className="ts-shop-grid">
                    <div className="ts-shop-tile">
                        <div className="ts-shop-tile-title">Roster slot</div>
                        <div className="ts-shop-tile-subtitle">+1 max hero</div>
                        <div className="ts-shop-tile-meta">Current cap: {rosterLimit}</div>
                        <div className="ts-shop-tile-footer">
                            <span className="ts-shop-tile-price">{rosterSlotPrice} gold</span>
                            <button
                                type="button"
                                className="generic-field button ts-shop-buy ts-focusable"
                                onClick={onBuyRosterSlot}
                                disabled={!canBuyRosterSlot}
                                aria-disabled={!canBuyRosterSlot}
                                title={!canBuyRosterSlot ? "Not enough gold" : `Buy for ${rosterSlotPrice} gold`}
                            >
                                Buy
                            </button>
                        </div>
                    </div>
                    {PLACEHOLDER_TILES.map((label) => (
                        <div key={label} className="ts-shop-tile">
                            <div className="ts-shop-tile-title">{label}</div>
                            <div className="ts-shop-tile-subtitle">Coming soon</div>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
});

ShopPanel.displayName = "ShopPanel";
