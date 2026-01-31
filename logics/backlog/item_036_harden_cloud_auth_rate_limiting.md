## item_036_harden_cloud_auth_rate_limiting - Harden cloud auth + rate limiting
> From version: 0.8.17
> Understanding: 93%
> Confidence: 91%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
Auth and rate limiting are MVP‑level (in‑memory limiter, stateless refresh tokens, no CSRF protections). This is risky for any public or multi‑instance deployment.

# Scope
- In:
  - Serverless‑friendly rate limiting (per IP + per route) using existing Postgres storage.
  - Refresh token rotation on every refresh, with server‑side revocation (store jti/hash in DB).
  - CSRF protection for refresh endpoint via double‑submit cookie.
  - Add backend tests covering login/refresh + rate‑limit behavior.
- Out:
  - Email verification and password reset flows.
  - Multi‑device session management UI.

# Acceptance criteria
- Rate limiting works across multiple instances and cannot be bypassed via load balancing.
- Refresh token rotation invalidates old refresh tokens after use.
- Refresh endpoint enforces CSRF protection and rejects invalid requests.
- Auth endpoints remain backward compatible for the client.
- Tests cover refresh rotation and rate‑limit enforcement.

# Priority
- Impact: High (security + abuse mitigation).
- Urgency: Medium (before public exposure).

# Notes
- Keep access token TTL unchanged unless required by rotation logic.
- Prefer simple revocation storage keyed by refresh token ID.
- Constraints: serverless on Render, no external rate‑limit store (Redis).
