## item_153_backend_cors_allowlist_and_auth_middleware_short_circuit - Restrict CORS and ensure auth middleware stops execution
> From version: 0.9.31
> Understanding: 92%
> Confidence: 86%
> Progress: 0%
> Complexity: Medium
> Theme: Security
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Backend CORS is overly permissive in production and auth middleware may continue after sending 401, increasing risk and making behavior harder to reason about.

# Scope
- In:
- Implement production CORS allowlist:
  - introduce `CORS_ORIGINS` env var (comma-separated origins)
  - in prod: reject any origin not in allowlist (while `credentials: true`)
  - in non-prod: allow localhost origins for developer convenience
- Ensure auth preHandler short-circuits:
  - after sending 401, it must return/throw and prevent handler execution
- Add backend tests for:
  - CORS allowlist behavior (at least unit-level logic tests)
  - unauthorized path does not proceed (no “double send”, no handler body execution)
- Out:
- No new auth features beyond correctness (same JWT model).

# Acceptance criteria
- Production CORS only accepts configured origins.
- Unauthorized requests do not proceed past auth middleware.
- Tests cover both behaviors.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.

