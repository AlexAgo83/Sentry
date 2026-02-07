## task_081_dungeon_auto_consumables_state - Persist auto-consumables toggle and gate consumption logic
> From version: 0.9.10
> Owner: —
> Status: Done
> Understanding: 95%
> Confidence: 94%
> Progress: 100%

# Summary
Persist an auto-consumables toggle and make dungeon auto-use respect it.

# Dependencies
- item_095_dungeon_auto_consumables_state

# Steps
1. Add `autoConsumables` to dungeon setup state (defaults to enabled if consumables exist and no prior value is saved).
2. Persist the toggle in saves alongside other dungeon setup data.
3. Derive `hasConsumables` from inventory counts of `potion`, `tonic`, `elixir`.
4. Gate all auto-consume logic (potion/tonic/elixir) behind the toggle.
5. Preserve the stored toggle state even when consumables hit zero (UI disables only).
6. Keep existing auto-consume priority order unchanged.
7. Add a unit test or focused logic test if appropriate.

# Decisions
- Consumables covered: `potion`, `tonic`, `elixir`.
- Default enabled when any consumable exists.
- When inventory has zero consumables, keep stored value but disable interaction.
- If no stored value exists, initialize to `true` when `hasConsumables` is true.
- Toggle only affects combat auto-consume behavior (no other systems).

# Acceptance criteria
- Auto-consume logic respects `autoConsumables`.
- Toggle persists across reloads like auto-restart.
- No auto-use occurs when toggle is off.
