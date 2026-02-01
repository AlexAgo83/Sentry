## task_031_harden_cloud_auth_rate_limiting - Harden cloud auth + rate limiting
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_036_harden_cloud_auth_rate_limiting.md`.
Serverless on Render, no external store. Use Postgres for rotation/revocation and serverless-friendly rate limiting.

# Plan
- [x] 1. Define DB tables/fields for refresh token rotation (jti/hash, userId, expiresAt, revokedAt).
- [x] 2. Implement per-IP + per-route rate limiting using Postgres-backed counters or sliding window.
- [x] 3. Add refresh rotation on every refresh and revoke old token.
- [x] 4. Add CSRF protection for refresh endpoint (double-submit cookie + header validation).
- [x] 5. Update backend tests for auth + rate limiting.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint

# Report
- Status: complete.
- Notes: Added refresh token rotation + DB-backed rate limiting, CSRF double-submit cookie validation, and backend tests for rotation + limits.

# Notes
