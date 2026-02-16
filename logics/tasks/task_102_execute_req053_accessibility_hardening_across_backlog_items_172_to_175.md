## task_102_execute_req053_accessibility_hardening_across_backlog_items_172_to_175 - execute req053 accessibility hardening across backlog items 172 to 175
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: High
> Theme: Accessibility / UI quality
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_172_req053_modal_and_dialog_accessibility_contract_hardening.md`
- `logics/backlog/item_173_req053_tabs_aria_semantics_and_keyboard_consistency.md`
- `logics/backlog/item_174_req053_dungeon_replay_log_semantic_control_cleanup.md`
- `logics/backlog/item_175_req053_expanded_accessibility_regression_test_suite.md`

Request reference:
- `logics/request/req_053_accessibility_compliance_hardening_for_dialogs_tabs_and_keyboard_flows.md`

This orchestration task executes the accessibility hardening plan end-to-end:
- document + dialog semantics,
- tab ARIA/keyboard consistency,
- semantic control cleanup in replay logs,
- expanded accessibility regression coverage.

# Decisions (v1)
- Prioritize shared accessibility contracts first (document language + modal semantics), then component-specific fixes.
- Preserve visual/UI behavior while improving semantics and keyboard/screen-reader reliability.
- Use native semantic controls wherever feasible.
- Complete with full validation battery defined in request/backlog.

# Plan
- [ ] 1. Execute `item_172` (document + dialog contract hardening):
  - Add `<html lang=\"...\">` at document root.
  - Harden modal shell accessibility contract:
    - accessible naming (`aria-labelledby` and/or `aria-label`),
    - focus lifecycle (initial focus, trap, restore).
  - Align startup splash and mobile roster drawer dialog semantics.
- [ ] 2. Execute `item_173` (tabs ARIA + keyboard consistency):
  - Standardize tab semantics/relationships for side panel switcher, inventory sort tabs, and stats tabs.
  - Implement and verify consistent keyboard navigation expectations.
- [ ] 3. Execute `item_174` (replay log semantic cleanup):
  - Replace non-native interactive replay log elements with semantic button controls.
  - Preserve replay seek behavior and visual output.
- [ ] 4. Execute `item_175` (expanded accessibility regression suite):
  - Expand a11y tests to cover modals, splash dialog, tabs, and replay interactions.
  - Add keyboard behavior assertions where axe is insufficient.
  - Ensure tests remain stable and deterministic.
- [ ] FINAL: Update related Logics docs

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
- implemented files/components,
- accessibility behavior changes,
- test additions/updates,
- validation results and residual risks.
