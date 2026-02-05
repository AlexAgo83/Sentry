import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { SystemIcon } from "./ui/systemIcon";
import { useRenderCount } from "./dev/renderDebug";

export type AppActiveSidePanel = "action" | "stats" | "inventory" | "equipment" | "shop" | "quests";
export type AppActiveScreen = "main" | "actionSelection" | "dungeon" | "roster";

export interface AppViewProps {
    version: string;
    onOpenSystem: () => void;
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
        onShowDungeon,
        isDungeonLocked,
        onShowStats,
        onShowRoster,
        onShowInventory,
        onShowEquipment,
        onShowShop,
        onShowQuests,
        heroMenuOpenSignal,
        isDungeonRunActive,
        hasNewInventoryItems,
        roster,
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

    return (
        <>
            <header className="app-topbar">
                <div className="app-topbar-surface">
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
                                    className="ts-topbar-switcher"
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
                            ) : null}
                        </div>
                        <div className="app-topbar-right">
                            <button
                                type="button"
                                className="app-version-tag app-version-button ts-focusable"
                                onClick={onOpenSystem}
                                aria-label="Open system telemetry"
                                data-testid="open-system-telemetry"
                            >
                                <span className="app-version-icon" aria-hidden="true">
                                    <SystemIcon />
                                </span>
                                <span>{version}</span>
                            </button>
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
                <nav
                    className="app-bottom-bar"
                    aria-label="Main panels"
                >
                    <SidePanelSwitcher
                        active={activeSidePanel}
                        isDungeonActive={activeScreen === "dungeon"}
                        onShowDungeon={onShowDungeon}
                        isDungeonLocked={isDungeonLocked}
                        isRosterActive={activeScreen === "roster"}
                        onShowRoster={onShowRoster}
                        onShowAction={onShowAction}
                        onShowStats={onShowStats}
                        onShowInventory={onShowInventory}
                        onShowEquipment={onShowEquipment}
                        onShowShop={onShowShop}
                        onShowQuests={onShowQuests}
                        openHeroMenuSignal={heroMenuOpenSignal}
                        badges={{
                            ...(hasNewInventoryItems ? { inventory: "New" } : {}),
                            ...(isDungeonRunActive ? { dungeon: "Live" } : {})
                        }}
                        className="ts-bottombar-switcher"
                        useInventoryMenu
                        useHeroMenu
                        showRosterButton
                        heroIncludesEquipment
                        heroLabel="Hero"
                        labels={{
                            action: "Act",
                            dungeon: "Dungeon",
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
