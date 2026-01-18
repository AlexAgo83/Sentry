import { memo } from "react";

type SidePanelSwitcherProps = {
    active: "status" | "inventory";
    onShowStatus: () => void;
    onShowInventory: () => void;
};

export const SidePanelSwitcher = memo(({ active, onShowStatus, onShowInventory }: SidePanelSwitcherProps) => (
    <div className="ts-panel-switcher" role="tablist" aria-label="Main panels">
        <button
            type="button"
            role="tab"
            aria-selected={active === "status"}
            className={`ts-chip ts-focusable${active === "status" ? " is-active" : ""}`}
            onClick={onShowStatus}
        >
            Action/Stats
        </button>
        <button
            type="button"
            role="tab"
            aria-selected={active === "inventory"}
            className={`ts-chip ts-focusable${active === "inventory" ? " is-active" : ""}`}
            onClick={onShowInventory}
        >
            Inventory
        </button>
    </div>
));

SidePanelSwitcher.displayName = "SidePanelSwitcher";
