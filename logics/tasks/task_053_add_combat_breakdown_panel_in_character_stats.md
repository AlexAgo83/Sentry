## task_053_add_combat_breakdown_panel_in_character_stats - Add combat breakdown panel in character stats
> From version: 0.9.5
> Understanding: 94%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_067_add_combat_breakdown_panel_in_character_stats.md`.

This task adds a dedicated Combat block in hero stats to expose Combat level, attack cadence, and damage composition in a readable base/modifiers/total format.

# Plan
- [ ] 1. Define Combat display model:
  - Centralize selectors/helpers for Combat display values (Lv, cooldown, attacks/sec, damage breakdown).
  - Keep formulas sourced from core domain values (no duplicated UI math drift).
- [ ] 2. Implement Character Stats UI panel:
  - Add a Combat sub-panel under the current stats panel.
  - Render rows for `Combat Lv`, `Attack cadence`, `Attacks/sec`, `Damage` with base/modifiers/total.
- [ ] 3. Ensure responsive rendering quality:
  - Preserve existing mobile/desktop readability and spacing.
  - Avoid overflow for long labels/values.
- [ ] 4. Wire data flow through container components/selectors.
- [ ] 5. Add focused UI/component tests for Combat panel rendering and value coherence.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

