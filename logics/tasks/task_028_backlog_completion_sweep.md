## task_028_backlog_completion_sweep - Complete remaining backlog items
> From version: 0.8.14
> Understanding: 85%
> Confidence: 75%
> Progress: 100%

# Context
Sweep task to complete all backlog items that are not yet at 100%.

# Targets (not 100%)
- None.

# Plan
- [x] 1. Finish item_024: finalize docs + remaining validations if needed.
- [x] 2. Finish item_025: finalize docs + remaining validations if needed.
- [x] 3. Implement item_027: compact formatter applied everywhere (shop, sell, summaries, cloud meta).
- [x] 4. Implement item_028: action bonus tooltips + stun time line.
- [x] 5. Implement item_029: sell all + unit value.
- [x] 6. Implement item_030: last sync + visual diff in cloud panel.
- [x] 7. Implement item_031: “New” badges on menus/items with localStorage tracking.
- [x] 8. Implement item_032: memoized selectors + shallow equality where relevant.
- [x] FINAL: Update related Logics docs and backlog progress to 100%.

# Test plan
- Unit/UI tests for affected panels (Action, Inventory, Cloud, Shop).
- Run full suite: npm run tests, npm run lint, npm run typecheck.

# Risks & rollback
- Risk: UI regressions in core panels. Rollback by feature flag or reverting individual changes.
