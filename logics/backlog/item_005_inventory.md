## item_005_inventory - Inventory
> From version: 0.3.1
> Understanding: 92%
> Confidence: 88%
> Progress: 100%

# Context
This item formalizes `req_002_inventory`.

# Goal
Introduce a global inventory and item-based production/consumption in the TS rewrite, with shared gold across the account.

# Needs
- Global inventory shared across all players.
- Inventory side panel (same layout style as Action status) opened via a button under "recruit new hero".
- Stackable items with no limits.
- Start with Hunting producing meat and Cooking consuming meat to produce food.
- Missing required items must stop the skill from starting.
- Inventory changes must be saved in the same save schema and included in the offline recap.
- Gold becomes global to the account (not per player) and lives inside the inventory.

# Defaults (proposal)
- Panel is collapsible and open by default (like Action status); toggle via the button under "recruit new hero".
- Item IDs: `meat`, `food`.
- Rates: Hunting +1 meat per completed action; Cooking -1 meat and +1 food per completed action.
- Blocking: Start action is disabled when required items are missing with a hint (e.g. "Missing: Meat x1"); if running and meat hits 0, auto-stop.
- Gold is shown in the inventory panel and removed from Action status.
- Offline recap shows per-player item deltas plus a total inventory delta summary.
- Save inventory as `{ [itemId]: number }`.
- Save migration: sum all players' gold into inventory gold, then zero per-player gold in saved data.

# Scope (v1)
- Only Hunting/Cooking items.
- Base items only (no quality/rarity).

# Acceptance
- Inventory panel is accessible and displays item stacks correctly.
- Actions produce/consume items; missing inputs prevent action start.
- Offline recap includes item changes.
- Save/load persists inventory and global gold.

# Open questions
- None (defaults accepted).

# Problem
Promoted from `logics/request/req_002_inventory.md`.
The game needs a global inventory shared across all players, with stackable items and a dedicated UI panel.

# Scope
- In:
  - Add a global inventory shared across all players.
  - Add an inventory side panel, opened via a button under "recruit new hero".
  - Introduce stackable items with no limits & svg asset; start with Hunting producing meat and Cooking consuming meat to produce food.
- Out:

# Priority
- Impact:
- Urgency:

# Notes
- Derived from `logics/request/req_002_inventory.md`.
