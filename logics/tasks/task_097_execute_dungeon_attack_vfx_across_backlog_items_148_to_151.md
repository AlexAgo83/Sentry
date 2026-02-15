## task_097_execute_dungeon_attack_vfx_across_backlog_items_148_to_151 - Execute dungeon attack VFX across backlog items 148 to 151
> From version: 0.9.30
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Visuals
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_148_add_pixi_attack_vfx_layer_and_pooling.md`
- `logics/backlog/item_149_add_melee_arc_vfx_and_limit_lunge_to_melee.md`
- `logics/backlog/item_150_add_ranged_projectile_and_magic_beam_vfx.md`
- `logics/backlog/item_151_add_attack_vfx_regression_tests_and_full_validation.md`

Request reference:
- `logics/request/req_046_dungeon_attack_vfx_arc_projectile_spell_beam.md`

This task adds lightweight, readable attack VFX (arc/projectile/beam) in the Pixi dungeon renderer while keeping performance stable through pooling and caps.

# Decisions (v1)
- VFX are Pixi-based and time-driven using existing `attackCues` + `frame.atMs`.
- Weapon type drives VFX kind:
  - `Melee` -> arc + lunge
  - `Ranged` -> projectile (no lunge)
  - `Magic` -> beam (no lunge)
  - missing -> melee arc fallback (and current lunge semantics)
- Effects must be pooled and concurrency-capped.
- Final delivery requires full test battery pass.

# Plan
- [x] 1. Execute `item_148` (VFX layer + pooling):
  - Add VFX container and pool in Pixi runtime.
  - Add constants for durations/sizes/colors and a max concurrent cap.
- [x] 2. Execute `item_149` (melee arc + lunge gating):
  - Draw oriented arc in front of attacker.
  - Apply lunge only for melee attackers.
- [x] 3. Execute `item_150` (ranged + magic VFX):
  - Add projectile travel for ranged.
  - Add translucent beam for magic.
- [x] 4. Execute `item_151` (tests + full battery):
  - Add targeted regression tests.
  - Run full validation battery and fix failures.
- [x] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`
