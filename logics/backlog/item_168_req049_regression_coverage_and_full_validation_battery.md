## item_168_req049_regression_coverage_and_full_validation_battery - Add regression coverage for auto-sync and run full validation battery
> From version: 0.9.31
> Understanding: 90%
> Confidence: 86%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Cloud auto-sync is high-risk: it touches auth, save integrity, and edge cases across devices. Without regression coverage, we risk silent data loss.

# Scope
- In:
- Add/adjust automated tests covering:
  - backend revision/token behavior and 409 conflicts
  - frontend auto-sync toggle enable/disable
  - startup auto-load decision (cloud newer vs local newer)
  - conflict surfaced and requires explicit user action
  - warmup/offline retry does not clear auth state
- Run and pass full validation battery:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`
- Out:
- No additional feature scope outside request 049.

# Acceptance criteria
- Regression coverage exists for the critical paths and conflict safety.
- Full validation battery passes before completion.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling.md`.

