## task_004_inventory - Execute backlog item 005
> From version: 0.3.1
> Understanding: 96%
> Confidence: 93%
> Progress: 0%

# Context
This task executes `item_005_inventory`.

# Plan
- [ ] 1. Extend core types/state/save schema with global inventory and inventory gold (sum players on migration).
- [ ] 2. Add item production/consumption rules to the action loop (Hunting/Cooking).
- [ ] 3. Update UI with a collapsible inventory side panel (open by default) showing gold, and remove gold from Action status.
- [ ] 4. Wire action blocking/auto-stop when required items are missing, with a missing-items hint.
- [ ] 5. Update offline recap to include per-player item deltas plus global totals.
- [ ] 6. Add/adjust tests for inventory persistence, action blocking, and save migration.
- [ ] FINAL: Update backlog/task docs and ensure behavior matches acceptance.
