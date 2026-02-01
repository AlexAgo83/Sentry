## task_004_inventory - Execute backlog item 005
> From version: 0.3.1
> Understanding: 96%
> Confidence: 93%
> Progress: 100%

# Context
Derived from `logics/backlog/item_005_inventory.md`.
This task executes `item_005_inventory`.

# Plan
- [x] 1. Extend core types/state/save schema with global inventory and inventory gold (sum players on migration).
- [x] 2. Add item production/consumption rules to the action loop (Hunting/Cooking).
- [x] 3. Update UI with a collapsible inventory side panel (open by default) showing gold, and remove gold from Action status.
- [x] 4. Wire action blocking/auto-stop when required items are missing, with a missing-items hint.
- [x] 5. Update offline recap to include per-player item deltas plus global totals.
- [x] 6. Add/adjust tests for inventory persistence, action blocking, and save migration.
- [x] FINAL: Update backlog/task docs and ensure behavior matches acceptance.

# Report
1. Added global inventory state + migration to sum legacy per-player gold into inventory gold.
2. Implemented item production/consumption (Hunting meat, Cooking meat-to-food) and auto-stop on missing items.
3. Added a collapsible inventory panel and removed gold from Action status; roster now opens inventory.
4. Added missing-items hint and Start action blocking when requirements are not met.
5. Expanded offline recap to include item deltas per player and total inventory changes.
6. Updated core tests for inventory rewards, action blocking, and save migration.

# Validation
- npm run tests
- npm run lint

# Notes
