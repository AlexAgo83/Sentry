## task_053_add_combat_breakdown_panel_in_character_stats - Add combat breakdown panel in character stats
> From version: 0.9.5
> Understanding: 94%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_067_add_combat_breakdown_panel_in_character_stats.md`.

This task adds a dedicated Combat block in hero stats to expose Combat level, attack cadence, and damage composition in a readable base/modifiers/total format.

# Decisions (v1)
- Render `Attack cadence` in ms and `Attacks/sec` with 2 decimals.
- Centralize combat display math in selectors so UI only formats values.
- Always show base/modifiers/total rows even when values are zero.

# Suggestions (v1 defaults)
- Render `Attack cadence` as milliseconds (rounded to nearest 1ms) and `Attacks/sec` as a derived value with 2 decimals.
- Source `Combat Lv`, cadence, and damage from shared selectors that read core domain values, not UI math.
- Show `base`, `modifiers`, and `total` in a consistent three-column row format to match the existing stats panel style.
- For empty or unavailable values, prefer `0` with a muted style rather than hiding rows to keep layout stable.

# Open questions to confirm
- Do we want `Attack cadence` to show both ms and seconds, or ms only?
- Should `Damage` modifiers include temporary buffs/debuffs or only persistent gear modifiers?

# Plan
- [x] 1. Define Combat display model:
  - Centralize selectors/helpers for Combat display values (Lv, cooldown, attacks/sec, damage breakdown).
  - Keep formulas sourced from core domain values (no duplicated UI math drift).
- [x] 2. Implement Character Stats UI panel:
  - Add a Combat sub-panel under the current stats panel.
  - Render rows for `Combat Lv`, `Attack cadence`, `Attacks/sec`, `Damage` with base/modifiers/total.
- [x] 3. Ensure responsive rendering quality:
  - Preserve existing mobile/desktop readability and spacing.
  - Avoid overflow for long labels/values.
- [x] 4. Wire data flow through container components/selectors.
- [x] 5. Add focused UI/component tests for Combat panel rendering and value coherence.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Added a shared combat display selector and formatting for base/modifier/total values.
- Rendered the Combat breakdown in both StatsDashboardPanel and CharacterStatsPanel.
- Updated stats panel styles for aligned combat columns and responsive layout.
- Added UI tests to assert Combat breakdown rows and values render as expected.

