import { memo } from "react";

type SidePanelSwitcherLabels = {
    action: string;
    stats: string;
    inventory: string;
    equipment: string;
};

type SidePanelSwitcherProps = {
    active: "action" | "stats" | "inventory" | "equipment";
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    className?: string;
    labels?: Partial<SidePanelSwitcherLabels>;
};

export const SidePanelSwitcher = memo(({
    active,
    onShowAction,
    onShowStats,
    onShowInventory,
    onShowEquipment,
    className,
    labels
}: SidePanelSwitcherProps) => {
    const resolvedLabels: SidePanelSwitcherLabels = {
        action: labels?.action ?? "Action",
        stats: labels?.stats ?? "Stats",
        inventory: labels?.inventory ?? "Bank",
        equipment: labels?.equipment ?? "Equip"
    };

    const rootClassName = `ts-panel-switcher${className ? ` ${className}` : ""}`;

    const TabIcon = ({ kind }: { kind: keyof SidePanelSwitcherLabels }) => {
        switch (kind) {
            case "action":
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
                        />
                    </svg>
                );
            case "stats":
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
                    </svg>
                );
            case "inventory":
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 8V7a5 5 0 0 1 10 0v1m-12 0h14l-1 13H6L5 8z"
                        />
                    </svg>
                );
            case "equipment":
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4z"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    const TabButton = (props: {
        id: keyof SidePanelSwitcherLabels;
        isSelected: boolean;
        onClick: () => void;
    }) => {
        const label = resolvedLabels[props.id];
        return (
            <button
                type="button"
                role="tab"
                aria-selected={props.isSelected}
                aria-label={label}
                title={label}
                className={`ts-chip ts-focusable${props.isSelected ? " is-active" : ""}`}
                onClick={props.onClick}
            >
                <span className="ts-chip-icon" aria-hidden="true">
                    <TabIcon kind={props.id} />
                </span>
                <span className="ts-chip-text">{label}</span>
            </button>
        );
    };

    return (
        <div className={rootClassName} role="tablist" aria-label="Main panels">
            <TabButton id="action" isSelected={active === "action"} onClick={onShowAction} />
            <TabButton id="stats" isSelected={active === "stats"} onClick={onShowStats} />
            <TabButton id="inventory" isSelected={active === "inventory"} onClick={onShowInventory} />
            <TabButton id="equipment" isSelected={active === "equipment"} onClick={onShowEquipment} />
        </div>
    );
});

SidePanelSwitcher.displayName = "SidePanelSwitcher";
