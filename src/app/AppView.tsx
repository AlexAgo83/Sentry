import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { useRenderCount } from "./dev/renderDebug";

export type AppActiveSidePanel = "action" | "stats" | "inventory" | "equipment" | "shop" | "quests";
export type AppActiveScreen = "main" | "actionSelection" | "dungeon" | "roster";

export interface AppViewProps {
    version: string;
    onOpenSystem: () => void;
    isRosterDrawerOpen?: boolean;
    onOpenRosterDrawer?: () => void;
    onCloseRosterDrawer?: () => void;
    activeScreen: AppActiveScreen;
    activeSidePanel: AppActiveSidePanel;
    onShowAction: () => void;
    onShowDungeon: () => void;
    isDungeonLocked: boolean;
    onShowStats: () => void;
    onShowRoster: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    onShowShop: () => void;
    onShowQuests: () => void;
    heroMenuOpenSignal?: number;
    isDungeonRunActive: boolean;
    hasNewInventoryItems: boolean;
    roster: ReactNode;
    rosterDrawer?: ReactNode;
    actionPanel: ReactNode;
    statsPanel: ReactNode;
    inventoryPanel: ReactNode;
    equipmentPanel: ReactNode;
    shopPanel: ReactNode;
    questsPanel: ReactNode;
    actionSelectionScreen: ReactNode;
    dungeonScreen: ReactNode;
}

export const AppView = (props: AppViewProps) => {
    useRenderCount("AppView");
    const [isMobile, setIsMobile] = useState(() => (
        typeof window !== "undefined" ? window.innerWidth <= 900 : false
    ));

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const maxWidth = 900;
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
        onOpenSystem,
        isRosterDrawerOpen = false,
        onOpenRosterDrawer,
        onCloseRosterDrawer,
        activeScreen,
        activeSidePanel,
        onShowAction,
        onShowDungeon,
        isDungeonLocked,
        onShowStats,
        onShowInventory,
        onShowEquipment,
        onShowShop,
        onShowQuests,
        isDungeonRunActive,
        hasNewInventoryItems,
        roster,
        rosterDrawer,
        actionPanel,
        statsPanel,
        inventoryPanel,
        equipmentPanel,
        shopPanel,
        questsPanel,
        actionSelectionScreen,
        dungeonScreen,
    } = props;

    const showRoster = !isMobile || activeScreen === "roster";
    const showMainStack = !isMobile || activeScreen !== "roster";
    const handleToggleRosterDrawer = () => {
        if (!onOpenRosterDrawer) {
            onOpenSystem();
            return;
        }
        if (isRosterDrawerOpen) {
            onCloseRosterDrawer?.();
        } else {
            onOpenRosterDrawer();
        }
    };

    return (
        <>
            <header className="app-topbar">
                <div className="app-topbar-surface">
                    <div className="app-topbar-inner">
                        <div className="app-topbar-left">
                            <button
                                type="button"
                                className="app-title-button ts-focusable"
                                onClick={onOpenSystem}
                                aria-label="Open settings"
                            >
                                <div className="app-title-block">
                                    <img
                                        className="app-title-icon"
                                        src={`${import.meta.env.BASE_URL}icon_nobg.svg`}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <h1 className="app-title">Sentry</h1>
                                </div>
                            </button>
                        </div>
                        <div className="app-topbar-center">
                            <div className="app-topbar-actions">
                                {isMobile ? (
                                    <button
                                        type="button"
                                        className="ts-chip ts-focusable ts-topbar-sentry-button"
                                        onClick={handleToggleRosterDrawer}
                                        aria-label="Open roster"
                                    >
                                        <span className="ts-chip-icon" aria-hidden="true">
                                            <img
                                                className="ts-topbar-sentry-icon"
                                                src={`${import.meta.env.BASE_URL}icon_nobg.svg`}
                                                alt=""
                                            />
                                        </span>
                                    </button>
                                ) : null}
                                <SidePanelSwitcher
                                    active={activeSidePanel}
                                    isDungeonActive={activeScreen === "dungeon"}
                                    onShowDungeon={onShowDungeon}
                                    isDungeonLocked={isDungeonLocked}
                                    onShowAction={onShowAction}
                                    onShowStats={onShowStats}
                                    onShowInventory={onShowInventory}
                                    onShowEquipment={onShowEquipment}
                                    onShowShop={onShowShop}
                                    onShowQuests={onShowQuests}
                                    badges={{
                                        ...(hasNewInventoryItems ? { inventory: "New" } : {}),
                                        ...(isDungeonRunActive ? { dungeon: "Live" } : {})
                                    }}
                                    className={`ts-topbar-switcher${isMobile ? " ts-topbar-switcher--mobile" : ""}`}
                                    inventoryOrder="equipment-first"
                                    labels={{
                                        action: "Action",
                                        dungeon: "Dungeon",
                                        stats: "Stats",
                                        inventory: "Inv",
                                        equipment: "Equip",
                                        shop: "Shop",
                                        quests: "Quests"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="app-layout generic-global ts-layout">
                {showRoster ? roster : null}
                {showMainStack ? (
                    <div className="ts-main-stack">
                        {activeScreen === "actionSelection"
                            ? actionSelectionScreen
                            : activeScreen === "dungeon"
                                ? dungeonScreen
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
                <div className={`app-roster-drawer${isRosterDrawerOpen ? " is-open" : ""}`}>
                    <button
                        type="button"
                        className="app-roster-drawer-backdrop"
                        aria-label="Close roster"
                        onClick={() => onCloseRosterDrawer?.()}
                    />
                    <aside className="app-roster-drawer-panel" role="dialog" aria-label="Roster">
                        <div className="app-roster-drawer-header">
                            <div className="app-title-button">
                                <div className="app-title-block">
                                    <img
                                        className="app-title-icon"
                                        src={`${import.meta.env.BASE_URL}icon_nobg.svg`}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <h2 className="app-title app-title--drawer">Sentry</h2>
                                </div>
                            </div>
                        </div>
                        {rosterDrawer ?? roster}
                    </aside>
                </div>
            ) : null}
        </>
    );
};
