import { render, screen } from "@testing-library/react";
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
        { playerId: "1", hp: 100, hpMax: 100, potionCooldownMs: 0 },
        { playerId: "2", hp: 100, hpMax: 100, potionCooldownMs: 0 },
        { playerId: "3", hp: 100, hpMax: 100, potionCooldownMs: 0 },
        { playerId: "4", hp: 100, hpMax: 100, potionCooldownMs: 0 }
    ],
    enemies: [
        { id: "mob-1", name: "Mob 1", hp: 40, hpMax: 80, damage: 10, isBoss: false, mechanic: null, spawnIndex: 0 }
    ],
    targetEnemyId: "mob-1",
    autoRestart: true,
    restartAt: null,
    runIndex: 1,
    startInventory: { meat: 10, tonic: 0, elixir: 0, potion: 0 },
    seed: 3,
    events: [
        { atMs: 0, type: "floor_start", label: "Floor 2" },
        { atMs: 0, type: "spawn", sourceId: "mob-1", label: "Mob 1" },
        { atMs: 500, type: "damage", sourceId: "1", targetId: "mob-1", amount: 40 }
    ]
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
    startInventory: { meat: 10, tonic: 0, elixir: 0, potion: 0 },
    events: [
        { atMs: 0, type: "floor_start", label: "Floor 10" },
        { atMs: 100, type: "death", sourceId: "1", label: "Hero" },
        { atMs: 1_200, type: "run_end", label: "wipe" }
    ],
    truncated: false,
    fallbackCriticalOnly: false
});

describe("DungeonScreen controls", () => {
    it("shows live and replay control groups", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        render(
            <DungeonScreen
                onBack={() => {}}
                definitions={[]}
                players={state.players}
                selectedDungeonId="dungeon_ruines_humides"
                selectedPartyPlayerIds={["1", "2", "3", "4"]}
                autoRestart
                canEnterDungeon
                meatCount={20}
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

        expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
        expect(screen.getByLabelText("Replay timeline")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Skip to first death" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: /Focus boss/i })).toBeNull();
    });
});
