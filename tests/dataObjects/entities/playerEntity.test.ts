import { describe, expect, it } from "vitest";
import { createPlayerState } from "../../../src/core/state";

describe("PlayerState", () => {
    it("creates a new player with skills", () => {
        const player = createPlayerState("1");
        expect(player).toBeTruthy();
        expect(player.name).toBe("Player_1");
        expect(Object.keys(player.skills).length).toBeGreaterThan(0);
    });

    it("creates a named player", () => {
        const player = createPlayerState("2", "Hero");
        expect(player.name).toBe("Hero");
    });
});
