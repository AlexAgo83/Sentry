import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { useRenderCount } from "./dev/renderDebug";

export type AppActiveSidePanel = "action" | "stats" | "inventory" | "equipment" | "shop" | "quests";
export type AppActiveScreen = "main" | "actionSelection" | "roster";

export interface AppViewProps {
    version: string;
    onOpenSystem: () => void;
    activeScreen: AppActiveScreen;
    activeSidePanel: AppActiveSidePanel;
    onShowAction: () => void;
    onShowStats: () => void;
    onShowRoster: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    onShowShop: () => void;
    onShowQuests: () => void;
    hasNewInventoryItems: boolean;
    roster: ReactNode;
    actionPanel: ReactNode;
    statsPanel: ReactNode;
    inventoryPanel: ReactNode;
    equipmentPanel: ReactNode;
    shopPanel: ReactNode;
    questsPanel: ReactNode;
    actionSelectionScreen: ReactNode;
}

export const AppView = (props: AppViewProps) => {
    useRenderCount("AppView");
    const [isMobile, setIsMobile] = useState(() => (
        typeof window !== "undefined" ? window.innerWidth <= 720 : false
    ));

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const maxWidth = 720;
        const mediaQuery = window.matchMedia ? window.matchMedia(`(max-width: ${maxWidth}px)`) : null;
        if (!mediaQuery) {
            const onResize = () => setIsMobile(window.innerWidth <= maxWidth);
            window.addEventListener("resize", onResize);
            onResize();
            return () => window.removeEventListener("resize", onResize);
        }

        const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
        setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const {
        version,
        onOpenSystem,
        activeScreen,
        activeSidePanel,
        onShowAction,
        onShowStats,
        onShowRoster,
        onShowInventory,
        onShowEquipment,
        onShowShop,
        onShowQuests,
        hasNewInventoryItems,
        roster,
        actionPanel,
        statsPanel,
        inventoryPanel,
        equipmentPanel,
        shopPanel,
        questsPanel,
        actionSelectionScreen,
    } = props;

    const showRoster = !isMobile || activeScreen === "roster";
    const showMainStack = !isMobile || activeScreen !== "roster";

    return (
        <>
            <header className="app-topbar">
                <div className="app-topbar-inner">
                    <div className="app-topbar-left">
                        <div className="app-title-block">
                            <h1 className="app-title">Sentry</h1>
                        </div>
                    </div>
                    <div className="app-topbar-center">
                        {!isMobile ? (
                            <SidePanelSwitcher
                                active={activeSidePanel}
                                onShowAction={onShowAction}
                                onShowStats={onShowStats}
                                onShowInventory={onShowInventory}
                                onShowEquipment={onShowEquipment}
                                onShowShop={onShowShop}
                                onShowQuests={onShowQuests}
                                badges={hasNewInventoryItems ? { inventory: "New" } : undefined}
                                className="ts-topbar-switcher"
                                inventoryOrder="equipment-first"
                                labels={{
                                    action: "Action",
                                    stats: "Stats",
                                    inventory: "Inv",
                                    equipment: "Equip",
                                    shop: "Shop",
                                    quests: "Quests"
                                }}
                            />
                        ) : null}
                    </div>
                    <div className="app-topbar-right">
                        <button
                            type="button"
                            className="app-version-tag app-version-button ts-focusable"
                            onClick={onOpenSystem}
                            aria-label="Open system telemetry"
                        >
                            <span className="app-version-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.983 3.5l1.2 1.7a6.9 6.9 0 0 1 2.16.9l1.96-.64 1.5 2.6-1.4 1.46c.2.7.3 1.4.3 2.18s-.1 1.48-.3 2.18l1.4 1.46-1.5 2.6-1.96-.64a6.9 6.9 0 0 1-2.16.9l-1.2 1.7h-3l-1.2-1.7a6.9 6.9 0 0 1-2.16-.9l-1.96.64-1.5-2.6 1.4-1.46a7.6 7.6 0 0 1-.3-2.18c0-.78.1-1.48.3-2.18l-1.4-1.46 1.5-2.6 1.96.64a6.9 6.9 0 0 1 2.16-.9l1.2-1.7h3z"
                                    />
                                    <circle cx="12" cy="12" r="3.3" />
                                </svg>
                            </span>
                            <span>{version}</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="app-layout generic-global ts-layout">
                {showRoster ? roster : null}
                {showMainStack ? (
                    <div className="ts-main-stack">
                        {activeScreen === "actionSelection"
                            ? actionSelectionScreen
                            : (
                                <>
                                    {activeSidePanel === "action" ? (
                                        actionPanel
                                    ) : null}
                                    {activeSidePanel === "stats" ? (
                                        statsPanel
                                    ) : null}
                                    {activeSidePanel === "inventory" ? (
                                        inventoryPanel
                                    ) : null}
                                    {activeSidePanel === "equipment" ? (
                                        equipmentPanel
                                    ) : null}
                                    {activeSidePanel === "shop" ? (
                                        shopPanel
                                    ) : null}
                                    {activeSidePanel === "quests" ? (
                                        questsPanel
                                    ) : null}
                                </>
                            )}
                    </div>
                ) : null}
            </main>
            {isMobile ? (
                <nav
                    className="app-bottom-bar"
                    aria-label="Main panels"
                >
                    <SidePanelSwitcher
                        active={activeSidePanel}
                        isRosterActive={activeScreen === "roster"}
                        onShowRoster={onShowRoster}
                        onShowAction={onShowAction}
                        onShowStats={onShowStats}
                        onShowInventory={onShowInventory}
                        onShowEquipment={onShowEquipment}
                        onShowShop={onShowShop}
                        onShowQuests={onShowQuests}
                        badges={hasNewInventoryItems ? { inventory: "New" } : undefined}
                        className="ts-bottombar-switcher"
                        useInventoryMenu
                        useHeroMenu
                        showRosterButton
                        heroIncludesEquipment
                        heroLabel="Hero"
                        labels={{
                            action: "Act",
                            stats: "Stats",
                            roster: "Roster",
                            inventory: "Travel",
                            equipment: "Equip",
                            shop: "Shop",
                            quests: "Quests"
                        }}
                    />
                </nav>
            ) : null}
        </>
    );
};
