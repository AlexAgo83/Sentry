import type { SkillId } from "../../core/types";
import { AppView, type AppActiveScreen, type AppActiveSidePanel } from "../AppView";
import { ActionPanelContainer } from "./ActionPanelContainer";
import { ActionSelectionScreenContainer } from "./ActionSelectionScreenContainer";
import { DungeonScreenContainer } from "./DungeonScreenContainer";
import { EquipmentPanelContainer } from "./EquipmentPanelContainer";
import { InventoryPanelContainer } from "./InventoryPanelContainer";
import { RosterContainer } from "./RosterContainer";
import { ShopPanelContainer } from "./ShopPanelContainer";
import { StatsPanelContainer } from "./StatsPanelContainer";
import { QuestsPanelContainer } from "./QuestsPanelContainer";
import { DevProfiler } from "../dev/renderDebug";

type AppViewContainerProps = {
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
    isDungeonRunActive: boolean;
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
    isDungeonRunActive,
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
                activeScreen={activeScreen}
                activeSidePanel={activeSidePanel}
                onShowAction={onShowAction}
                onShowDungeon={onShowDungeon}
                isDungeonLocked={isDungeonLocked}
                onShowStats={onShowStats}
                onShowRoster={onShowRoster}
                onShowInventory={onShowInventory}
                onShowEquipment={onShowEquipment}
                onShowShop={onShowShop}
                onShowQuests={onShowQuests}
                isDungeonRunActive={isDungeonRunActive}
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
                            onRenameHero={onRenameHero}
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
                        <EquipmentPanelContainer onRenameHero={onRenameHero} />
                    </DevProfiler>
                )}
                shopPanel={(
                    <DevProfiler id="ShopPanel">
                        <ShopPanelContainer />
                    </DevProfiler>
                )}
                questsPanel={(
                    <DevProfiler id="QuestsPanel">
                        <QuestsPanelContainer />
                    </DevProfiler>
                )}
                actionSelectionScreen={(
                    <DevProfiler id="ActionSelectionScreen">
                        <ActionSelectionScreenContainer
                            onBack={onCloseActionSelection}
                            onRenameHero={onRenameHero}
                            getSkillLabel={getSkillLabel}
                        />
                    </DevProfiler>
                )}
                dungeonScreen={(
                    <DevProfiler id="DungeonScreen">
                        <DungeonScreenContainer />
                    </DevProfiler>
                )}
            />
        </DevProfiler>
    );
};
