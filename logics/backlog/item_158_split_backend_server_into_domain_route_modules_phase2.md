## item_158_split_backend_server_into_domain_route_modules_phase2 - Split backend/server.js into domain-focused route modules (phase 2)
> From version: 0.9.31
> Understanding: 88%
> Confidence: 78%
> Progress: 0%
> Complexity: Medium
> Theme: Refactor
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`backend/server.js` is a large change hotspot, making modifications risky and slowing iteration.

# Scope
- In:
- Split backend routes by domain without changing behavior:
  - auth
  - saves
  - profile
  - leaderboard
  - changelog
  - health/infra
- Ensure test coverage remains intact and route wiring remains identical.
- Out:
- No API contract changes; refactor only.

# Acceptance criteria
- Backend routes are modularized and easier to navigate.
- All backend tests pass; no behavior regressions.

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.
- Should be executed after phase 1 correctness hardening and test additions.

