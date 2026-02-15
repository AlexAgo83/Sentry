## item_154_cloud_warmup_retry_backoff_and_status_semantics - Handle backend warmup without false logout
> From version: 0.9.31
> Understanding: 93%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Reliability / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Render cold starts can cause slow or failing initial backend requests. If we treat these as auth failures, users get logged out incorrectly and the auto-login experience becomes flaky.

# Scope
- In:
- Define and enforce cloud status semantics:
  - `ready` vs `offline` vs `warming` vs `error`
  - only 401/403 should transition to “requires login”
  - network/timeouts/503 should remain recoverable (`offline`/`warming`)
- Add retry/backoff policy for warmup/refresh:
  - recommended: timeout 4s per attempt
  - retry: 1s, 2s, 4s, 8s, 16s (cap 30s) + jitter
  - stop retries on explicit logout or when cloud is disabled
- Ensure UI surfaces show correct copy and allow manual retry.
- Tests:
  - simulated warmup failure does not clear auth state
  - eventual success recovers to ready
- Out:
- No full-blown connectivity framework; keep it local to cloud module(s).

# Acceptance criteria
- Cold-start backend behavior yields a recoverable UX (warming/offline) without forcing logout.
- Retry policy is implemented and test-covered.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.

