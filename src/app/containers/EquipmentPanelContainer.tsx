import { useCallback } from "react";
import { EQUIPMENT_DEFINITIONS } from "../../data/equipment";
import type { EquipmentSlotId } from "../../core/types";
import { createPlayerEquipmentState } from "../../core/equipment";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { selectActivePlayer } from "../selectors/gameSelectors";
import { EquipmentPanel } from "../components/EquipmentPanel";
import { usePersistedCollapse } from "../hooks/usePersistedCollapse";
import { HeroSkinPanelContainer } from "./HeroSkinPanelContainer";

type EquipmentPanelContainerProps = {
    onRenameHero: () => void;
};

export const EquipmentPanelContainer = ({ onRenameHero }: EquipmentPanelContainerProps) => {
    const activePlayer = useGameStore(selectActivePlayer);
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const [isEquipmentCollapsed, setEquipmentCollapsed] = usePersistedCollapse("equipment", false);

    const handleEquipItem = useCallback((itemId: string) => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({
            type: "equipItem",
            playerId: activePlayer.id,
            itemId
        });
    }, [activePlayer]);

    const handleUnequipSlot = useCallback((slot: EquipmentSlotId) => {
        if (!activePlayer) {
            return;
        }
        gameStore.dispatch({
            type: "unequipItem",
            playerId: activePlayer.id,
            slot
        });
    }, [activePlayer]);

    return (
        <>
            <HeroSkinPanelContainer onRenameHero={onRenameHero} useDungeonProgress />
            <EquipmentPanel
                isCollapsed={isEquipmentCollapsed}
                onToggleCollapsed={() => setEquipmentCollapsed((value) => !value)}
                equipment={activePlayer?.equipment ?? createPlayerEquipmentState()}
                inventoryItems={inventoryItems}
                definitions={EQUIPMENT_DEFINITIONS}
                onEquipItem={handleEquipItem}
                onUnequipSlot={handleUnequipSlot}
            />
        </>
    );
};
