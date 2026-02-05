import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import type { DungeonReplayState, DungeonRunState } from "../../src/core/types";
import { DungeonScreen } from "../../src/app/components/DungeonScreen";

const getBaseRun = (): DungeonRunState => ({
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
        { playerId: "1", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500 },
        { playerId: "2", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500 },
        { playerId: "3", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500 },
        { playerId: "4", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500 }
    ],
    enemies: [
        { id: "mob-1", name: "Mob 1", hp: 40, hpMax: 80, damage: 10, isBoss: false, mechanic: null, spawnIndex: 0 }
    ],
    targetEnemyId: "mob-1",
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
    truncatedEvents: 0
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
    cadenceSnapshot: []
});

describe("DungeonScreen controls", () => {
    it("shows replay controls in dedicated replay screen", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                definitions={[]}
                players={state.players}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                activeRun={null}
                latestReplay={getReplay()}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
                onStartRun={() => {}}
                onStopRun={() => {}}
            />
        );

        expect(screen.getByRole("button", { name: "Back to dungeon" })).toBeTruthy();
        expect(screen.getByLabelText("Replay timeline")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Skip to first death" })).toBeTruthy();
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
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                activeRun={getBaseRun()}
                latestReplay={getReplay()}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
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
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                canEnterDungeon
                foodCount={20}
                activeRun={null}
                latestReplay={getReplay()}
                showReplay
                onToggleReplay={() => {}}
                onSelectDungeon={() => {}}
                onTogglePartyPlayer={() => {}}
                onToggleAutoRestart={() => {}}
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
});
