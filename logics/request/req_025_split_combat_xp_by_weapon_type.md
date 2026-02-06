## req_025_split_combat_xp_by_weapon_type - Split combat XP by weapon type
> From version: 0.9.9
> Understanding: 95%
> Confidence: 92%

# Needs
- Split Combat progression into three skills: `CombatMelee`, `CombatRanged`, `CombatMagic`.
- Attribute dungeon combat XP based on the equipped weapon category.
- Preserve determinism and support save migration.

# Context
- Weapons are now category-driven (Melee/Ranged/Magic) and should have distinct progression.
- Current single Combat skill is too coarse for weapon-driven gameplay.

# Goals
- Distinct, readable progression for Melee/Ranged/Magic combat.
- Backward-compatible migration from `Combat`.
- Minimal UI noise outside Stats/Dungeon.

# Locked decisions (v1)
- Replace `Combat` with `CombatMelee`, `CombatRanged`, `CombatMagic`.
- XP attribution based on equipped `WeaponType`.
- If no weapon equipped, default to `CombatMelee`.
- Migration: split existing `Combat` XP/level evenly across the three skills (rounding as needed); recompute `xpNext` per new skill curve.
- UI: show the three skills in Stats and Dungeon views only; keep Action screen minimal.

# Scope detail (draft)
- Data:
  - Add new skill IDs and definitions.
  - Update labels and icons as needed.
- Combat runtime:
  - Route combat XP to the weapon-type skill.
  - Ensure offline/replay determinism.
- Migration:
  - Migrate existing saves by splitting `Combat` XP/level.
- UI:
  - Stats and Dungeon panels display the three combat skills.
  - Action screen does not surface the split.

# Technical references to update
- `src/core/types.ts`
- `src/data/definitions/skills.ts`
- `src/data/definitions/actions.ts`
- `src/core/dungeon.ts`
- `src/adapters/persistence/saveMigrations.ts`
- `src/app/ui/skillIcons.tsx`
- `src/app/components/CharacterStatsPanel.tsx`
- `src/app/components/DungeonScreen.tsx`

# Acceptance criteria
- Combat XP is routed deterministically by weapon type.
- Players without a weapon progress `CombatMelee`.
- Existing saves migrate without data loss.
- Stats and Dungeon screens show the split skills; Action screen remains unchanged.

# Risks / open points
- UI space constraints for multiple combat skills.
- Balancing xp curves across three skills.

# Backlog
- To be split after approval.
