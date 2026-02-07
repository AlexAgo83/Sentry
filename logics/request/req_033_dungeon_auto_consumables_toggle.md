## req_033_dungeon_auto_consumables_toggle - Add auto consumables toggle near auto restart
> From version: 0.9.10
> Understanding: 92%
> Confidence: 90%

# Needs
- Add an "Auto consumables" toggle next to the dungeon auto-restart toggle.
- The toggle is only actionable if the player has at least 1 consumable.
- Default to enabled when possible.
- Remember the user choice like auto-restart does.
- This toggle must also control the auto-consumed potions during fights.

# Context
- Dungeon runs already consume items automatically; players want explicit control.
- The toggle should be visible alongside auto-restart for quick adjustments.

# Goals
- Provide a clear on/off switch for auto consumable usage in dungeon runs.
- Keep the toggle state persistent in the dungeon setup config.
- Prevent enabling when no consumables are available.

# Locked decisions (v1)
- The toggle is shown next to the auto-restart control.
- The toggle is enabled by default if at least one consumable is available.
- The choice is saved and reused across sessions (same behavior as auto-restart).
- The toggle is disabled if no consumables are available.
- Auto-consumed potions during fights are governed by this toggle.
- If consumables run out, keep the stored choice but disable the toggle until consumables return.

# Scope detail (draft)
- Data:
  - Add `autoConsumables` to dungeon setup state and persist it with the save.
- Define "consumables" for this toggle as dungeon-use items (ex: `tonic`, `elixir`, `potion`), including auto-consumed potions during fights.
- UI:
  - Add a checkbox or switch labeled `Auto consumables` near the auto-restart toggle.
  - Show a disabled state with a hint if no consumables are in inventory.
- Logic:
  - When disabled, skip auto-consume behavior in dungeon combat (including potion auto-use).
  - When enabled, keep current auto-consume behavior.

# Technical references to update
- `src/core/dungeon.ts` (auto consume logic)
- `src/core/types.ts` (dungeon setup config)
- `src/core/state.ts` (initial state defaults)
- `src/app/components/DungeonScreen.tsx` (toggle UI)
- `src/app/styles/panels/dungeon.css` (toggle styling)

# Acceptance criteria
- The toggle appears next to auto-restart in the dungeon UI.
- It is enabled only when at least one consumable exists.
- Default state is enabled when possible.
- The setting persists like auto-restart.

# Risks / open points
- Confirm the exact list of consumables covered by the toggle.
- Decide if "food" should be treated as a consumable here or not.

# Backlog
- To be split after approval.
