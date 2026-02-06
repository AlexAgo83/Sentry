import type { PlayerStatsState, StatId, WeaponType } from "../../core/types";
import {
    DUNGEON_BASE_ATTACK_MS,
    resolveHeroAttackDamage,
    resolveHeroAttackIntervalMs,
    resolveHeroAttackIntervalMsWithMultiplier
} from "../../core/dungeon";

export type CombatDisplayValue = {
    base: number;
    modifiers: number;
    total: number;
};

export type CombatDisplayModel = {
    level: CombatDisplayValue;
    attackIntervalMs: CombatDisplayValue;
    attacksPerSecond: CombatDisplayValue;
    damage: CombatDisplayValue;
};

const toNumber = (value: number | undefined): number =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

export const buildCombatDisplay = (
    combatLevel: number | undefined,
    stats: PlayerStatsState,
    effectiveStats: Record<StatId, number>,
    weaponType?: WeaponType | null
): CombatDisplayModel => {
    const baseStrength = toNumber(stats.base.Strength);
    const baseAgility = toNumber(stats.base.Agility);
    const totalStrength = toNumber(effectiveStats.Strength);
    const totalAgility = toNumber(effectiveStats.Agility);
    const level = toNumber(combatLevel);

    const baseInterval = resolveHeroAttackIntervalMs(DUNGEON_BASE_ATTACK_MS, baseAgility);
    const attackIntervalMultiplier = weaponType === "Ranged" ? 0.5 : 1;
    const totalInterval = resolveHeroAttackIntervalMsWithMultiplier(
        DUNGEON_BASE_ATTACK_MS,
        totalAgility,
        attackIntervalMultiplier
    );
    const baseAttacksPerSecond = baseInterval > 0 ? 1000 / baseInterval : 0;
    const totalAttacksPerSecond = totalInterval > 0 ? 1000 / totalInterval : 0;

    const baseDamage = resolveHeroAttackDamage(level, baseStrength);
    const totalDamage = resolveHeroAttackDamage(level, totalStrength);

    return {
        level: {
            base: level,
            modifiers: 0,
            total: level
        },
        attackIntervalMs: {
            base: baseInterval,
            modifiers: totalInterval - baseInterval,
            total: totalInterval
        },
        attacksPerSecond: {
            base: baseAttacksPerSecond,
            modifiers: totalAttacksPerSecond - baseAttacksPerSecond,
            total: totalAttacksPerSecond
        },
        damage: {
            base: baseDamage,
            modifiers: totalDamage - baseDamage,
            total: totalDamage
        }
    };
};
