## task_080_backend_health_endpoint - Add /health endpoint
> From version: 0.9.10
> Owner: —
> Status: Done
> Understanding: 94%
> Confidence: 92%
> Progress: 100%

# Summary
Add a lightweight backend `/health` endpoint for warmup checks.

# Dependencies
- item_094_backend_health_endpoint

# Steps
1. Add a Fastify route for `GET /health`.
2. Return `200 OK` with `{ "ok": true }`.
3. Ensure the endpoint is available in dev and production.
4. Add a small unit/integration test for the route if tests exist.

# Decisions
- Minimal JSON payload only.
- No auth required.
- Shallow health only (no DB or external calls).

# Acceptance criteria
- `/health` responds quickly with the expected JSON.
- Route is reachable in dev and prod.
