import { memo, useEffect, useRef, useState } from "react";

type SidePanelSwitcherLabels = {
    action: string;
    stats: string;
    inventory: string;
    equipment: string;
    shop: string;
};

type SidePanelSwitcherProps = {
    active: "action" | "stats" | "inventory" | "equipment" | "shop";
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    onShowShop: () => void;
    className?: string;
    labels?: Partial<SidePanelSwitcherLabels>;
    useInventoryMenu?: boolean;
    inventoryOrder?: "inventory-first" | "equipment-first";
};

export const SidePanelSwitcher = memo(({
    active,
    onShowAction,
    onShowStats,
    onShowInventory,
    onShowEquipment,
    onShowShop,
    className,
    labels,
    useInventoryMenu = false,
    inventoryOrder = "inventory-first"
}: SidePanelSwitcherProps) => {
    const resolvedLabels: SidePanelSwitcherLabels = {
        action: labels?.action ?? "Action",
        stats: labels?.stats ?? "Stats",
        inventory: labels?.inventory ?? "Bank",
        equipment: labels?.equipment ?? "Equip",
        shop: labels?.shop ?? "Shop"
    };

    const [isInventoryMenuOpen, setInventoryMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isInventorySelected = active === "inventory" || active === "equipment" || active === "shop";

    useEffect(() => {
        if (!useInventoryMenu || !isInventoryMenuOpen) {
            return;
        }
        const handlePointerDown = (event: PointerEvent) => {
            if (!menuRef.current) {
                return;
            }
            if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
                setInventoryMenuOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setInventoryMenuOpen(false);
            }
        };
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [useInventoryMenu, isInventoryMenuOpen]);

    useEffect(() => {
        if (!useInventoryMenu) {
            return;
        }
        setInventoryMenuOpen(false);
    }, [active, useInventoryMenu]);

    const rootClassName = `ts-panel-switcher${useInventoryMenu ? " ts-panel-switcher--inventory-menu" : ""}${className ? ` ${className}` : ""}`;

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
            case "shop":
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V5a4 4 0 0 1 8 0v2"
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
            {useInventoryMenu ? (
                <div className="ts-panel-switcher-item ts-bank-menu" ref={menuRef}>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isInventorySelected}
                        aria-label={resolvedLabels.inventory}
                        aria-haspopup="menu"
                        aria-expanded={isInventoryMenuOpen}
                        title={resolvedLabels.inventory}
                        className={`ts-chip ts-focusable${isInventorySelected ? " is-active" : ""}`}
                        onClick={() => setInventoryMenuOpen((prev) => !prev)}
                    >
                        <span className="ts-chip-icon" aria-hidden="true">
                            <TabIcon kind="inventory" />
                        </span>
                        <span className="ts-chip-text">{resolvedLabels.inventory}</span>
                    </button>
                    {isInventoryMenuOpen ? (
                        <div className="ts-bank-menu-popover" role="menu" aria-label="Bank panels">
                            <button
                                type="button"
                                role="menuitem"
                                className={`ts-bank-menu-item${active === "inventory" ? " is-active" : ""}`}
                                onClick={() => {
                                    setInventoryMenuOpen(false);
                                    onShowInventory();
                                }}
                            >
                                <span className="ts-bank-menu-icon" aria-hidden="true">
                                    <TabIcon kind="inventory" />
                                </span>
                                <span className="ts-bank-menu-text">Inventory</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className={`ts-bank-menu-item${active === "equipment" ? " is-active" : ""}`}
                                onClick={() => {
                                    setInventoryMenuOpen(false);
                                    onShowEquipment();
                                }}
                            >
                                <span className="ts-bank-menu-icon" aria-hidden="true">
                                    <TabIcon kind="equipment" />
                                </span>
                                <span className="ts-bank-menu-text">Equipment</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className={`ts-bank-menu-item${active === "shop" ? " is-active" : ""}`}
                                onClick={() => {
                                    setInventoryMenuOpen(false);
                                    onShowShop();
                                }}
                            >
                                <span className="ts-bank-menu-icon" aria-hidden="true">
                                    <TabIcon kind="shop" />
                                </span>
                                <span className="ts-bank-menu-text">Shop</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <>
                    {inventoryOrder === "equipment-first" ? (
                        <>
                            <TabButton id="equipment" isSelected={active === "equipment"} onClick={onShowEquipment} />
                            <TabButton id="inventory" isSelected={active === "inventory"} onClick={onShowInventory} />
                        </>
                    ) : (
                        <>
                            <TabButton id="inventory" isSelected={active === "inventory"} onClick={onShowInventory} />
                            <TabButton id="equipment" isSelected={active === "equipment"} onClick={onShowEquipment} />
                        </>
                    )}
                    <TabButton id="shop" isSelected={active === "shop"} onClick={onShowShop} />
                </>
            )}
        </div>
    );
});

SidePanelSwitcher.displayName = "SidePanelSwitcher";
