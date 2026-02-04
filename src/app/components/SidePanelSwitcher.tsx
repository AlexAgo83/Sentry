import { memo, useEffect, useRef, useState } from "react";
import { TabIcon, type TabIconKind } from "../ui/tabIcons";

type SidePanelSwitcherLabels = {
    dungeon: string;
    action: string;
    stats: string;
    roster: string;
    inventory: string;
    equipment: string;
    shop: string;
    quests: string;
};

type TabButtonProps = {
    id: keyof SidePanelSwitcherLabels;
    label: string;
    badge?: string;
    isSelected: boolean;
    variant?: "default" | "dungeon";
    disabled?: boolean;
    tooltip?: string;
    onClick: () => void;
};

const TabButton = memo(({ id, label, badge, isSelected, variant = "default", disabled = false, tooltip, onClick }: TabButtonProps) => {
    const ariaLabel = badge ? `${label} (${badge})` : label;
    const iconKind: TabIconKind = id === "inventory" && label.toLowerCase() === "travel"
        ? "travel"
        : id === "dungeon"
            ? "dungeon"
            : id;
    return (
        <button
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={ariaLabel}
            title={tooltip ?? label}
            className={`ts-chip ts-focusable${isSelected ? " is-active" : ""}${variant === "dungeon" ? " is-dungeon" : ""}${disabled ? " is-disabled" : ""}`}
            disabled={disabled}
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
    isDungeonActive?: boolean;
    onShowDungeon?: () => void;
    isDungeonLocked?: boolean;
    dungeonLockReason?: string;
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
    isDungeonActive,
    onShowDungeon,
    isDungeonLocked = false,
    dungeonLockReason,
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
        dungeon: labels?.dungeon ?? "Dungeon",
        stats: labels?.stats ?? "Stats",
        roster: labels?.roster ?? "Roster",
        inventory: labels?.inventory ?? "Bank",
        equipment: labels?.equipment ?? "Equip",
        shop: labels?.shop ?? "Shop",
        quests: labels?.quests ?? "Quests"
    };

    const canShowDungeon = Boolean(onShowDungeon);
    const dungeonTooltip = dungeonLockReason ?? "Requires 4 heroes to unlock";
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
    const isHeroSelected = !isRosterActive && (
        active === "action"
        || active === "stats"
        || (shouldShowEquipmentInHero && active === "equipment")
        || Boolean(isDungeonActive)
    );
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
                            {canShowDungeon ? (
                                <button
                                    type="button"
                                    role="menuitem"
                                    className={`ts-bank-menu-item ts-bank-menu-item-dungeon${isDungeonActive ? " is-active" : ""}`}
                                    onClick={() => {
                                        if (isDungeonLocked) {
                                            return;
                                        }
                                        setHeroMenuOpen(false);
                                        onShowDungeon?.();
                                    }}
                                    disabled={isDungeonLocked}
                                    title={isDungeonLocked ? dungeonTooltip : resolvedLabels.dungeon}
                                >
                                    <span className="ts-bank-menu-icon" aria-hidden="true">
                                        <TabIcon kind="dungeon" />
                                    </span>
                                    <span className="ts-bank-menu-text">{resolvedLabels.dungeon}</span>
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : (
                <>
                    {canShowDungeon ? (
                        <TabButton
                            id="dungeon"
                            label={resolvedLabels.dungeon}
                            badge={badges?.dungeon}
                            isSelected={Boolean(isDungeonActive)}
                            variant="dungeon"
                            disabled={Boolean(isDungeonLocked)}
                            tooltip={isDungeonLocked ? dungeonTooltip : undefined}
                            onClick={onShowDungeon ?? (() => {})}
                        />
                    ) : null}
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
