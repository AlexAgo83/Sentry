## task_086_fix_cloud_auth_prod_cross_origin - Fix prod cloud auth refresh across Render subdomains
> From version: 0.9.11
> Owner: —
> Status: Done
> Understanding: 86%
> Confidence: 82%
> Progress: 100%

# Summary
Ensure refresh-token auth works in production when frontend and backend are on different Render subdomains.

# Context
Derived from `logics/request/req_035_cloud_auth_prod_cross_origin.md`.
Frontend: `https://sentry-idle.onrender.com`.
Backend: `https://sentry-backend-1tx5.onrender.com`.

# Steps
1. Return `csrfToken` in auth responses (login/register/refresh).
2. Store `csrfToken` on the client and send it as `x-csrf-token` for refresh.
3. Treat `401/403` as session expiry and reset auth state with a friendly message.

# Decisions
- Keep refresh token in httpOnly cookie (no refresh token in localStorage).
- Avoid relying on reading backend cookies from the frontend (cross-subdomain constraint).

# Acceptance criteria
- Prod login/register returns `accessToken` + `csrfToken` and sets refresh cookie.
- Refresh succeeds from the prod frontend when the session is valid.
- Cloud save endpoints no longer loop on 401s.
- UI shows a clear “Session expired. Please log in again.” message on auth failure.

# Validation
- Not run (code-only change).

# Report
- Status: complete.
- Notes: Added `csrfToken` to auth responses, client stores it and uses it for refresh, and 401/403 clears auth state with a friendly message.
