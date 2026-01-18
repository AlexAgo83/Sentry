import { memo } from "react";

type SidePanelSwitcherProps = {
    active: "status" | "inventory" | "equipment";
    onShowStatus: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
};

export const SidePanelSwitcher = memo(({
    active,
    onShowStatus,
    onShowInventory,
    onShowEquipment
}: SidePanelSwitcherProps) => (
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
        <button
            type="button"
            role="tab"
            aria-selected={active === "equipment"}
            className={`ts-chip ts-focusable${active === "equipment" ? " is-active" : ""}`}
            onClick={onShowEquipment}
        >
            Equipment
        </button>
    </div>
));

SidePanelSwitcher.displayName = "SidePanelSwitcher";
