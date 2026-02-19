import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import type { DungeonReplayState, DungeonRunState, PlayerState } from "../../src/core/types";
import { DUNGEON_DEFINITIONS } from "../../src/data/dungeons";
import { ITEM_DEFINITIONS } from "../../src/data/definitions/items";
import { DungeonScreen } from "../../src/app/components/DungeonScreen";
import { getTooltipCoverageViolations } from "./helpers/tooltipAssertions";

const getPlayersSorted = (players: Record<string, PlayerState>) => (
    Object.values(players).sort((a, b) => Number(a.id) - Number(b.id))
);

const ITEM_NAME_BY_ID = ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.name;
    return acc;
}, {});

const getBaseRun = (overrides: Partial<DungeonRunState> = {}): DungeonRunState => ({
    id: "run-1",
    dungeonId: "dungeon_ruines_humides",
    status: "running",
    endReason: null,
    startedAt: 1_000,
    elapsedMs: 1_200,
    stepCarryMs: 0,
    encounterStep: 3,
    floor: 2,
    floorCount: 10,
    party: [
        { playerId: "1", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
        { playerId: "2", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
        { playerId: "3", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
        { playerId: "4", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
    ],
    enemies: [
        { id: "mob-1", name: "Mob 1", hp: 40, hpMax: 80, damage: 10, isBoss: false, mechanic: null, spawnIndex: 0 }
    ],
    targetEnemyId: "mob-1",
    targetHeroId: null,
    autoRestart: true,
    restartAt: null,
    runIndex: 1,
    startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
    seed: 3,
    events: [
        { atMs: 0, type: "floor_start", label: "Floor 2" },
        { atMs: 0, type: "spawn", sourceId: "mob-1", label: "Mob 1" },
        { atMs: 500, type: "damage", sourceId: "1", targetId: "mob-1", amount: 40 }
    ],
    cadenceSnapshot: [],
    truncatedEvents: 0,
    nonCriticalEventCount: 0,
    threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
    threatTieOrder: ["1", "2", "3", "4"],
    ...overrides
});

const getReplay = (): DungeonReplayState => ({
    runId: "run-r1",
    dungeonId: "dungeon_ruines_humides",
    status: "failed",
    endReason: "wipe",
    runIndex: 1,
    startedAt: 1_000,
    elapsedMs: 1_500,
    seed: 4,
    partyPlayerIds: ["1", "2", "3", "4"],
    teamSnapshot: [],
    startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
    events: [
        { atMs: 0, type: "floor_start", label: "Floor 10" },
        { atMs: 100, type: "death", sourceId: "1", label: "Hero" },
        { atMs: 1_200, type: "run_end", label: "wipe" }
    ],
    truncated: false,
    fallbackCriticalOnly: false,
    cadenceSnapshot: [],
    threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 }
});

describe("DungeonScreen controls", () => {
    it("renders run tabs when active runs exist and wires run/new tab actions", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const runA = getBaseRun({ id: "run-a", startedAt: 1_000 });
        const runB = getBaseRun({ id: "run-b", startedAt: 2_000 });
        const onSelectRunTab = vi.fn();
        const onSelectNewTab = vi.fn();

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={runA}
                activeRuns={[runA, runB]}
                selectedRunId={runA.id}
                isNewTabSelected={false}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectRunTab={onSelectRunTab}
                onSelectNewTab={onSelectNewTab}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByRole("tablist", { name: "Dungeon runs" })).toBeTruthy();
        fireEvent.click(screen.getByRole("tab", { name: "2" }));
        expect(onSelectRunTab).toHaveBeenCalledWith("run-b");
        fireEvent.click(screen.getByRole("tab", { name: "New dungeon setup" }));
        expect(onSelectNewTab).toHaveBeenCalled();
    });

    it("does not render run tabs when no active run exists", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                activeRuns={[]}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.queryByRole("tablist", { name: "Dungeon runs" })).toBeNull();
    });

    it("shows setup CTA as Start new dungeon when New tab context is selected", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const runA = getBaseRun({ id: "run-a", startedAt: 1_000 });

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                activeRuns={[runA]}
                selectedRunId={runA.id}
                isNewTabSelected
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByRole("button", { name: "Start new dungeon" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Stop run" })).toBeNull();
    });

    it("uses active run dungeon for live dungeon label instead of setup selection", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run = getBaseRun({ dungeonId: "dungeon_cryptes_dos" });

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={run}
                activeRuns={[run]}
                selectedRunId={run.id}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByText("Bone Crypts")).toBeTruthy();
    });

    it("disables unavailable heroes in setup with In dungeon badge", () => {
        const state = createInitialGameState("0.9.0");
        state.players["1"] = createPlayerState("1", "Ari");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const onTogglePartyPlayer = vi.fn();

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                unavailablePartyPlayerIds={["1"]}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={onTogglePartyPlayer}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByText("In dungeon")).toBeTruthy();
        const unavailableHeroButton = screen.getByRole("button", { name: /Ari/i }) as HTMLButtonElement;
        expect(unavailableHeroButton.disabled).toBe(true);
        fireEvent.click(unavailableHeroButton);
        expect(onTogglePartyPlayer).not.toHaveBeenCalled();
    });

    it("exposes hover titles for all visible dungeon controls (live + replay)", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        // Live screen
        const live = render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={getBaseRun()}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        let violations = getTooltipCoverageViolations(document.body);
        expect(violations.missingTitles, `Missing titles (live):\n${violations.missingTitles.join("\n")}`).toEqual([]);
        expect(violations.iconOnlyButtonsMissingAria, `Missing aria-label (live):\n${violations.iconOnlyButtonsMissingAria.join("\n")}`).toEqual([]);

        // Replay screen
        live.unmount();
        const replay = render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        violations = getTooltipCoverageViolations(document.body);
        expect(violations.missingTitles, `Missing titles (replay):\n${violations.missingTitles.join("\n")}`).toEqual([]);
        expect(violations.iconOnlyButtonsMissingAria, `Missing aria-label (replay):\n${violations.iconOnlyButtonsMissingAria.join("\n")}`).toEqual([]);
        replay.unmount();
    });

    it("shows replay controls in dedicated replay screen", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={[]}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByRole("button", { name: "Back to dungeon" })).toBeTruthy();
        expect(screen.getByLabelText("Replay timeline")).toBeTruthy();
        expect(screen.getByRole("button", { name: "x0.2" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: /auto restart/i })).toBeNull();
        expect(screen.queryByRole("button", { name: "Start run" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Show replay" })).toBeNull();
    });

    it("hides replay controls in live screen", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={[]}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={getBaseRun()}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.queryByRole("button", { name: "Show replay" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Hide replay" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Start run" })).toBeNull();
        expect(screen.queryByLabelText("Replay timeline")).toBeNull();
        expect(screen.getByRole("button", { name: /auto restart/i })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
        expect(screen.queryByRole("group", { name: "Live speed" })).toBeNull();
        expect(screen.queryByRole("button", { name: /Focus boss/i })).toBeNull();
    });

    it("rewinds replay to start when pressing play at timeline end", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={[]}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        const replayTimeline = screen.getByLabelText("Replay timeline") as HTMLInputElement;
        fireEvent.change(replayTimeline, { target: { value: "1500" } });
        expect(replayTimeline.value).toBe("1500");

        fireEvent.click(screen.getByRole("button", { name: "Play" }));
        expect(replayTimeline.value).toBe("0");
    });

    it("renders risk tier and completion badges in setup list", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={3}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{ dungeon_ruines_humides: 2 }}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByText("Low")).toBeTruthy();
        expect(screen.getByText("x2")).toBeTruthy();
    });

    it("hides risk tiers when party power is not used", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        const { container } = render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={3}
                usesPartyPower={false}
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.queryByText("Low")).toBeNull();
        expect(container.querySelector(".ts-dungeon-risk-badge")).toBeNull();
    });

    it("disables replay button when no replay exists", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={3}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        const replayButton = screen.getByRole("button", { name: "Show replay" });
        expect((replayButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("shows food warning when entry cost exceeds available food", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={0}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={3}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByText("Not enough food to start this dungeon.")).toBeTruthy();
    });

    it("toggles to replay log view", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        const toggleButton = screen.getByRole("button", { name: "Switch to log view" });
        fireEvent.click(toggleButton);
        expect(screen.getByRole("log")).toBeTruthy();
        expect(screen.getByText("Dungeon: Damp Ruins")).toBeTruthy();
    });

    it("renders replay log entries as semantic buttons and seeks timeline on click", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        const { container } = render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={{}}
                currentPower={0}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={getReplay()}
                completionCounts={{}}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Switch to log view" }));

        const timeline = screen.getByLabelText("Replay timeline") as HTMLInputElement;
        const logEntry = screen.getByRole("button", { name: /\[100ms\]\s+death/i });
        expect(container.querySelector("p[role='button']")).toBeNull();

        fireEvent.click(logEntry);
        expect(timeline.value).toBe("100");
    });

    it("renders dungeon loot table with masked undiscovered entries and revealed discovered entries", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        const { rerender } = render(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{}}
                discoveredItemIds={{}}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={3}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByText("Loot table")).toBeTruthy();
        expect(screen.getAllByText("??").length).toBeGreaterThan(0);

        rerender(
            <DungeonScreen
                definitions={DUNGEON_DEFINITIONS}
                players={state.players}
                playersSorted={getPlayersSorted(state.players)}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                inventoryItems={{ traveler_cape: 0 }}
                discoveredItemIds={{ traveler_cape: true }}
                itemNameById={ITEM_NAME_BY_ID}
                currentPower={3}
                usesPartyPower
                autoConsumables={false}
                canUseConsumables={false}
                consumablesCount={0}
                activeRun={null}
                latestReplay={null}
                completionCounts={{}}
                showReplay={false}
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onToggleAutoConsumables={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByText("Traveler Cape")).toBeTruthy();
    });
});
