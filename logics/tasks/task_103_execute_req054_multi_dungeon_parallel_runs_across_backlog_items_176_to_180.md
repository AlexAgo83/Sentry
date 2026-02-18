## task_103_execute_req054_multi_dungeon_parallel_runs_across_backlog_items_176_to_180 - Execute req054 multi-dungeon parallel runs across backlog items 176 to 180
> From version: 0.9.36
> Understanding: 96%
> Confidence: 92%
> Progress: 0%
> Complexity: High
> Theme: Gameplay / Dungeon UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_176_req054_enable_policy_driven_multi_dungeon_concurrency_in_lifecycle.md`
- `logics/backlog/item_177_req054_add_active_dungeon_run_selection_action_and_reducer_coverage.md`
- `logics/backlog/item_178_req054_build_dungeon_run_tabs_ui_with_new_entry_and_mobile_behavior.md`
- `logics/backlog/item_179_req054_wire_new_tab_to_setup_flow_with_concurrent_limit_guardrails.md`
- `logics/backlog/item_180_req054_expand_core_and_ui_regression_tests_for_multi_dungeon_navigation.md`

Request reference:
- `logics/request/req_054_multi_dungeon_parallel_runs_with_tab_navigation.md`

This orchestration task delivers req054 end-to-end:
- concurrent dungeon runs in core lifecycle,
- active run selection via dungeon tabs,
- `New` setup entry while runs continue,
- party selection guardrails for heroes already in dungeon,
- regression coverage for state + UI navigation behavior.

# Decisions (v1)
- No product-level max concurrent run cap in this scope.
- No run tabs when there is no active run.
- Tab labels:
  - desktop: `Dungeon 1`, `Dungeon 2`, ...
  - mobile: `1`, `2`, ...
- Tab order follows run start order; renumbering after run removal is accepted.
- `New` setup context hides/disables run-specific actions (`Stop` non-actionable).
- Replay remains global (`latestReplay`) and is not tied to selected run tab.
- Heroes already assigned to active runs stay visible in setup and are disabled with `In dungeon`.
- Ended runs are removed immediately from tabs, with deterministic focus fallback.
- No toast on automatic tab removal after run end.
- Mobile implementation does not introduce horizontal tab scrolling in this request.

# Plan
- [ ] 1. Execute `item_176` (core multi-run lifecycle enablement):
  - Remove single-run gating from dungeon start lifecycle.
  - Preserve start validation rules and hero exclusivity.
  - Keep deterministic active-run fallback on run end.
- [ ] 2. Execute `item_177` (active run selection action + reducer coverage):
  - Add explicit selection action (ex: `dungeonSetActiveRun`).
  - Guard invalid run ids safely.
  - Add reducer/state tests for selection and fallback behavior.
- [ ] 3. Execute `item_178` (tabs UI + New entry + mobile labels):
  - Render run tabs above Dungeon panel only when at least one run is active.
  - Add trailing `New` tab and wire run tab switching.
  - Enforce desktop/mobile label rules and start-order rendering.
- [ ] 4. Execute `item_179` (New setup flow + hero lock guardrails):
  - Show setup view when `New` is selected while runs keep progressing.
  - Hide/disable run controls in `New` context.
  - Disable already-assigned heroes with visible `In dungeon` status.
  - Use setup CTA label `Start new dungeon`.
- [ ] 5. Execute `item_180` (regression coverage and validation):
  - Add/extend core tests for multi-run + hero exclusivity.
  - Add/extend UI tests for tabs, `New`, and disabled heroes behavior.
  - Validate renumbering, no-tabs-when-empty, and fallback selection rules.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

Recommended:
- `npm run build`
- `npm run test:e2e`

# Report
Track final delivery with:
- core lifecycle/reducer changes,
- dungeon tab and setup flow behavior changes,
- tests added/updated,
- validation results and residual risks.
