import { memo, useMemo, useState } from "react";
import { buildDungeonArenaLiveFrame, buildDungeonArenaReplayFrame } from "./dungeon/arenaPlayback";
import { DungeonHeaderActions } from "./dungeonScreen/components/DungeonHeaderActions";
import { DungeonLiveView } from "./dungeonScreen/components/DungeonLiveView";
import { DungeonReplayView } from "./dungeonScreen/components/DungeonReplayView";
import { DungeonSetupView } from "./dungeonScreen/components/DungeonSetupView";
import { useDungeonLivePlayback } from "./dungeonScreen/hooks/useDungeonLivePlayback";
import { useDungeonReplayPlayback } from "./dungeonScreen/hooks/useDungeonReplayPlayback";
import { useDungeonReplayDerived } from "./dungeonScreen/hooks/useDungeonReplayDerived";
import { getDungeonBackgroundUrl } from "../ui/dungeonBackgrounds";
import type { DamageTotals, DungeonScreenProps } from "./dungeonScreen/types";

export const DungeonScreen = memo(({
    definitions,
    players,
    playersSorted,
    selectedDungeonId,
    selectedPartyPlayerIds,
    canEnterDungeon,
    foodCount,
    inventoryItems,
    discoveredItemIds,
    itemNameById,
    currentPower,
    usesPartyPower,
    autoConsumables,
    canUseConsumables,
    consumablesCount,
    activeRun,
    latestReplay,
    completionCounts,
    showReplay,
    onToggleReplay,
    onSelectDungeon,
    onTogglePartyPlayer,
    onToggleAutoRestart,
    onToggleAutoConsumables,
    onStartRun,
    onStopRun
}: DungeonScreenProps) => {
    const safeCompletionCounts = completionCounts ?? {};
    const frameIntervalMs = 1000 / 30;
    const combatLabelBySkillId: Partial<Record<string, string>> = {
        CombatMelee: "Melee",
        CombatRanged: "Ranged",
        CombatMagic: "Magic"
    };
    const [replayView, setReplayView] = useState<"group" | "log">("group");

    const { liveCursorMs } = useDungeonLivePlayback(activeRun, frameIntervalMs);
    const {
        replayPaused,
        setReplayPaused,
        replaySpeed,
        setReplaySpeed,
        replayCursorMs,
        setReplayCursor,
        replayTotalMs
    } = useDungeonReplayPlayback(latestReplay, showReplay, frameIntervalMs);

    const riskTooltip = usesPartyPower ? "Based on current party power." : "Based on active hero power.";
    const hasPartySelection = selectedPartyPlayerIds.length > 0;
    const threatTotal = activeRun
        ? activeRun.party.reduce((sum, member) => sum + (activeRun.threatByHeroId?.[member.playerId] ?? 0), 0)
        : 0;
    const topThreatValue = activeRun
        ? activeRun.party.reduce((max, member) => {
            const value = activeRun.threatByHeroId?.[member.playerId] ?? 0;
            return value > max ? value : max;
        }, 0)
        : 0;

    const liveDamageTotals = useMemo<DamageTotals>(() => {
        const heroTotals = new Map<string, number>();
        const enemyTotals = new Map<string, number>();
        if (!activeRun) {
            return { heroTotals, enemyTotals, groupTotal: 0 };
        }
        const partyIds = new Set(activeRun.party.map((member) => member.playerId));
        activeRun.events.forEach((event) => {
            if (event.type !== "damage") {
                return;
            }
            const amount = Number(event.amount);
            if (!Number.isFinite(amount) || amount <= 0) {
                return;
            }
            const sourceId = event.sourceId ?? "";
            const targetId = event.targetId ?? "";
            if (partyIds.has(sourceId) && targetId.startsWith("entity_")) {
                heroTotals.set(sourceId, (heroTotals.get(sourceId) ?? 0) + amount);
            } else if (sourceId.startsWith("entity_") && partyIds.has(targetId)) {
                enemyTotals.set(sourceId, (enemyTotals.get(sourceId) ?? 0) + amount);
            }
        });
        const groupTotal = Array.from(heroTotals.values()).reduce((sum, value) => sum + value, 0);
        return { heroTotals, enemyTotals, groupTotal };
    }, [activeRun]);

    const selectedDungeon = definitions.find((definition) => definition.id === selectedDungeonId) ?? definitions[0] ?? null;
    const sortedPlayers = playersSorted;
    const requiredFoodForStart = selectedDungeon ? 1 + Math.floor((selectedDungeon.tier - 1) / 2) : 0;
    const safeRequiredFoodForStart = Number.isFinite(requiredFoodForStart) ? Math.max(0, Math.floor(requiredFoodForStart)) : 0;
    const safeFoodCount = Number.isFinite(foodCount) ? Math.max(0, Math.floor(foodCount)) : 0;
    const hasEnoughFood = safeFoodCount >= safeRequiredFoodForStart;
    const canStartRun = canEnterDungeon
        && selectedPartyPlayerIds.length === 4
        && Boolean(selectedDungeon)
        && hasEnoughFood;

    const {
        replayFloorMarks,
        replayTrackGradient,
        replayDeathMarks,
        replayHighlightAtMs,
        replayDamageTotals,
        replayThreatTotals,
        replayCooldowns,
        heroNameById,
        replayHealLogMeta
    } = useDungeonReplayDerived(latestReplay, replayCursorMs, replayTotalMs, players);

    const liveFrame = useMemo(() => {
        if (!activeRun) {
            return null;
        }
        return buildDungeonArenaLiveFrame(activeRun, players, liveCursorMs);
    }, [activeRun, players, liveCursorMs]);

    const replayFrame = useMemo(() => {
        if (!latestReplay) {
            return null;
        }
        return buildDungeonArenaReplayFrame(latestReplay, players, replayCursorMs);
    }, [latestReplay, players, replayCursorMs]);
    const liveDungeonBackgroundUrl = activeRun
        ? getDungeonBackgroundUrl(activeRun.dungeonId)
        : getDungeonBackgroundUrl(selectedDungeon?.id ?? null);
    const replayDungeonBackgroundUrl = latestReplay
        ? getDungeonBackgroundUrl(latestReplay.dungeonId)
        : getDungeonBackgroundUrl(selectedDungeon?.id ?? null);

    const isReplayScreen = !activeRun && showReplay && Boolean(latestReplay);

    const handleReplayPlayPause = () => {
        if (replayPaused && replayCursorMs >= replayTotalMs) {
            setReplayCursor(0);
        }
        setReplayPaused((value) => !value);
    };

    return (
        <section className="generic-panel ts-panel ts-dungeon-panel" data-testid="dungeon-screen">
            <div className="ts-panel-header">
                <div className="ts-panel-heading">
                    <h2 className="ts-panel-title">Dungeon</h2>
                    {!isReplayScreen ? <span className="ts-panel-meta">Party idle boss run</span> : null}
                </div>
                <DungeonHeaderActions
                    activeRun={activeRun}
                    isReplayScreen={isReplayScreen}
                    canStartRun={canStartRun}
                    latestReplay={latestReplay}
                    replayPaused={replayPaused}
                    replayView={replayView}
                    autoConsumables={autoConsumables}
                    canUseConsumables={canUseConsumables}
                    consumablesCount={consumablesCount}
                    onStartRun={onStartRun}
                    onToggleReplay={onToggleReplay}
                    onReplayPlayPause={handleReplayPlayPause}
                    onReplayViewToggle={() => setReplayView((value) => (value === "group" ? "log" : "group"))}
                    onToggleAutoRestart={onToggleAutoRestart}
                    onToggleAutoConsumables={onToggleAutoConsumables}
                    onStopRun={onStopRun}
                />
            </div>

            {!activeRun && !isReplayScreen ? (
                <DungeonSetupView
                    definitions={definitions}
                    selectedDungeonId={selectedDungeonId}
                    safeCompletionCounts={safeCompletionCounts}
                    usesPartyPower={usesPartyPower}
                    currentPower={currentPower}
                    riskTooltip={riskTooltip}
                    onSelectDungeon={onSelectDungeon}
                    canEnterDungeon={canEnterDungeon}
                    sortedPlayers={sortedPlayers}
                    selectedPartyPlayerIds={selectedPartyPlayerIds}
                    combatLabelBySkillId={combatLabelBySkillId}
                    onTogglePartyPlayer={onTogglePartyPlayer}
                    hasPartySelection={hasPartySelection}
                    safeRequiredFoodForStart={safeRequiredFoodForStart}
                    safeFoodCount={safeFoodCount}
                    hasEnoughFood={hasEnoughFood}
                    itemNameById={itemNameById}
                    discoveredItemIds={discoveredItemIds}
                    inventoryItems={inventoryItems}
                />
            ) : isReplayScreen && latestReplay ? (
                <div className="ts-dungeon-replay-screen">
                    <DungeonReplayView
                        latestReplay={latestReplay}
                        replayFrame={replayFrame}
                        dungeonBackgroundUrl={replayDungeonBackgroundUrl}
                        replaySpeed={replaySpeed}
                        onReplaySpeedChange={setReplaySpeed}
                        replayTotalMs={replayTotalMs}
                        replayCursorMs={replayCursorMs}
                        replayTrackGradient={replayTrackGradient}
                        replayFloorMarks={replayFloorMarks}
                        replayDeathMarks={replayDeathMarks}
                        onReplayCursorChange={setReplayCursor}
                        safeCompletionCounts={safeCompletionCounts}
                        replayView={replayView}
                        replayDamageTotals={replayDamageTotals}
                        replayThreatTotals={replayThreatTotals}
                        replayCooldowns={replayCooldowns}
                        replayHighlightAtMs={replayHighlightAtMs}
                        replayHealLogMeta={replayHealLogMeta}
                        heroNameById={heroNameById}
                        selectedDungeon={selectedDungeon}
                    />
                </div>
            ) : activeRun ? (
                <DungeonLiveView
                    activeRun={activeRun}
                    players={players}
                    selectedDungeonName={selectedDungeon?.name ?? activeRun.dungeonId}
                    safeCompletionCounts={safeCompletionCounts}
                    liveFrame={liveFrame}
                    dungeonBackgroundUrl={liveDungeonBackgroundUrl}
                    liveDamageTotals={liveDamageTotals}
                    threatTotal={threatTotal}
                    topThreatValue={topThreatValue}
                />
            ) : null}
        </section>
    );
});

DungeonScreen.displayName = "DungeonScreen";
