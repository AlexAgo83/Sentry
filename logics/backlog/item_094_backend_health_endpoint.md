## item_094_backend_health_endpoint - Add a lightweight /health endpoint
> From version: 0.9.10
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
Warmup calls should target a stable, low-cost endpoint. If `/health` is missing, create it.

# Scope
- In:
- Add a lightweight `/health` endpoint to the backend.
- Ensure it responds quickly with a small payload.
- Out:
- No auth requirements or heavy dependencies.

# Decisions
- Response should be `200 OK` with a short JSON payload (ex: `{ "ok": true }`).
- Must be safe to call frequently and under cold start.
- Available in both dev and production.
- Shallow health only (no DB or external calls).

# Acceptance criteria
- `/health` responds within typical cold-start constraints.
- Endpoint is available in production and local dev.

# Priority
- Impact: Low
- Urgency: Low

# Notes
- Created to support the warmup request in `item_093_warmup_render_backend`.
