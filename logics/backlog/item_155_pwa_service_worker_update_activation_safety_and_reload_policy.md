## item_155_pwa_service_worker_update_activation_safety_and_reload_policy - Prevent mixed-version runtime by hardening SW update flow
> From version: 0.9.31
> Understanding: 92%
> Confidence: 84%
> Progress: 0%
> Complexity: High
> Theme: PWA / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
If the service worker activates immediately, a page can continue running with old in-memory code while fetching new chunks/assets later, leading to mixed-version runtime failures.

# Scope
- In:
- Adjust `public/sw.js` to avoid immediate takeover in production builds:
  - remove “always `skipWaiting()` on install” behavior (or gate it behind explicit user action)
  - keep safe cache-first behavior for static assets and navigation fallback
- Align frontend update UX with SW state machine:
  - show “update available” only when there is a `waiting` worker
  - activation must be triggered by user intent (preferred)
  - enforce prompt reload on controller change to avoid mixed assets
  - recommended: do not auto-reload during critical gameplay unless user confirms
- Add tests (where feasible):
  - unit tests for update wiring (event dispatch, activation call)
  - smoke test that calls activation path and asserts reload requested
- Out:
- No full Workbox migration.

# Acceptance criteria
- SW updates cannot produce a mixed-version runtime.
- “Update available” UX remains functional and results in controlled reload.
- Tests exist for the client-side wiring at minimum.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.

