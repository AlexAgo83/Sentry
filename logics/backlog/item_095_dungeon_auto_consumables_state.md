## item_095_dungeon_auto_consumables_state - Persist auto-consumables toggle and gate consumption logic
> From version: 0.9.10
> Understanding: 92%
> Confidence: 90%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Players need control over automatic consumable usage (including auto-used potions) during dungeon fights.

# Scope
- In:
- Add a persisted toggle `autoConsumables` in dungeon setup state.
- Default to enabled when at least one consumable is available.
- Gate dungeon auto-consume behavior (potion/tonic/elixir) based on the toggle.
- Out:
- No balance changes to consumable effects.
- No changes to loot/reward logic.

# Decisions
- Toggle name: `autoConsumables`.
- Persisted in the save alongside auto-restart settings.
- Default behavior:
  - Enabled if at least one consumable exists.
  - Disabled if none exist.
- If consumables drop to zero, keep the stored toggle value but disable interaction.
- If consumables return, restore the stored toggle state.
- Consumables covered:
  - `potion`, `tonic`, `elixir` (including auto-used potions during fights).

# Acceptance criteria
- Dungeon auto-consume logic respects the toggle.
- Toggle state persists across sessions (like auto-restart).
- Auto-consumed potions are disabled when the toggle is off.
- Toggle state does not silently flip when inventory changes (only disabled/enabled).

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_033_dungeon_auto_consumables_toggle.md`.
