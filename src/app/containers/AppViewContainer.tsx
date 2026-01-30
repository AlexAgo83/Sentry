import type { SkillId } from "../../core/types";
import { AppView, type AppActiveScreen, type AppActiveSidePanel } from "../AppView";
import { ActionPanelContainer } from "./ActionPanelContainer";
import { ActionSelectionScreenContainer } from "./ActionSelectionScreenContainer";
import { EquipmentPanelContainer } from "./EquipmentPanelContainer";
import { InventoryPanelContainer } from "./InventoryPanelContainer";
import { RosterContainer } from "./RosterContainer";
import { ShopPanelContainer } from "./ShopPanelContainer";
import { StatsPanelContainer } from "./StatsPanelContainer";
import { DevProfiler } from "../dev/renderDebug";

type AppViewContainerProps = {
    version: string;
    onOpenSystem: () => void;
    onOpenDevTools: () => void;
    activeScreen: AppActiveScreen;
    activeSidePanel: AppActiveSidePanel;
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    onShowShop: () => void;
    hasNewInventoryItems: boolean;
    newInventoryItemIds: string[];
    onMarkInventoryItemSeen: (itemId: string) => void;
    onAddPlayer: () => void;
    onChangeAction: () => void;
    onCloseActionSelection: () => void;
    onRenameHero: () => void;
    getSkillLabel: (skillId: SkillId) => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
    getRecipeLabelNonNull: (skillId: SkillId, recipeId: string) => string;
};

export const AppViewContainer = ({
    version,
    onOpenSystem,
    onOpenDevTools,
    activeScreen,
    activeSidePanel,
    onShowAction,
    onShowStats,
    onShowInventory,
    onShowEquipment,
    onShowShop,
    hasNewInventoryItems,
    newInventoryItemIds,
    onMarkInventoryItemSeen,
    onAddPlayer,
    onChangeAction,
    onCloseActionSelection,
    onRenameHero,
    getSkillLabel,
    getRecipeLabel,
    getRecipeLabelNonNull,
}: AppViewContainerProps) => {
    return (
        <DevProfiler id="AppView">
            <AppView
                version={version}
                onOpenSystem={onOpenSystem}
                onOpenDevTools={onOpenDevTools}
                activeScreen={activeScreen}
                activeSidePanel={activeSidePanel}
                onShowAction={onShowAction}
                onShowStats={onShowStats}
                onShowInventory={onShowInventory}
                onShowEquipment={onShowEquipment}
                onShowShop={onShowShop}
                hasNewInventoryItems={hasNewInventoryItems}
                roster={(
                    <DevProfiler id="RosterPanel">
                        <RosterContainer
                            onAddPlayer={onAddPlayer}
                            getSkillLabel={getSkillLabel}
                            getRecipeLabel={getRecipeLabelNonNull}
                        />
                    </DevProfiler>
                )}
                actionPanel={(
                    <DevProfiler id="ActionPanel">
                        <ActionPanelContainer
                            onChangeAction={onChangeAction}
                            getSkillLabel={getSkillLabel}
                            getRecipeLabel={getRecipeLabel}
                        />
                    </DevProfiler>
                )}
                statsPanel={(
                    <DevProfiler id="StatsPanel">
                        <StatsPanelContainer onRenameHero={onRenameHero} />
                    </DevProfiler>
                )}
                inventoryPanel={(
                    <DevProfiler id="InventoryPanel">
                        <InventoryPanelContainer
                            newItemIds={newInventoryItemIds}
                            onMarkItemSeen={onMarkInventoryItemSeen}
                        />
                    </DevProfiler>
                )}
                equipmentPanel={(
                    <DevProfiler id="EquipmentPanel">
                        <EquipmentPanelContainer />
                    </DevProfiler>
                )}
                shopPanel={(
                    <DevProfiler id="ShopPanel">
                        <ShopPanelContainer />
                    </DevProfiler>
                )}
                actionSelectionScreen={(
                    <DevProfiler id="ActionSelectionScreen">
                        <ActionSelectionScreenContainer
                            onBack={onCloseActionSelection}
                            getSkillLabel={getSkillLabel}
                        />
                    </DevProfiler>
                )}
            />
        </DevProfiler>
    );
};
