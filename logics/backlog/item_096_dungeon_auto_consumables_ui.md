## item_096_dungeon_auto_consumables_ui - Add auto-consumables toggle next to auto restart
> From version: 0.9.10
> Understanding: 92%
> Confidence: 90%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need a visible control to enable/disable automatic consumable usage during dungeon runs.

# Scope
- In:
- Add a toggle UI next to the auto-restart control in the dungeon header.
- Disable the toggle when no consumables are available.
- Keep it enabled by default when possible.
- Out:
- No redesign of the dungeon control layout beyond the new toggle.

# Decisions
- Location: next to the existing auto-restart control.
- Label: `Auto consumables`.
- Disabled state when inventory has zero consumables.
- Toggle state is remembered from the persisted setup state.
- Keep layout and interaction style consistent with the auto-restart control.

# Acceptance criteria
- Toggle is visible next to auto-restart.
- Toggle is disabled when no consumables exist.
- UI reflects current persisted toggle state.
- Default state is enabled when consumables exist.
- Disabled state communicates why it is unavailable (tooltip or helper copy).

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_033_dungeon_auto_consumables_toggle.md`.
