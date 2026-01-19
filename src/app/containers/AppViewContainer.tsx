import type { SkillId } from "../../core/types";
import { AppView, type AppActiveSidePanel } from "../AppView";
import { ActionPanelContainer } from "./ActionPanelContainer";
import { EquipmentPanelContainer } from "./EquipmentPanelContainer";
import { InventoryPanelContainer } from "./InventoryPanelContainer";
import { RosterContainer } from "./RosterContainer";
import { StatsPanelContainer } from "./StatsPanelContainer";
import { DevProfiler } from "../dev/renderDebug";

type AppViewContainerProps = {
    version: string;
    onOpenSystem: () => void;
    activeSidePanel: AppActiveSidePanel;
    onShowAction: () => void;
    onShowStats: () => void;
    onShowInventory: () => void;
    onShowEquipment: () => void;
    onAddPlayer: () => void;
    onChangeAction: () => void;
    onRenameHero: () => void;
    getSkillLabel: (skillId: SkillId) => string;
    getRecipeLabel: (skillId: SkillId, recipeId: string | null) => string;
    getRecipeLabelNonNull: (skillId: SkillId, recipeId: string) => string;
};

export const AppViewContainer = ({
    version,
    onOpenSystem,
    activeSidePanel,
    onShowAction,
    onShowStats,
    onShowInventory,
    onShowEquipment,
    onAddPlayer,
    onChangeAction,
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
                activeSidePanel={activeSidePanel}
                onShowAction={onShowAction}
                onShowStats={onShowStats}
                onShowInventory={onShowInventory}
                onShowEquipment={onShowEquipment}
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
                        <InventoryPanelContainer />
                    </DevProfiler>
                )}
                equipmentPanel={(
                    <DevProfiler id="EquipmentPanel">
                        <EquipmentPanelContainer />
                    </DevProfiler>
                )}
            />
        </DevProfiler>
    );
};

