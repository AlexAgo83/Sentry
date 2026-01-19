import type { CSSProperties } from "react";
import type { EquipmentSlotId, PlayerState, RecipeState, SkillId, SkillState, StatId, StatModifier, PlayerStatsState } from "../core/types";
import type { InventorySort } from "./components/InventoryPanel";
import type { InventoryViewState } from "./hooks/useInventoryView";
import { SKILL_DEFINITIONS } from "../data/definitions";
import { EQUIPMENT_DEFINITIONS } from "../data/equipment";
import { createPlayerEquipmentState } from "../core/equipment";
import { ActionStatusPanel } from "./components/ActionStatusPanel";
import { CharacterStatsPanel } from "./components/CharacterStatsPanel";
import { EquipmentPanel } from "./components/EquipmentPanel";
import { InventoryPanel } from "./components/InventoryPanel";
import { RosterPanel } from "./components/RosterPanel";
import { SidePanelSwitcher } from "./components/SidePanelSwitcher";
import { getSkillIconColor } from "./ui/skillColors";
import { useRenderCount } from "./dev/renderDebug";

export type AppActiveSidePanel = "action" | "stats" | "inventory" | "equipment";

type ActionProgressStyles = {
    progressStyle: CSSProperties;
    staminaStyle: CSSProperties;
    skillStyle: CSSProperties;
    recipeStyle: CSSProperties;
};

export interface AppViewProps {
    version: string;
    players: PlayerState[];
    activePlayerId: string;
    activePlayer: PlayerState | null;
    getSkillLabel: (skillId: SkillId | "") => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
    isRosterCollapsed: boolean;
    onToggleRosterCollapsed: () => void;
    onSetActivePlayer: (playerId: string) => void;
    onAddPlayer: () => void;
    onOpenSystem: () => void;
    activeSidePanel: AppActiveSidePanel;
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    actionPanel: {
        activeSkillId: SkillId | "";
        activeSkillName: string;
        activeRecipeLabel: string;
        activeConsumptionLabel: string;
        activeProductionLabel: string;
        actionDurationLabel: string;
        actionXpLabel: string;
        resourceHint: string | null;
        progressPercent: number;
        styles: ActionProgressStyles;
        staminaPercent: number;
        skillPercent: number;
        recipePercent: number;
        staminaCurrent: number;
        staminaMax: number;
        activeSkill: SkillState | null;
        activeRecipe: RecipeState | null;
        isStunned: boolean;
        isCollapsed: boolean;
        onToggleCollapsed: () => void;
        onChangeAction: () => void;
        canChangeAction: boolean;
    };
    statsPanel: {
        skillLevels: Partial<Record<SkillId, number>>;
        stats: PlayerStatsState;
        effectiveStats: Record<StatId, number>;
        equipmentMods: StatModifier[];
        now: number;
        isCollapsed: boolean;
        onToggleCollapsed: () => void;
        onRenameHero: () => void;
        canRenameHero: boolean;
    };
    inventoryPanel: {
        view: InventoryViewState;
        selectedItemId: string | null;
        isCollapsed: boolean;
        onToggleCollapsed: () => void;
        sort: InventorySort;
        search: string;
        page: number;
        onSelectItem: (itemId: string) => void;
        onClearSelection: () => void;
        onSortChange: (value: InventorySort) => void;
        onSearchChange: (value: string) => void;
        onPageChange: (page: number) => void;
        emptyState: string;
        selectionHint: string | null;
    };
    equipmentPanel: {
        inventoryItems: Record<string, number>;
        isCollapsed: boolean;
        onToggleCollapsed: () => void;
        onEquipItem: (itemId: string) => void;
        onUnequipSlot: (slot: EquipmentSlotId) => void;
    };
}

