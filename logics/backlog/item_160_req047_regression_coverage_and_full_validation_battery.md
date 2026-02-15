## item_160_req047_regression_coverage_and_full_validation_battery - Add regression coverage and run full validation battery for request 047
> From version: 0.9.31
> Understanding: 92%
> Confidence: 86%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
This request spans security, PWA, offline runtime, CI policy, and refactors. Without a cross-cutting test gate, regressions are likely.

# Scope
- In:
- Add/adjust tests covering:
  - cloud silent refresh + auto-login
  - warmup retry/backoff behavior
  - PWA update wiring (client-side) at minimum
  - offline catch-up step cap invariants
- Run and pass full validation battery:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`
- Out:
- No new feature scope outside request 047.

# Acceptance criteria
- Regression coverage exists for the modified critical paths.
- Full validation battery passes before completion.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.
- Quality gate for items `item_152` through `item_159`.

