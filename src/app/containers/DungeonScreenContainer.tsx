import { useCallback, useEffect, useMemo, useState } from "react";
import { gameStore } from "../game";
import { useGameStore } from "../hooks/useGameStore";
import { DUNGEON_DEFINITIONS } from "../../data/dungeons";
import { getCombatSkillIdForWeaponType, getEquippedWeaponType } from "../../data/equipment";
import { ITEM_DEFINITIONS } from "../../data/definitions";
import { getActiveDungeonRun, getActiveDungeonRuns } from "../../core/dungeon";
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
    const activeRuns = useMemo(() => getActiveDungeonRuns(dungeon), [dungeon]);
    const activeRun = useMemo(() => getActiveDungeonRun(dungeon), [dungeon]);
    const playersSorted = useMemo(
        () => selectPlayersSortedFromPlayers(players, rosterOrder),
        [players, rosterOrder]
    );
    const playerCount = Object.keys(players).length;
    const canEnterDungeon = playerCount >= 4;
    const [showReplay, setShowReplay] = useState(false);
    const [isNewTabSelected, setIsNewTabSelected] = useState(false);
    const unavailablePartyPlayerIds = useMemo(() => {
        return Array.from(new Set(
            activeRuns.flatMap((run) => run.party.map((member) => member.playerId))
        ));
    }, [activeRuns]);
    const unavailablePartyPlayerIdSet = useMemo(
        () => new Set(unavailablePartyPlayerIds),
        [unavailablePartyPlayerIds]
    );
    const selectedPartyPlayerIds = useMemo(() => {
        return setup.selectedPartyPlayerIds.filter((playerId) => !unavailablePartyPlayerIdSet.has(playerId));
    }, [setup.selectedPartyPlayerIds, unavailablePartyPlayerIdSet]);
    const hasPartySelection = selectedPartyPlayerIds.length > 0;
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
            const selectedIds = selectedPartyPlayerIds;
            const total = selectedIds.reduce((sum, playerId) => sum + resolvePlayerPower(playerId), 0);
            const average = selectedIds.length > 0 ? total / selectedIds.length : 0;
            return Math.max(0, Math.round(average));
        }
        if (activePlayerId && players[activePlayerId]) {
            return Math.max(0, Math.round(resolvePlayerPower(activePlayerId)));
        }
        return 0;
    }, [activePlayerId, hasPartySelection, players, selectedPartyPlayerIds]);

    useEffect(() => {
        const isUnchanged = selectedPartyPlayerIds.length === setup.selectedPartyPlayerIds.length
            && selectedPartyPlayerIds.every((playerId, index) => playerId === setup.selectedPartyPlayerIds[index]);
        if (isUnchanged) {
            return;
        }
        gameStore.dispatch({ type: "dungeonSetupSetParty", playerIds: selectedPartyPlayerIds });
    }, [selectedPartyPlayerIds, setup.selectedPartyPlayerIds]);

    useEffect(() => {
        if (activeRuns.length > 0) {
            return;
        }
        if (!isNewTabSelected) {
            return;
        }
        setIsNewTabSelected(false);
    }, [activeRuns.length, isNewTabSelected]);

    const handleSelectDungeon = useCallback((dungeonId: string) => {
        gameStore.dispatch({ type: "dungeonSetupSelectDungeon", dungeonId });
    }, []);

    const handleTogglePartyPlayer = useCallback((playerId: PlayerId) => {
        if (unavailablePartyPlayerIdSet.has(playerId)) {
            return;
        }
        const selected = selectedPartyPlayerIds.includes(playerId);
        const next = selected
            ? selectedPartyPlayerIds.filter((id) => id !== playerId)
            : [...selectedPartyPlayerIds, playerId].slice(0, 4);
        gameStore.dispatch({ type: "dungeonSetupSetParty", playerIds: next });
    }, [selectedPartyPlayerIds, unavailablePartyPlayerIdSet]);

    const handleAutoRestartToggle = useCallback((autoRestart: boolean) => {
        gameStore.dispatch({ type: "dungeonSetupSetAutoRestart", autoRestart });
    }, []);

    const handleAutoConsumablesToggle = useCallback((nextValue: boolean) => {
        gameStore.dispatch({ type: "dungeonSetupSetAutoConsumables", autoConsumables: nextValue });
    }, []);

    const handleStartRun = useCallback(() => {
        const activeRunIdSetBeforeStart = new Set(getActiveDungeonRuns(gameStore.getState().dungeon).map((run) => run.id));
        gameStore.dispatch({
            type: "dungeonStartRun",
            dungeonId: setup.selectedDungeonId,
            playerIds: selectedPartyPlayerIds,
            timestamp: Date.now()
        });
        const nextActiveRunId = gameStore.getState().dungeon.activeRunId;
        if (nextActiveRunId && !activeRunIdSetBeforeStart.has(nextActiveRunId)) {
            setIsNewTabSelected(false);
            setShowReplay(false);
        }
    }, [selectedPartyPlayerIds, setup.selectedDungeonId]);

    const handleStopRun = useCallback(() => {
        gameStore.dispatch({ type: "dungeonStopRun" });
    }, []);

    const handleToggleReplay = useCallback(() => {
        setShowReplay((prev) => !prev);
    }, []);

    const handleSelectRunTab = useCallback((runId: string) => {
        gameStore.dispatch({ type: "dungeonSetActiveRun", runId });
        setIsNewTabSelected(false);
        setShowReplay(false);
    }, []);

    const handleSelectNewTab = useCallback(() => {
        setIsNewTabSelected(true);
        setShowReplay(false);
    }, []);

    const displayedActiveRun = isNewTabSelected ? null : activeRun;
    const selectedRunId = activeRun?.id ?? null;

    return (
        <DungeonScreen
            definitions={DUNGEON_DEFINITIONS}
            players={players}
            playersSorted={playersSorted}
            selectedDungeonId={setup.selectedDungeonId}
            selectedPartyPlayerIds={selectedPartyPlayerIds}
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
            activeRun={displayedActiveRun}
            activeRuns={activeRuns}
            selectedRunId={selectedRunId}
            isNewTabSelected={isNewTabSelected}
            latestReplay={dungeon.latestReplay}
            completionCounts={dungeon.completionCounts ?? {}}
            showReplay={showReplay}
            unavailablePartyPlayerIds={unavailablePartyPlayerIds}
            onToggleReplay={handleToggleReplay}
            onSelectRunTab={handleSelectRunTab}
            onSelectNewTab={handleSelectNewTab}
            onSelectDungeon={handleSelectDungeon}
            onTogglePartyPlayer={handleTogglePartyPlayer}
            onToggleAutoRestart={handleAutoRestartToggle}
            onToggleAutoConsumables={handleAutoConsumablesToggle}
            onStartRun={handleStartRun}
            onStopRun={handleStopRun}
        />
    );
};
