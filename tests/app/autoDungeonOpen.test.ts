import { describe, expect, it } from "vitest";
import { resolveAutoDungeonOpenDecision } from "../../src/app/autoDungeonOpen";

describe("resolveAutoDungeonOpenDecision", () => {
    it("resets auto-open marker when no run is active outside dungeon", () => {
        const decision = resolveAutoDungeonOpenDecision({
            isDungeonRunActive: false,
            didAutoOpenDungeon: true,
            activeScreen: "main",
            isOnboardingOpen: false
        });

        expect(decision).toEqual({
            nextDidAutoOpenDungeon: false,
            shouldOpenDungeon: false
        });
    });

    it("keeps marker while staying on dungeon setup with no active run", () => {
        const decision = resolveAutoDungeonOpenDecision({
            isDungeonRunActive: false,
            didAutoOpenDungeon: true,
            activeScreen: "dungeon",
            isOnboardingOpen: false
        });

        expect(decision).toEqual({
            nextDidAutoOpenDungeon: true,
            shouldOpenDungeon: false
        });
    });

    it("locks marker while run is active on dungeon screen", () => {
        const decision = resolveAutoDungeonOpenDecision({
            isDungeonRunActive: true,
            didAutoOpenDungeon: false,
            activeScreen: "dungeon",
            isOnboardingOpen: false
        });

        expect(decision).toEqual({
            nextDidAutoOpenDungeon: true,
            shouldOpenDungeon: false
        });
    });

    it("auto-opens dungeon once when a run is active on main screen", () => {
        const decision = resolveAutoDungeonOpenDecision({
            isDungeonRunActive: true,
            didAutoOpenDungeon: false,
            activeScreen: "main",
            isOnboardingOpen: false
        });

        expect(decision).toEqual({
            nextDidAutoOpenDungeon: true,
            shouldOpenDungeon: true
        });
    });

    it("does not auto-open when onboarding is blocking", () => {
        const decision = resolveAutoDungeonOpenDecision({
            isDungeonRunActive: true,
            didAutoOpenDungeon: false,
            activeScreen: "main",
            isOnboardingOpen: true
        });

        expect(decision).toEqual({
            nextDidAutoOpenDungeon: false,
            shouldOpenDungeon: false
        });
    });
});

