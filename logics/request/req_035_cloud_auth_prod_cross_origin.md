## req_035_cloud_auth_prod_cross_origin - Fix cloud auth refresh in prod (Render subdomains)
> From version: 0.9.11
> Understanding: 74%
> Confidence: 62%

# Needs
- Production cloud auth must work when the frontend and backend run on different Render subdomains.
- After login/register, the app must be able to refresh tokens and fetch `/api/v1/saves/latest` without 401 loops.
- User-facing errors should be clear (“Please log in again”) instead of raw JSON.

# Context
- Frontend (prod): `https://sentry-idle.onrender.com`
- Backend (prod): `https://sentry-backend-1tx5.onrender.com`
- Current behavior: `401 Unauthorized` from `/api/v1/auth/refresh` and `/api/v1/saves/latest`, showing `{ "error": "Unauthorized" }` in the UI.
- Auth relies on access tokens (Authorization header) + refresh cookies + CSRF cookie/header.
- These domains share env vars but not cookies; the frontend cannot read the backend's CSRF cookie on a different subdomain.

# Goals
- Make refresh-token flow reliable across these subdomains in production.
- Preserve existing security constraints (no refresh token in localStorage, keep CSRF protection, rotate refresh tokens).
- Improve UX when auth expires or cookies are missing.

# Scope detail (decisions)
- Backend:
  - Return a `csrfToken` in auth responses (login/register/refresh) to avoid relying on reading cross-subdomain cookies in the browser.
  - Keep refresh token rotation and CSRF validation in place.
- Frontend:
  - Store the `csrfToken` locally and send it as `x-csrf-token` on refresh requests.
  - Treat `401/403` as a session expiry, clear auth state, and prompt re-login.
  - Replace raw JSON error output with a friendly message.

# UX copy (suggested)
- Auth failure: “Session expired. Please log in again.”
- Missing cloud data: “No cloud save found.”

# Technical references to update
- `backend/server.js` (cookies, CORS, CSRF handling)
- `src/app/api/cloudClient.ts` (refresh flow + error handling)
- `src/app/hooks/useCloudSave.ts` (unauthorized handling + UI state)
- `readme.md` or `.env` docs (prod domain setup notes if needed)

# Acceptance criteria
- On prod, register/login succeeds and returns both `accessToken` and `csrfToken` (refresh cookie still set).
- `POST /api/v1/auth/refresh` succeeds from the prod frontend and returns a new access token when the session is valid.
- `GET /api/v1/saves/latest` returns 200/204 (no 401 loop) when logged in.
- When auth is invalid, the UI shows a friendly message and prompts re-login instead of raw JSON.

# Risks / open points
- Whether browsers treat the Render subdomains as same-site for cookie purposes in all cases.
- Whether to use `SameSite=None; Secure` vs `Lax` for refresh/CSRF cookies in production.
- Potential interactions with third-party cookie blocking policies.

# Backlog
- `logics/tasks/task_086_fix_cloud_auth_prod_cross_origin.md`
