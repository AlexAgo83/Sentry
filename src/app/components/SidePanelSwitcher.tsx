import { memo, useEffect, useRef, useState } from "react";

type SidePanelSwitcherLabels = {
    action: string;
    stats: string;
    roster: string;
    inventory: string;
    equipment: string;
    shop: string;
    quests: string;
};

type TabIconKind = keyof SidePanelSwitcherLabels | "hero" | "travel";

type TabIconProps = {
    kind: TabIconKind;
};

const TabIcon = ({ kind }: TabIconProps) => {
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
        case "roster":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="8" cy="9" r="3" />
                    <circle cx="16" cy="9" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20c1.5-3 3.5-4.5 5-4.5s3.5 1.5 5 4.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 20c1.5-3 3.5-4.5 5-4.5s3.5 1.5 5 4.5" />
                </svg>
            );
        case "hero":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="9" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20c2.5-4 5.5-6 7.5-6s5 2 7.5 6" />
                </svg>
            );
        case "inventory":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l2-3h8l2 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12h3" />
                </svg>
            );
        case "travel":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l3 6l-6-3z" />
                </svg>
            );
        case "quests":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h7l3 3v13H7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v3h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
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

type TabButtonProps = {
    id: keyof SidePanelSwitcherLabels;
    label: string;
    badge?: string;
    isSelected: boolean;
    onClick: () => void;
};

const TabButton = memo(({ id, label, badge, isSelected, onClick }: TabButtonProps) => {
    const ariaLabel = badge ? `${label} (${badge})` : label;
    const iconKind: TabIconKind = id === "inventory" && label.toLowerCase() === "travel" ? "travel" : id;
    return (
        <button
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={ariaLabel}
            title={label}
            className={`ts-chip ts-focusable${isSelected ? " is-active" : ""}`}
            onClick={onClick}
            data-testid={`tab-${id}`}
        >
            <span className="ts-chip-icon" aria-hidden="true">
                <TabIcon kind={iconKind} />
            </span>
            <span className="ts-chip-text">{label}</span>
            {badge ? (
                <span className="ts-chip-badge" aria-hidden="true">{badge}</span>
            ) : null}
        </button>
    );
});

TabButton.displayName = "TabButton";

type SidePanelSwitcherProps = {
    active: "action" | "stats" | "inventory" | "equipment" | "shop" | "quests";
    isRosterActive?: boolean;
    onShowAction: () => void;
    onShowStats: () => void;
    onShowRoster?: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    onShowShop: () => void;
    onShowQuests: () => void;
    className?: string;
    labels?: Partial<SidePanelSwitcherLabels>;
    useInventoryMenu?: boolean;
    useHeroMenu?: boolean;
    showRosterButton?: boolean;
    heroLabel?: string;
    heroIncludesEquipment?: boolean;
    inventoryOrder?: "inventory-first" | "equipment-first";
    badges?: Partial<Record<keyof SidePanelSwitcherLabels, string>>;
};

