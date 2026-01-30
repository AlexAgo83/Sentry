## task_028_backlog_completion_sweep - Complete remaining backlog items
> From version: 0.8.14
> Understanding: 85%
> Confidence: 75%
> Progress: 0%

# Context
Sweep task to complete all backlog items that are not yet at 100%.

# Targets (not 100%)
- item_024_cloud_save_backend_and_conflict_ui (80%)
- item_025_db_dump_and_reset_utilities (85%)
- item_027_compact_number_formatting (40%)
- item_028_action_bonus_tooltips_and_stun_time (40%)
- item_029_inventory_sell_all_and_unit_value (0%)
- item_030_cloud_last_sync_and_meta_diff (0%)
- item_031_new_badges_for_menus_and_items (0%)
- item_032_selector_memoization_pass (0%)

# Plan
- [ ] 1. Finish item_024: finalize docs + remaining validations if needed.
- [ ] 2. Finish item_025: finalize docs + remaining validations if needed.
- [ ] 3. Implement item_027: compact formatter applied everywhere (shop, sell, summaries, cloud meta).
- [ ] 4. Implement item_028: action bonus tooltips + stun time line.
- [ ] 5. Implement item_029: sell all + unit value.
- [ ] 6. Implement item_030: last sync + visual diff in cloud panel.
- [ ] 7. Implement item_031: “New” badges on menus/items with localStorage tracking.
- [ ] 8. Implement item_032: memoized selectors + shallow equality where relevant.
- [ ] FINAL: Update related Logics docs and backlog progress to 100%.

# Test plan
- Unit/UI tests for affected panels (Action, Inventory, Cloud, Shop).
- Run full suite: npm run tests, npm run lint, npm run typecheck.

# Risks & rollback
- Risk: UI regressions in core panels. Rollback by feature flag or reverting individual changes.
