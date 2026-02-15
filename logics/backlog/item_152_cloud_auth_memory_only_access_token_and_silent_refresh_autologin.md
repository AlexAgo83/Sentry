## item_152_cloud_auth_memory_only_access_token_and_silent_refresh_autologin - Keep auto-login while removing persistent access token storage
> From version: 0.9.31
> Understanding: 97%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Security / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The Cloud access token is currently persisted in browser storage, which increases the blast radius of an XSS. Removing this persistence must not break the “auto-login” UX on relaunch.

# Scope
- In:
- Stop persisting Cloud access tokens in `localStorage` (production behavior).
- Implement a startup “silent refresh” to preserve auto-login:
  - boot starts in `checking/warming` state
  - call `POST /api/v1/auth/refresh` with `credentials: include` + CSRF header
  - on success: store access token in memory only and proceed as authenticated
  - on 401/403: clear auth state and require login
  - on warmup/network/offline: keep recoverable state and retry with backoff (do not force logout)
- Make CSRF token handling single-source and resilient:
  - recommended: CSRF token stored in local storage only (no cookie reads)
  - if refresh returns 403 while backend is reachable, clear stored CSRF token and retry refresh once
- Add/adjust UI messaging for:
  - offline / unreachable backend
  - backend warming up / retrying
  - unauthorized / session expired
- Tests:
  - ensure access token is not written to localStorage
  - ensure relaunch path attempts refresh and authenticates when cookie is valid
  - ensure warmup failures do not trigger logout
- Out:
- No password reset / email verification scope.
- No change to refresh-token rotation semantics beyond what is needed for startup refresh UX.

# Acceptance criteria
- Access token is not stored in `localStorage` in production.
- Auto-login works after app relaunch when refresh cookie is still valid.
- Only 401/403 invalidates the session; network/warmup failures do not.
- Tests exist covering token storage and silent refresh behavior.

# Implementation notes
- Access token storage is memory-only (legacy persisted tokens are purged best-effort):
  - `src/app/api/cloudClient.ts`
- Startup silent refresh + warmup semantics:
  - `src/app/hooks/useCloudSave.ts`
- Test coverage:
  - `tests/app/cloudSavePanel.test.tsx`
  - `tests/app/cloudSaveModal.test.tsx`

Delivered in commits: `14a419e`.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.
