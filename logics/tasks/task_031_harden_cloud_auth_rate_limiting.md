## task_031_harden_cloud_auth_rate_limiting - Harden cloud auth + rate limiting
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_036_harden_cloud_auth_rate_limiting.md`.
Serverless on Render, no external store. Use Postgres for rotation/revocation and serverless-friendly rate limiting.

# Plan
- [ ] 1. Define DB tables/fields for refresh token rotation (jti/hash, userId, expiresAt, revokedAt).
- [ ] 2. Implement per-IP + per-route rate limiting using Postgres-backed counters or sliding window.
- [ ] 3. Add refresh rotation on every refresh and revoke old token.
- [ ] 4. Add CSRF protection for refresh endpoint (double-submit cookie + header validation).
- [ ] 5. Update backend tests for auth + rate limiting.
- [ ] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint

# Report
- Status: not started.
