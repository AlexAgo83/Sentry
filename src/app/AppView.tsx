import type { ReactNode } from "react";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { useRenderCount } from "./dev/renderDebug";

export type AppActiveSidePanel = "action" | "stats" | "inventory" | "equipment";

export interface AppViewProps {
    version: string;
    onOpenSystem: () => void;
    onOpenDevTools: () => void;
    activeSidePanel: AppActiveSidePanel;
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    roster: ReactNode;
    actionPanel: ReactNode;
    statsPanel: ReactNode;
    inventoryPanel: ReactNode;
    equipmentPanel: ReactNode;
}

export const AppView = (props: AppViewProps) => {
    useRenderCount("AppView");
    const {
        version,
        onOpenSystem,
        onOpenDevTools,
        activeSidePanel,
        onShowAction,
        onShowStats,
        onShowInventory,
        onShowEquipment,
        roster,
        actionPanel,
        statsPanel,
        inventoryPanel,
        equipmentPanel,
    } = props;

    return (
        <>
            <header className="app-header">
                <div className="app-title-block">
                    <h1 className="app-title">Sentry Idle</h1>
                    <p className="app-subtitle">Forge, hunt, and master your path.</p>
                </div>
                <div className="app-header-actions">
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
                    {import.meta.env.DEV ? (
                        <button
                            type="button"
                            className="app-version-tag app-version-button ts-focusable"
                            onClick={onOpenDevTools}
                            aria-label="Open dev tools"
                        >
                            <span className="app-version-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 6.5l7 7m-10 1l3-3m6-6l2-2m-1.5 1.5l1 1m-10.5 10.5l1 1m-2-2l2-2"
                                    />
                                </svg>
                            </span>
                            <span>Dev</span>
                        </button>
                    ) : null}
                </div>
            </header>
            <main className="app-layout generic-global ts-layout">
                {roster}
                <div className="ts-main-stack">
                    <SidePanelSwitcher
                        active={activeSidePanel}
                        onShowAction={onShowAction}
                        onShowStats={onShowStats}
                        onShowInventory={onShowInventory}
                        onShowEquipment={onShowEquipment}
                    />
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
                </div>
            </main>
        </>
    );
};
