import { suite, test, expect, vi } from "vitest";
import { Engine } from "../src/engine.js";

suite("Engine offline loop", () => {
    test("reports offline processing summary", () => {
        const engine = new Engine();
        const player = engine.playerManager.createPlayer(0, false);

        const action = {
            getIdentifier: () => "Combat",
            doAction: () => 0
        };
        player.setSelectedAction(action);

        const openOffline = vi.fn();
        engine.dialogManager.openOffline = openOffline;

        engine.offlineLoop(1600);

        expect(openOffline).toHaveBeenCalledTimes(1);
        expect(openOffline).toHaveBeenCalledWith(1600, 3, 0);
    });
});
