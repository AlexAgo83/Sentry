## task_082_dungeon_auto_consumables_ui - Add auto-consumables toggle in dungeon UI
> From version: 0.9.10
> Owner: —
> Status: Planned
> Understanding: 93%
> Confidence: 91%
> Progress: 0%

# Summary
Expose the auto-consumables toggle next to auto-restart in the dungeon header.

# Dependencies
- item_096_dungeon_auto_consumables_ui
- task_081_dungeon_auto_consumables_state

# Steps
1. Add a toggle control labeled `Auto consumables` near auto-restart.
2. Disable the toggle when inventory has zero consumables.
3. Show a hint or tooltip explaining why it is disabled.
4. Bind the toggle to the persisted `autoConsumables` state.
5. Show current consumable availability (count or indicator) if it fits the layout.
6. Match visual style of existing dungeon controls.

# Decisions
- Control style: consistent with auto-restart button group.
- Disabled state communicates lack of consumables.
- Tooltip copy suggestion: `Requires at least 1 consumable (potion, tonic, elixir).`
- Do not hide the toggle; keep it visible but disabled when unavailable.

# Acceptance criteria
- Toggle is visible next to auto-restart.
- Toggle reflects persisted state and updates on click.
- Disabled state appears when no consumables exist.
