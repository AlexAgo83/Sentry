## item_067_add_combat_breakdown_panel_in_character_stats - Add combat breakdown panel in character stats
> From version: 0.9.5
> Understanding: 94%
> Confidence: 90%
> Progress: 0%

# Problem
Players cannot easily understand combat power composition from the current stats screen, especially for cadence and damage contributors.

# Scope
- In:
  - Add a dedicated Combat panel under the existing character stats section.
  - Show `Combat Lv` plus structured breakdown rows:
    - base
    - modifiers
    - total
  - Expose and render attack cadence fields (cooldown and/or attacks per second).
  - Expose and render combat damage breakdown with same base/modifier/total pattern.
  - Keep visual consistency with current stats panel style and responsive behavior.
- Out:
  - Large redesign of all hero stats screens.
  - Non-combat metric additions unrelated to req_020.

# Decisions (v1)
- Render `Attack cadence` in ms and `Attacks/sec` with 2 decimals.
- Centralize combat display math in selectors so UI only formats values.
- Always show base/modifiers/total rows even when values are zero.

# Recommended defaults (v1)
- Render `Attack cadence` in ms and `Attacks/sec` as a derived value with 2 decimals.
- Centralize combat display math in selectors so UI only formats values.
- Keep rows stable even when values are zero to avoid layout shifts.

# Open questions
- Should temporary buffs/debuffs be included in `modifiers` for `Damage` and `Combat Lv`?
- Do we want `Attack cadence` to show both ms and seconds or ms only?

# Acceptance criteria
- Character stats view contains a dedicated Combat block with readable breakdown rows.
- Combat panel values are non-empty and consistent with runtime formulas.
- Mobile and desktop layouts remain usable without overflow/regression.
- Existing stats functionality remains intact.

# Priority
- Impact: High (player clarity and trust in combat progression).
- Urgency: High (key UX objective in req_020).

# Notes
- Source request: `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`
- Derived from `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`.

