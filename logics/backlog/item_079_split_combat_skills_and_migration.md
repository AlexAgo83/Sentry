## item_079_split_combat_skills_and_migration - Split combat skills and migrate saves
> From version: 0.9.9
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Combat progression is too coarse. We need separate Melee/Ranged/Magic combat skills and a safe migration path.

# Scope
- In:
- Add `CombatMelee`, `CombatRanged`, `CombatMagic` skill IDs and definitions.
- Remove/replace `Combat` as a progression target.
- Save migration: split existing Combat XP/level evenly across the three skills and recompute `xpNext`.
- Out:
- No changes to non-combat skills.

# Decisions
- Even split of legacy Combat progress across the three new skills (rounding as needed).
- Recompute `xpNext` from the standard curve per skill.
- Default to Melee when no weapon is equipped.
- No separate “Combat total” skill is kept in v1.

# Acceptance criteria
- Save migration runs without data loss or crashes.
- Players see three combat skills after migration.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_025_split_combat_xp_by_weapon_type.md`.
