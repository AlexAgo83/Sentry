import { memo } from "react";
import { CollapseIcon } from "../ui/collapseIcon";

type ShopPanelProps = {
    isCollapsed: boolean;
    onToggleCollapsed: () => void;
};

const PLACEHOLDER_TILES = [
    "Placeholder item",
    "Placeholder bundle",
    "Placeholder upgrade",
    "Placeholder pack",
    "Placeholder offer",
    "Placeholder slot"
];

export const ShopPanel = memo(({ isCollapsed, onToggleCollapsed }: ShopPanelProps) => {
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
