import { describe, expect, it } from "vitest";
import type { DungeonArenaFrame } from "../../src/app/components/dungeon/arenaPlayback";
import { getAttackVfxSpecs, resolveAttackVfxKind, shouldApplyLunge } from "../../src/app/components/dungeon/renderer/updateFrame";

describe("dungeon attack vfx", () => {
    it("selects an effect kind from weapon type", () => {
        expect(resolveAttackVfxKind("Melee")).toBe("melee_arc");
        expect(resolveAttackVfxKind(undefined)).toBe("melee_arc");
        expect(resolveAttackVfxKind(null)).toBe("melee_arc");
        expect(resolveAttackVfxKind("Ranged")).toBe("ranged_projectile");
        expect(resolveAttackVfxKind("Magic")).toBe("magic_beam");
    });

    it("only applies lunge for melee (or unknown weapon type)", () => {
        expect(shouldApplyLunge(undefined)).toBe(true);
        expect(shouldApplyLunge("Melee")).toBe(true);
        expect(shouldApplyLunge("Ranged")).toBe(false);
        expect(shouldApplyLunge("Magic")).toBe(false);
    });

    it("does not throw when attack cues reference missing source/target units", () => {
        const frame: DungeonArenaFrame = {
            atMs: 100,
            totalMs: 200,
            targetEnemyId: null,
            bossId: null,
            bossPhaseLabel: null,
            floorLabel: null,
            statusLabel: null,
            units: [
                {
                    id: "hero-1",
                    name: "Hero",
                    hp: 10,
                    hpMax: 10,
                    alive: true,
                    isEnemy: false,
                    isBoss: false,
                    x: 0.2,
                    y: 0.5,
                    weaponType: "Ranged"
                }
            ],
            floatingTexts: [],
            attackCues: [
                { sourceId: "missing-source", targetId: "hero-1", atMs: 90 },
                { sourceId: "hero-1", targetId: "missing-target", atMs: 90 }
            ],
            magicCues: []
        };

        expect(() => getAttackVfxSpecs(frame)).not.toThrow();
        expect(getAttackVfxSpecs(frame)).toEqual([]);
    });
});

