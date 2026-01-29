## item_024_cloud_save_backend_and_conflict_ui - Cloud save backend and conflict UI
> From version: 0.8.11
> Understanding: 92%
> Confidence: 85%
> Progress: 0%

# Problem
Players need optional cloud saves to sync across devices and recover data. The app must stay offline-first and allow users to choose between local and cloud states with clear diffs.

# Scope
- In:
  - Backend v1 with email/password auth (bcrypt, no email verification).
  - Token model: short-lived access token (15 min) + long-lived refresh token (30 days) in HttpOnly cookie.
  - Versioned API base (`/api/v1`).
  - Single latest save per account with metadata (updatedAt, virtualScore, appVersion).
  - API endpoints: register, login, fetch latest save, upload/overwrite save.
  - Save payload size limit (2 MB) with validation.
  - Store saves as plaintext JSON in Postgres (no encryption in v1).
  - UI flow to compare local vs cloud (date, score, version) and choose load or overwrite.
  - Offline-first: cloud actions disabled with helper text + manual retry when backend unavailable.
  - Add simple rate limiting (e.g., 20 req/min per IP) on auth endpoints.
  - Tests for auth, save API, conflict UI, and security.
- Out:
  - No OAuth providers (Google, etc.).
  - No multiple save slots or email verification.
  - No background sync queue in v1.
  - No additional diff fields (time played) in v1.
  - No payload compression in v1.

# Acceptance criteria
- Users can register/login and upload a save, then fetch the latest save.
- Conflict UI shows diff (date, score, version) and presents explicit actions: load cloud or overwrite cloud.
- Backend is optional; when unavailable, cloud actions are disabled and the app remains usable offline.
- Metadata returned by the backend matches stored values.
- Tests cover auth, save endpoints, conflict UI flow, payload size limits, auth-required protections, and rate limiting behavior.

# Priority
- Impact: High (cross-device continuity).
- Urgency: Medium-High.

# Notes
- Source: req_009_offline_roster_tablets.
- Suggested stack: Node.js + Fastify + Prisma on Render (local dev supported).
- Shared DB uses schema `sentry` with `search_path` set on connect.