export const AppView = (props: AppViewProps) => {
    useRenderCount("AppView");
    const {
        version,
        players,
        activePlayerId,
        activePlayer,
        getSkillLabel,
        getRecipeLabel,
        isRosterCollapsed,
        onToggleRosterCollapsed,
        onSetActivePlayer,
        onAddPlayer,
        onOpenSystem,
        activeSidePanel,
        onShowAction,
        onShowStats,
        onShowInventory,
        onShowEquipment,
        actionPanel,
        statsPanel,
        inventoryPanel,
        equipmentPanel,
    } = props;

    const {
        view: inventoryView,
        selectedItemId,
        isCollapsed: isInventoryCollapsed,
        onToggleCollapsed: onToggleInventoryCollapsed,
        sort,
        search,
        page,
        onSelectItem,
        onClearSelection,
        onSortChange,
        onSearchChange,
        onPageChange,
        emptyState,
        selectionHint,
    } = inventoryPanel;

    const skillIconColor = getSkillIconColor(actionPanel.activeSkillId);

    const activeRecipeMeta = actionPanel.activeRecipe;
    const actionProgressProps = actionPanel.styles;

    return (
        <>
            <header className="app-header">
                <div className="app-title-block">
                    <h1 className="app-title">Sentry Idle</h1>
                    <p className="app-subtitle">Forge, hunt, and master your path.</p>
                </div>
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
            </header>
            <main className="app-layout generic-global ts-layout">
                <RosterPanel
                    players={players}
                    activePlayerId={activePlayerId}
                    isCollapsed={isRosterCollapsed}
                    onToggleCollapsed={onToggleRosterCollapsed}
                    onSetActivePlayer={onSetActivePlayer}
                    onAddPlayer={onAddPlayer}
                    getSkillLabel={getSkillLabel}
                    getRecipeLabel={getRecipeLabel}
                />
                <div className="ts-main-stack">
                    <SidePanelSwitcher
                        active={activeSidePanel}
                        onShowAction={onShowAction}
                        onShowStats={onShowStats}
                        onShowInventory={onShowInventory}
                        onShowEquipment={onShowEquipment}
                    />
                    {activeSidePanel === "action" ? (
                        <ActionStatusPanel
                            activeSkillId={actionPanel.activeSkillId}
                            activeSkillName={actionPanel.activeSkillName}
                            activeRecipeLabel={actionPanel.activeRecipeLabel}
                            activeConsumptionLabel={actionPanel.activeConsumptionLabel}
                            activeProductionLabel={actionPanel.activeProductionLabel}
                            actionDurationLabel={actionPanel.actionDurationLabel}
                            actionXpLabel={actionPanel.actionXpLabel}
                            resourceHint={actionPanel.resourceHint}
                            progressPercent={actionPanel.progressPercent}
                            {...actionProgressProps}
                            staminaPercent={actionPanel.staminaPercent}
                            skillPercent={actionPanel.skillPercent}
                            recipePercent={actionPanel.recipePercent}
                            staminaCurrent={actionPanel.staminaCurrent}
                            staminaMax={actionPanel.staminaMax}
                            activeSkillLevel={actionPanel.activeSkill?.level ?? 0}
                            activeSkillXp={actionPanel.activeSkill?.xp ?? 0}
                            activeSkillXpNext={actionPanel.activeSkill?.xpNext ?? 0}
                            activeRecipeLevel={activeRecipeMeta?.level ?? 0}
                            activeRecipeXp={activeRecipeMeta?.xp ?? 0}
                            activeRecipeXpNext={activeRecipeMeta?.xpNext ?? 0}
                            isStunned={actionPanel.isStunned}
                            skillIconColor={skillIconColor}
                            isCollapsed={actionPanel.isCollapsed}
                            onToggleCollapsed={actionPanel.onToggleCollapsed}
                            onChangeAction={actionPanel.onChangeAction}
                            canChangeAction={actionPanel.canChangeAction}
                        />
                    ) : null}
                    {activeSidePanel === "stats" ? (
                        <CharacterStatsPanel
                            skills={SKILL_DEFINITIONS}
                            skillLevels={statsPanel.skillLevels}
                            stats={statsPanel.stats}
                            effectiveStats={statsPanel.effectiveStats}
                            equipmentMods={statsPanel.equipmentMods}
                            now={statsPanel.now}
                            isCollapsed={statsPanel.isCollapsed}
                            onToggleCollapsed={statsPanel.onToggleCollapsed}
                            onRenameHero={statsPanel.onRenameHero}
                            canRenameHero={statsPanel.canRenameHero}
                        />
                    ) : null}
                    {activeSidePanel === "inventory" ? (
                        <InventoryPanel
                            isCollapsed={isInventoryCollapsed}
                            onToggleCollapsed={onToggleInventoryCollapsed}
                            entries={inventoryView.visibleEntries}
                            gridEntries={inventoryView.pageEntries}
                            selectedItem={inventoryView.selectedItem}
                            selectedItemId={selectedItemId}
                            onSelectItem={onSelectItem}
                            onClearSelection={onClearSelection}
                            sort={sort}
                            onSortChange={onSortChange}
                            search={search}
                            onSearchChange={onSearchChange}
                            page={page}
                            pageCount={inventoryView.pageCount}
                            onPageChange={onPageChange}
                            totalItems={inventoryView.visibleEntries.length}
                            emptyState={emptyState}
                            selectionHint={selectionHint}
                        />
                    ) : null}
                    {activeSidePanel === "equipment" ? (
                        <EquipmentPanel
                            isCollapsed={equipmentPanel.isCollapsed}
                            onToggleCollapsed={equipmentPanel.onToggleCollapsed}
                            equipment={activePlayer?.equipment ?? createPlayerEquipmentState()}
                            inventoryItems={equipmentPanel.inventoryItems}
                            definitions={EQUIPMENT_DEFINITIONS}
                            onEquipItem={equipmentPanel.onEquipItem}
                            onUnequipSlot={equipmentPanel.onUnequipSlot}
                        />
                    ) : null}
                </div>
            </main>
        </>
    );
};
