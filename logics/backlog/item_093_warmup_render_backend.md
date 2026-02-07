## item_093_warmup_render_backend - Fire best-effort warmup request on startup
> From version: 0.9.10
> Understanding: 94%
> Confidence: 92%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
The backend on Render can cold start; a warmup call reduces first-call latency.

# Scope
- In:
- Fire a non-blocking startup request to `PROD_RENDER_API_BASE` if defined.
- Ensure request is best-effort and time-bounded.
- Out:
- No UI changes.
- No retries or complex backoff.

# Decisions
- Only call when `PROD_RENDER_API_BASE` is set.
- Prefer `PROD_RENDER_API_BASE/health` if available; otherwise hit the base URL.
- Use a short timeout (1.5s) with `AbortController`.
- Skip in dev/test.
- Ignore failures silently (no UI, no logs).
- Fire once per app launch only.

# Acceptance criteria
- A background warmup request is sent on startup when configured.
- The request never blocks UI or gameplay.

# Priority
- Impact: Low
- Urgency: Low

# Risks / open points
- If `/health` does not exist on the API, add a backend item to create it.

# Notes
- Derived from `logics/request/req_032_warmup_render_backend.md`.
