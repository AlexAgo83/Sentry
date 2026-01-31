## adr_000_cloud_auth_hardening_refresh_rotation_db_rate_limits - Cloud auth hardening (refresh rotation + DB rate limits)
> Date: 2026-01-31
> Status: Proposed

# Context
The cloud auth endpoints were MVP‑grade: in‑memory rate limiting, stateless refresh tokens, and no CSRF protection.
This is unsafe for multi‑instance deployments and exposes the refresh endpoint to abuse. Constraints: serverless on
Render, no external rate‑limit store (Redis), Postgres is available, and the client flow must remain compatible.

# Decision
Adopt Postgres‑backed auth hardening:
- Store refresh token identifiers (hashed) with expiry and revoke on every refresh (rotation).
- Enforce double‑submit CSRF protection for refresh (cookie + `x-csrf-token` header).
- Implement per‑IP + per‑route rate limiting using Postgres counters with a fixed time window.

This keeps the existing client auth flow while making it multi‑instance safe.

# Alternatives considered
- Keep in‑memory rate limiting and stateless refresh tokens (unsafe across instances).
- Introduce Redis for rate limiting (not available in current infra).
- Rely on short access token TTLs only (does not protect refresh abuse).

# Consequences
- Additional DB writes on auth/refresh and rate‑limit checks.
- Requires periodic cleanup of expired refresh tokens / rate‑limit rows (can be a cron/maintenance task).
- Client must send CSRF header on refresh (already implemented).
