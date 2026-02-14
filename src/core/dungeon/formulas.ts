import type { DungeonDefinition, WeaponType } from "../types";
import {
    ARMOR_DAMAGE_REDUCTION_MAX,
    ARMOR_DAMAGE_REDUCTION_PER_POINT,
    COMBAT_XP_BASE,
    COMBAT_XP_TIER_FACTOR,
    DUNGEON_ATTACK_INTERVAL_MAX_MS,
    DUNGEON_ATTACK_INTERVAL_MIN_MS,
    DUNGEON_BASE_ATTACK_MS,
    MAGIC_DAMAGE_TAKEN_MULTIPLIER,
    MAGIC_HEAL_RATIO,
    MELEE_DAMAGE_TAKEN_MULTIPLIER,
    MELEE_THREAT_MULTIPLIER,
    RANGED_ATTACK_INTERVAL_MULTIPLIER,
    RANGED_DAMAGE_TAKEN_MULTIPLIER
} from "./constants";

const clampNumber = (min: number, max: number, value: number) => {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
};

export const floorMobHp = (tier: number, floor: number) => {
    return Math.max(1, Math.round(120 * (1.18 ** (tier - 1)) * (1.10 ** (floor - 1)) * 2));
};

export const floorMobDamage = (tier: number, floor: number) => {
    return Math.max(1, Math.round(12 * (1.15 ** (tier - 1)) * (1.07 ** (floor - 1))));
};

export const foodCostPerFloor = (tier: number) => {
    return 1 + Math.floor((tier - 1) / 2);
};

export const foodCostForFloor = (tier: number, floor: number, floorCount: number) => {
    return foodCostPerFloor(tier) + (floor === floorCount ? 1 : 0);
};

export const getDungeonStartFoodCost = (definition: DungeonDefinition): number => {
    return foodCostForFloor(definition.tier, 1, Math.max(1, definition.floorCount));
};

export const resolveHeroAttackIntervalMs = (baseAttackMs: number, agility: number): number => {
    const safeBase = Number.isFinite(baseAttackMs) && baseAttackMs > 0 ? baseAttackMs : DUNGEON_BASE_ATTACK_MS;
    const safeAgility = Number.isFinite(agility) ? agility : 0;
    const raw = Math.round(safeBase / (1 + safeAgility * 0.02));
    return clampNumber(DUNGEON_ATTACK_INTERVAL_MIN_MS, DUNGEON_ATTACK_INTERVAL_MAX_MS, raw);
};

export const resolveHeroAttackIntervalMsWithMultiplier = (
    baseAttackMs: number,
    agility: number,
    multiplier = 1
): number => {
    const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    const baseInterval = resolveHeroAttackIntervalMs(baseAttackMs, agility);
    const adjusted = Math.round(baseInterval * safeMultiplier);
    return clampNumber(DUNGEON_ATTACK_INTERVAL_MIN_MS, DUNGEON_ATTACK_INTERVAL_MAX_MS, adjusted);
};

const resolveAttackIntervalMultiplier = (weaponType: WeaponType | null | undefined) => {
    return weaponType === "Ranged" ? RANGED_ATTACK_INTERVAL_MULTIPLIER : 1;
};

export const resolveHeroAttackIntervalMsForWeapon = (
    baseAttackMs: number,
    agility: number,
    weaponType: WeaponType | null | undefined
) => {
    return resolveHeroAttackIntervalMsWithMultiplier(baseAttackMs, agility, resolveAttackIntervalMultiplier(weaponType));
};

export const resolveDamageTakenMultiplier = (weaponType: WeaponType | null | undefined) => {
    if (weaponType === "Ranged") {
        return RANGED_DAMAGE_TAKEN_MULTIPLIER;
    }
    if (weaponType === "Magic") {
        return MAGIC_DAMAGE_TAKEN_MULTIPLIER;
    }
    return MELEE_DAMAGE_TAKEN_MULTIPLIER;
};

export const resolveArmorDamageMultiplier = (armor: number) => {
    if (!Number.isFinite(armor) || armor <= 0) {
        return 1;
    }
    const reduction = Math.min(ARMOR_DAMAGE_REDUCTION_MAX, armor * ARMOR_DAMAGE_REDUCTION_PER_POINT);
    return Math.max(0, 1 - reduction);
};

export const resolveThreatMultiplier = (weaponType: WeaponType | null | undefined) => {
    return weaponType === "Melee" ? MELEE_THREAT_MULTIPLIER : 1;
};

export const resolveMagicHealAmount = (hpMax: number) => Math.max(1, Math.round(hpMax * MAGIC_HEAL_RATIO));

export const resolveHealAmount = (hpMax: number) => Math.max(1, Math.round(hpMax * 0.4));

export const resolveHeroAttackDamage = (combatLevel: number, strength: number): number => {
    const safeCombatLevel = Number.isFinite(combatLevel) ? combatLevel : 0;
    const safeStrength = Number.isFinite(strength) ? strength : 0;
    return Math.max(1, Math.round(10 + safeCombatLevel * 1.6 + safeStrength * 1.2));
};

export const applySkillLevelUps = (xp: number, level: number, xpNext: number, maxLevel: number, xpNextMultiplier: number) => {
    let nextXp = xp;
    let nextLevel = level;
    let nextXpNext = xpNext;

    while (nextXpNext > 0 && nextXp >= nextXpNext && nextLevel < maxLevel) {
        nextXp -= nextXpNext;
        nextLevel += 1;
        nextXpNext = Math.floor(nextXpNext * xpNextMultiplier);
    }

    return {
        xp: nextXp,
        level: nextLevel,
        xpNext: nextXpNext
    };
};

export const getFloorCombatXp = (tier: number, floor: number) => {
    return COMBAT_XP_BASE + (tier * COMBAT_XP_TIER_FACTOR) + floor;
};
