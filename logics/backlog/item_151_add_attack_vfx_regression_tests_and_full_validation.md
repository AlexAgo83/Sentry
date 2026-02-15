## item_151_add_attack_vfx_regression_tests_and_full_validation - Add attack VFX regression tests and full validation
> From version: 0.9.30
> Understanding: 90%
> Confidence: 84%
> Progress: 100%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Renderer changes can silently regress (crashes in edge cases, lunge behavior leaking to ranged/magic, effects not cleaned up).

# Scope
- In:
- Add unit-level tests for effect selection logic (weaponType -> effect kind).
- Add tests ensuring lunge is only applied for melee (and not for ranged/magic).
- Add tests ensuring renderer does not throw when cues reference missing units.
- Run the full validation battery.
- Out:
- No visual snapshot testing.

# Acceptance criteria
- Tests cover lunge gating and cue stability.
- Full validation battery passes:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_046_dungeon_attack_vfx_arc_projectile_spell_beam.md`.
