## task_066_route_dungeon_xp_by_weapon_type - Route dungeon XP by weapon type
> From version: 0.9.9
> Understanding: 93%
> Confidence: 90%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_080_route_dungeon_xp_by_weapon_type.md`

# Decisions
- Weapon type is the sole XP router.
- Missing weapon defaults to Melee.
- If weapon changes mid-run, XP routing updates immediately.

# Plan
- [ ] 1. Update dungeon combat XP routing in `src/core/dungeon.ts` to select the weapon-type skill.
- [ ] 2. Ensure offline/replay determinism with the new routing.
- [ ] 3. Update tests for XP attribution.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