export const SidePanelSwitcher = memo(({
    active,
    isRosterActive,
    onShowAction,
    onShowStats,
    onShowRoster,
    onShowInventory,
    onShowEquipment,
    onShowShop,
    onShowQuests,
    className,
    labels,
    useInventoryMenu = false,
    useHeroMenu = false,
    showRosterButton = false,
    heroLabel,
    heroIncludesEquipment = false,
    inventoryOrder = "inventory-first",
    badges
}: SidePanelSwitcherProps) => {
    const resolvedLabels: SidePanelSwitcherLabels = {
        action: labels?.action ?? "Action",
        stats: labels?.stats ?? "Stats",
        roster: labels?.roster ?? "Roster",
        inventory: labels?.inventory ?? "Bank",
        equipment: labels?.equipment ?? "Equip",
        shop: labels?.shop ?? "Shop",
        quests: labels?.quests ?? "Quests"
    };

    const [isInventoryMenuOpen, setInventoryMenuOpen] = useState(false);
    const [isHeroMenuOpen, setHeroMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const heroMenuRef = useRef<HTMLDivElement | null>(null);
    const shouldShowEquipmentInHero = useHeroMenu && heroIncludesEquipment;
    const isInventorySelected = !isRosterActive && (
        active === "inventory"
        || (!shouldShowEquipmentInHero && active === "equipment")
        || active === "shop"
        || active === "quests"
    );
    const isHeroSelected = !isRosterActive && (active === "action" || active === "stats" || (shouldShowEquipmentInHero && active === "equipment"));
    const resolvedHeroLabel = heroLabel ?? "Hero";
    const inventoryIconKind: TabIconKind =
        resolvedLabels.inventory.toLowerCase() === "travel" ? "travel" : "inventory";

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

    useEffect(() => {
        if (!useHeroMenu || !isHeroMenuOpen) {
            return;
        }
        const handlePointerDown = (event: PointerEvent) => {
            if (!heroMenuRef.current) {
                return;
            }
            if (event.target instanceof Node && !heroMenuRef.current.contains(event.target)) {
                setHeroMenuOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setHeroMenuOpen(false);
            }
        };
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [useHeroMenu, isHeroMenuOpen]);

    useEffect(() => {
        if (!useHeroMenu) {
            return;
        }
        setHeroMenuOpen(false);
    }, [active, useHeroMenu]);

    const rootClassName = `ts-panel-switcher${useInventoryMenu ? " ts-panel-switcher--inventory-menu" : ""}${useHeroMenu ? " ts-panel-switcher--hero-menu" : ""}${showRosterButton ? " ts-panel-switcher--roster" : ""}${className ? ` ${className}` : ""}`;

    return (
        <div className={rootClassName} role="tablist" aria-label="Main panels">
            {showRosterButton ? (
                <TabButton
                    id="roster"
                    label={resolvedLabels.roster}
                    badge={badges?.roster}
                    isSelected={Boolean(isRosterActive)}
                    onClick={onShowRoster ?? (() => {})}
                />
            ) : null}
            {useHeroMenu ? (
                <div className="ts-panel-switcher-item ts-bank-menu ts-hero-menu" ref={heroMenuRef}>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isHeroSelected}
                        aria-label={resolvedHeroLabel}
                        aria-haspopup="menu"
                        aria-expanded={isHeroMenuOpen}
                        title={resolvedHeroLabel}
                        className={`ts-chip ts-focusable${isHeroSelected ? " is-active" : ""}`}
                        onClick={() => setHeroMenuOpen((prev) => !prev)}
                    >
                        <span className="ts-chip-icon" aria-hidden="true">
                            <TabIcon kind="hero" />
                        </span>
                        <span className="ts-chip-text">{resolvedHeroLabel}</span>
                    </button>
                    {isHeroMenuOpen ? (
                        <div className="ts-bank-menu-popover" role="menu" aria-label="Hero panels">
                            {shouldShowEquipmentInHero ? (
                                <button
                                    type="button"
                                    role="menuitem"
                                    className={`ts-bank-menu-item${active === "equipment" ? " is-active" : ""}`}
                                    onClick={() => {
                                        setHeroMenuOpen(false);
                                        onShowEquipment();
                                    }}
                                >
                                    <span className="ts-bank-menu-icon" aria-hidden="true">
                                        <TabIcon kind="equipment" />
                                    </span>
                                    <span className="ts-bank-menu-text">{resolvedLabels.equipment}</span>
                                    {badges?.equipment ? (
                                        <span className="ts-bank-menu-badge" aria-hidden="true">{badges.equipment}</span>
                                    ) : null}
                                </button>
                            ) : null}
                            <button
                                type="button"
                                role="menuitem"
                                className={`ts-bank-menu-item${active === "action" ? " is-active" : ""}`}
                                onClick={() => {
                                    setHeroMenuOpen(false);
                                    onShowAction();
                                }}
                            >
                                <span className="ts-bank-menu-icon" aria-hidden="true">
                                    <TabIcon kind="action" />
                                </span>
                                <span className="ts-bank-menu-text">{resolvedLabels.action}</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className={`ts-bank-menu-item${active === "stats" ? " is-active" : ""}`}
                                onClick={() => {
                                    setHeroMenuOpen(false);
                                    onShowStats();
                                }}
                            >
                                <span className="ts-bank-menu-icon" aria-hidden="true">
                                    <TabIcon kind="stats" />
                                </span>
                                <span className="ts-bank-menu-text">{resolvedLabels.stats}</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <>
                    <TabButton
                        id="action"
                        label={resolvedLabels.action}
                        badge={badges?.action}
                        isSelected={active === "action"}
                        onClick={onShowAction}
                    />
                    <TabButton
                        id="stats"
                        label={resolvedLabels.stats}
                        badge={badges?.stats}
                        isSelected={active === "stats"}
                        onClick={onShowStats}
                    />
                </>
            )}
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
                            <TabIcon kind={inventoryIconKind} />
                        </span>
                        <span className="ts-chip-text">{resolvedLabels.inventory}</span>
                        {badges?.inventory ? (
                            <span className="ts-chip-badge" aria-hidden="true">{badges.inventory}</span>
                        ) : null}
                    </button>
                    {isInventoryMenuOpen ? (
                        <div className="ts-bank-menu-popover" role="menu" aria-label="Bank panels">
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
                                {badges?.shop ? (
                                    <span className="ts-bank-menu-badge" aria-hidden="true">{badges.shop}</span>
                                ) : null}
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className={`ts-bank-menu-item${active === "quests" ? " is-active" : ""}`}
                                onClick={() => {
                                    setInventoryMenuOpen(false);
                                    onShowQuests();
                                }}
                            >
                                <span className="ts-bank-menu-icon" aria-hidden="true">
                                    <TabIcon kind="quests" />
                                </span>
                                <span className="ts-bank-menu-text">{resolvedLabels.quests}</span>
                            </button>
                            {!shouldShowEquipmentInHero ? (
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
                                    {badges?.equipment ? (
                                        <span className="ts-bank-menu-badge" aria-hidden="true">{badges.equipment}</span>
                                    ) : null}
                                </button>
                            ) : null}
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
                                {badges?.inventory ? (
                                    <span className="ts-bank-menu-badge" aria-hidden="true">{badges.inventory}</span>
                                ) : null}
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <>
                    {inventoryOrder === "equipment-first" ? (
                        <>
                            <TabButton
                                id="equipment"
                                label={resolvedLabels.equipment}
                                badge={badges?.equipment}
                                isSelected={active === "equipment"}
                                onClick={onShowEquipment}
                            />
                            <TabButton
                                id="inventory"
                                label={resolvedLabels.inventory}
                                badge={badges?.inventory}
                                isSelected={active === "inventory"}
                                onClick={onShowInventory}
                            />
                        </>
                    ) : (
                        <>
                            <TabButton
                                id="inventory"
                                label={resolvedLabels.inventory}
                                badge={badges?.inventory}
                                isSelected={active === "inventory"}
                                onClick={onShowInventory}
                            />
                            <TabButton
                                id="equipment"
                                label={resolvedLabels.equipment}
                                badge={badges?.equipment}
                                isSelected={active === "equipment"}
                                onClick={onShowEquipment}
                            />
                        </>
                    )}
                    <TabButton
                        id="shop"
                        label={resolvedLabels.shop}
                        badge={badges?.shop}
                        isSelected={active === "shop"}
                        onClick={onShowShop}
                    />
                    <TabButton
                        id="quests"
                        label={resolvedLabels.quests}
                        badge={badges?.quests}
                        isSelected={active === "quests"}
                        onClick={onShowQuests}
                    />
                </>
            )}
        </div>
    );
});

SidePanelSwitcher.displayName = "SidePanelSwitcher";
