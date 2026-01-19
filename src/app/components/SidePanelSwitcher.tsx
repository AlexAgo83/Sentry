import { memo } from "react";

type SidePanelSwitcherProps = {
    active: "action" | "stats" | "inventory" | "equipment";
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
};

export const SidePanelSwitcher = memo(({
    active,
    onShowAction,
    onShowStats,
    onShowInventory,
    onShowEquipment
}: SidePanelSwitcherProps) => (
    <div className="ts-panel-switcher" role="tablist" aria-label="Main panels">
        <button
            type="button"
            role="tab"
            aria-selected={active === "action"}
            className={`ts-chip ts-focusable${active === "action" ? " is-active" : ""}`}
            onClick={onShowAction}
        >
            Action
        </button>
        <button
            type="button"
            role="tab"
            aria-selected={active === "stats"}
            className={`ts-chip ts-focusable${active === "stats" ? " is-active" : ""}`}
            onClick={onShowStats}
        >
            Stats
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
            Equip
        </button>
    </div>
));

SidePanelSwitcher.displayName = "SidePanelSwitcher";
