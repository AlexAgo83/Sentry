import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { useRenderCount } from "./dev/renderDebug";
import { useDialogFocusManagement } from "./hooks/useDialogFocusManagement";

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
    onShowHero: () => void;
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
    const rosterDrawerPanelRef = useRef<HTMLElement | null>(null);
    const rosterDrawerCloseRef = useRef<HTMLButtonElement | null>(null);
    const rosterDrawerTitleId = useId();
    const {
        onOpenSystem,
        isRosterDrawerOpen = false,
        onOpenRosterDrawer,
        onCloseRosterDrawer,
        activeScreen,
        activeSidePanel,
        onShowHero,
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
        dungeonScreen
    } = props;

    useDialogFocusManagement({
        dialogRef: rosterDrawerPanelRef,
        initialFocusRef: rosterDrawerCloseRef,
        isOpen: Boolean(isMobile && isRosterDrawerOpen)
    });

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

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }
        const body = document.body;
        const root = document.documentElement;
        const shouldLock = Boolean(isMobile && isRosterDrawerOpen);
        body.classList.remove("is-roster-drawer-open");
        body.style.removeProperty("overflow");
        body.style.removeProperty("touch-action");
        root.style.removeProperty("overflow");
        if (shouldLock) {
            body.classList.add("is-roster-drawer-open");
            body.style.setProperty("overflow", "hidden");
        }
        return () => {
            body.classList.remove("is-roster-drawer-open");
            body.style.removeProperty("overflow");
            body.style.removeProperty("touch-action");
            root.style.removeProperty("overflow");
        };
    }, [isMobile, isRosterDrawerOpen]);

    useEffect(() => {
        if (!isMobile || !isRosterDrawerOpen) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCloseRosterDrawer?.();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobile, isRosterDrawerOpen, onCloseRosterDrawer]);

    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return;
        }
        const topbar = document.querySelector(".app-topbar") as HTMLElement | null;
        if (!topbar) {
            return;
        }
        const root = document.documentElement;
        const syncTopbarHeight = () => {
            const height = Math.ceil(topbar.getBoundingClientRect().height);
            if (height > 0) {
                root.style.setProperty("--app-topbar-height", `${height}px`);
            }
        };

        syncTopbarHeight();

        const resizeObserver = typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(() => syncTopbarHeight())
            : null;
        resizeObserver?.observe(topbar);
        window.addEventListener("resize", syncTopbarHeight);
        window.visualViewport?.addEventListener("resize", syncTopbarHeight);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener("resize", syncTopbarHeight);
            window.visualViewport?.removeEventListener("resize", syncTopbarHeight);
            root.style.removeProperty("--app-topbar-height");
        };
    }, [isMobile]);

    const showRoster = !isMobile || activeScreen === "roster";
    const showMainStack = !isMobile || activeScreen !== "roster";
    const isSingleColumnLayout = !showRoster || !showMainStack;
    const isHeroPanel = activeSidePanel === "action" || activeSidePanel === "stats" || activeSidePanel === "equipment";
    const showHeroPanelBookmarks = activeScreen === "actionSelection" || (activeScreen === "main" && isHeroPanel);
    const heroBookmarkActivePanel = activeScreen === "actionSelection" ? "action" : activeSidePanel;
    const activeMainPanel = activeSidePanel === "action"
        ? actionPanel
        : activeSidePanel === "stats"
            ? statsPanel
            : activeSidePanel === "inventory"
                ? inventoryPanel
                : activeSidePanel === "equipment"
                    ? equipmentPanel
                    : activeSidePanel === "shop"
                        ? shopPanel
                        : questsPanel;
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
                            <div className="app-title-button">
                                <div className="app-title-block">
                                    <img
                                        className="app-title-icon"
                                        src={`${import.meta.env.BASE_URL}icon_nobg.svg`}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <h1 className="app-title">Sentry</h1>
                                </div>
                            </div>
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
                                    onShowHero={onShowHero}
                                    useHeroShortcut
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
                                    heroLabel="Hero"
                                    controlsId="app-main-view"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main
                id="app-main-view"
                className={`app-layout generic-global ts-layout${isSingleColumnLayout ? " app-layout--single-column" : ""}`}
            >
                {showRoster ? roster : null}
                {showMainStack ? (
                    <div className="ts-main-stack">
                        {activeScreen === "dungeon" ? dungeonScreen : (
                            <div className={`ts-main-panel-content${showHeroPanelBookmarks ? " has-bookmarks" : ""}`}>
                                {showHeroPanelBookmarks ? (
                                    <div className="ts-main-panel-bookmarks" aria-label="Hero panels">
                                        <button
                                            type="button"
                                            className={`ts-main-panel-bookmark ts-focusable${heroBookmarkActivePanel === "action" ? " is-active" : ""}`}
                                            onClick={onShowAction}
                                            aria-pressed={heroBookmarkActivePanel === "action"}
                                            title="Action"
                                        >
                                            Action
                                        </button>
                                        <button
                                            type="button"
                                            className={`ts-main-panel-bookmark ts-focusable${heroBookmarkActivePanel === "stats" ? " is-active" : ""}`}
                                            onClick={onShowStats}
                                            aria-pressed={heroBookmarkActivePanel === "stats"}
                                            title="Stats"
                                        >
                                            Stats
                                        </button>
                                        <button
                                            type="button"
                                            className={`ts-main-panel-bookmark ts-focusable${heroBookmarkActivePanel === "equipment" ? " is-active" : ""}`}
                                            onClick={onShowEquipment}
                                            aria-pressed={heroBookmarkActivePanel === "equipment"}
                                            title="Equip"
                                        >
                                            Equip
                                        </button>
                                    </div>
                                ) : null}
                                <div className="ts-main-panel-content-stack">
                                    {activeScreen === "actionSelection" ? actionSelectionScreen : activeMainPanel}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </main>
            {isMobile ? (
                <div className={`app-roster-drawer${isRosterDrawerOpen ? " is-open" : ""}`}>
                    <button
                        type="button"
                        className="app-roster-drawer-backdrop"
                        aria-label="Dismiss roster overlay"
                        onClick={() => onCloseRosterDrawer?.()}
                    />
                    <aside
                        ref={rosterDrawerPanelRef}
                        className="app-roster-drawer-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={rosterDrawerTitleId}
                        tabIndex={-1}
                    >
                        <div className="app-roster-drawer-header">
                            <div className="app-roster-drawer-header-inner">
                                <div className="app-title-button">
                                    <div className="app-title-block">
                                        <img
                                            className="app-title-icon"
                                            src={`${import.meta.env.BASE_URL}icon_nobg.svg`}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <h2 id={rosterDrawerTitleId} className="app-title app-title--drawer">Sentry</h2>
                                    </div>
                                </div>
                                <button
                                    ref={rosterDrawerCloseRef}
                                    type="button"
                                    className="app-roster-drawer-close ts-focusable"
                                    aria-label="Close roster"
                                    title="Close roster"
                                    onClick={() => onCloseRosterDrawer?.()}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        {rosterDrawer ?? roster}
                    </aside>
                </div>
            ) : null}
        </>
    );
};
