## item_154_cloud_warmup_retry_backoff_and_status_semantics - Handle backend warmup without false logout
> From version: 0.9.31
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
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

# Implementation notes
- Warmup retry/backoff with bounded delays + jitter; retries are cancellable on logout/offline:
  - `src/app/hooks/useCloudSave.ts`
- Request timeouts:
  - `src/app/api/cloudClient.ts`
- Existing panel tests cover warming/offline UX and retry affordance:
  - `tests/app/cloudSavePanel.test.tsx`

Delivered in commits: `14a419e`.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.
