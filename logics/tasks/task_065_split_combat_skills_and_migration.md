## task_065_split_combat_skills_and_migration - Split combat skills and migrate saves
> From version: 0.9.9
> Understanding: 94%
> Confidence: 91%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_079_split_combat_skills_and_migration.md`

# Decisions
- Replace `Combat` with `CombatMelee`, `CombatRanged`, `CombatMagic`.
- Evenly split legacy Combat XP/level across three skills.
- Recompute `xpNext` from the standard curve per skill.
- Default to Melee if no weapon equipped.
- No separate “Combat total” skill kept in v1.

# Plan
- [ ] 1. Add new skill IDs and definitions in `src/core/types.ts` + `src/data/definitions/skills.ts`.
- [ ] 2. Update any skill filters (e.g. action skills) and labels.
- [ ] 3. Add save migration to split Combat progress in `src/adapters/persistence/saveMigrations.ts`.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
