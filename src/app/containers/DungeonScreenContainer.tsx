import { useCallback, useMemo, useState } from "react";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { DUNGEON_DEFINITIONS } from "../../data/dungeons";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../data/equipment";
import { ITEM_DEFINITIONS } from "../../data/definitions";
import { getActiveDungeonRun } from "../../core/dungeon";
import type { PlayerId } from "../../core/types";
import { DungeonScreen } from "../components/DungeonScreen";
import { selectPlayersSortedFromPlayers } from "../selectors/gameSelectors";

export const DungeonScreenContainer = () => {
    const players = useGameStore((state) => state.players);
    const rosterOrder = useGameStore((state) => state.rosterOrder);
    const activePlayerId = useGameStore((state) => state.activePlayerId);
    const setup = useGameStore((state) => state.dungeon.setup);
    const dungeon = useGameStore((state) => state.dungeon);
    const inventoryItems = useGameStore((state) => state.inventory.items);
    const discoveredItemIds = useGameStore((state) => state.inventory.discoveredItemIds);
    const foodCount = useGameStore((state) => state.inventory.items.food ?? 0);
    const autoConsumables = useGameStore((state) => state.dungeon.setup.autoConsumables);
    const consumablesCount = useGameStore((state) => {
        const items = state.inventory.items;
        return (items.potion ?? 0) + (items.tonic ?? 0) + (items.elixir ?? 0);
    });
    const activeRun = useMemo(() => getActiveDungeonRun(dungeon), [dungeon]);
    const playersSorted = useMemo(
        () => selectPlayersSortedFromPlayers(players, rosterOrder),
        [players, rosterOrder]
    );
    const playerCount = Object.keys(players).length;
    const canEnterDungeon = playerCount >= 4;
    const [showReplay, setShowReplay] = useState(false);
    const hasPartySelection = setup.selectedPartyPlayerIds.length > 0;
    const itemNameById = useMemo(() => {
        return ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
            acc[item.id] = item.name;
            return acc;
        }, {});
    }, []);
    const currentPower = useMemo(() => {
        const resolvePlayerPower = (playerId: PlayerId) => {
            const player = players[playerId];
            if (!player) {
                return 0;
            }
            const combatSkillId = getCombatSkillIdForWeaponType(getEquippedWeaponType(player.equipment));
            return Math.max(0, Math.floor(player.skills[combatSkillId]?.level ?? 0));
        };
        if (hasPartySelection) {
            const selectedIds = setup.selectedPartyPlayerIds;
            const total = selectedIds.reduce((sum, playerId) => sum + resolvePlayerPower(playerId), 0);
            const average = selectedIds.length > 0 ? total / selectedIds.length : 0;
            return Math.max(0, Math.round(average));
        }
        if (activePlayerId && players[activePlayerId]) {
            return Math.max(0, Math.round(resolvePlayerPower(activePlayerId)));
        }
        return 0;
    }, [activePlayerId, hasPartySelection, players, setup.selectedPartyPlayerIds]);

    const handleSelectDungeon = useCallback((dungeonId: string) => {
        gameStore.dispatch({ type: "dungeonSetupSelectDungeon", dungeonId });
    }, []);

    const handleTogglePartyPlayer = useCallback((playerId: PlayerId) => {
        const selected = setup.selectedPartyPlayerIds.includes(playerId);
        const next = selected
            ? setup.selectedPartyPlayerIds.filter((id) => id !== playerId)
            : [...setup.selectedPartyPlayerIds, playerId].slice(0, 4);
        gameStore.dispatch({ type: "dungeonSetupSetParty", playerIds: next });
    }, [setup.selectedPartyPlayerIds]);

    const handleAutoRestartToggle = useCallback((autoRestart: boolean) => {
        gameStore.dispatch({ type: "dungeonSetupSetAutoRestart", autoRestart });
    }, []);

    const handleAutoConsumablesToggle = useCallback((nextValue: boolean) => {
        gameStore.dispatch({ type: "dungeonSetupSetAutoConsumables", autoConsumables: nextValue });
    }, []);

    const handleStartRun = useCallback(() => {
        gameStore.dispatch({
            type: "dungeonStartRun",
            dungeonId: setup.selectedDungeonId,
            playerIds: setup.selectedPartyPlayerIds,
            timestamp: Date.now()
        });
    }, [setup.selectedDungeonId, setup.selectedPartyPlayerIds]);

    const handleStopRun = useCallback(() => {
        gameStore.dispatch({ type: "dungeonStopRun" });
    }, []);

    const handleToggleReplay = useCallback(() => {
        setShowReplay((prev) => !prev);
    }, []);

    return (
        <DungeonScreen
            definitions={DUNGEON_DEFINITIONS}
            players={players}
            playersSorted={playersSorted}
            selectedDungeonId={setup.selectedDungeonId}
            selectedPartyPlayerIds={setup.selectedPartyPlayerIds}
            canEnterDungeon={canEnterDungeon}
            foodCount={foodCount}
            inventoryItems={inventoryItems}
            discoveredItemIds={discoveredItemIds}
            itemNameById={itemNameById}
            currentPower={currentPower}
            usesPartyPower={hasPartySelection}
            autoConsumables={autoConsumables}
            canUseConsumables={consumablesCount > 0}
            consumablesCount={consumablesCount}
            activeRun={activeRun}
            latestReplay={dungeon.latestReplay}
            completionCounts={dungeon.completionCounts ?? {}}
            showReplay={showReplay}
            onToggleReplay={handleToggleReplay}
            onSelectDungeon={handleSelectDungeon}
            onTogglePartyPlayer={handleTogglePartyPlayer}
            onToggleAutoRestart={handleAutoRestartToggle}
            onToggleAutoConsumables={handleAutoConsumablesToggle}
            onStartRun={handleStartRun}
            onStopRun={handleStopRun}
        />
    );
};
