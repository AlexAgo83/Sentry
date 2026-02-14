import type { AppActiveScreen } from "./AppView";

type AutoDungeonOpenInput = {
    isDungeonRunActive: boolean;
    didAutoOpenDungeon: boolean;
    activeScreen: AppActiveScreen;
    isOnboardingOpen: boolean;
};

type AutoDungeonOpenDecision = {
    nextDidAutoOpenDungeon: boolean;
    shouldOpenDungeon: boolean;
};

export const resolveAutoDungeonOpenDecision = ({
    isDungeonRunActive,
    didAutoOpenDungeon,
    activeScreen,
    isOnboardingOpen
}: AutoDungeonOpenInput): AutoDungeonOpenDecision => {
    if (!isDungeonRunActive) {
        // Keep the marker while staying on dungeon setup; this avoids a
        // forced re-open on the first tab click after starting a run.
        if (activeScreen === "dungeon") {
            return {
                nextDidAutoOpenDungeon: didAutoOpenDungeon,
                shouldOpenDungeon: false
            };
        }
        return {
            nextDidAutoOpenDungeon: false,
            shouldOpenDungeon: false
        };
    }

    if (activeScreen === "dungeon") {
        return {
            nextDidAutoOpenDungeon: true,
            shouldOpenDungeon: false
        };
    }

    if (didAutoOpenDungeon || isOnboardingOpen || activeScreen !== "main") {
        return {
            nextDidAutoOpenDungeon: didAutoOpenDungeon,
            shouldOpenDungeon: false
        };
    }

    return {
        nextDidAutoOpenDungeon: true,
        shouldOpenDungeon: true
    };
};

