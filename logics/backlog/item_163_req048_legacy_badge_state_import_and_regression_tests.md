## item_163_req048_legacy_badge_state_import_and_regression_tests - Import legacy localStorage badge state once and add regression tests
> From version: 0.9.31
> Understanding: 90%
> Confidence: 88%
> Progress: 100%
> Complexity: Medium
> Theme: Migration / Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Existing players may have a long history of seen/unseen badges stored in `localStorage`. If we abruptly switch to persisted badge state without migration, users may see a “badge flood” or lose their seen history.

# Scope
- In:
- Implement a one-time legacy import path on upgrade:
  - if save has no badge state yet, optionally read legacy `localStorage` keys and merge into persisted `ui.inventoryBadges`.
  - after successful import, stop reading legacy keys as a source of truth.
- Ensure migration is safe and deterministic:
  - invalid item ids ignored
  - unknown keys ignored
  - import runs at most once
- Add/adjust tests:
  - save serialization round-trip includes badge state
  - migration seeds “owned items seen” baseline when no legacy state exists
  - legacy import maps to persisted state and is not re-applied repeatedly
- Out:
- No broader UI preference migrations.

# Acceptance criteria
- Upgrading does not cause a flood of NEW badges.
- Legacy `localStorage` badge state (when present) is preserved via import and then becomes irrelevant.
- Automated tests cover the upgrade path and invariants.

# Implementation notes
- Likely touch points:
  - `src/adapters/persistence/saveMigrations.ts`
  - `src/app/hooks/useInventoryNewBadges.ts` (legacy read should be migration-only)
  - tests:
    - `tests/app/hooks/useInventoryNewBadges.test.tsx`
    - `tests/adapters/persistence/saveMigrations.test.ts`
    - `tests/core/serialization.test.ts`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_048_persist_inventory_new_item_badges_in_save.md`.
