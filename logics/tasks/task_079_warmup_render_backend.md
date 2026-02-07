## task_079_warmup_render_backend - Fire best-effort warmup request
> From version: 0.9.10
> Owner: —
> Status: Planned
> Understanding: 94%
> Confidence: 92%
> Progress: 0%

# Summary
Send a non-blocking startup request to warm the Render backend if configured.

# Dependencies
- item_093_warmup_render_backend

# Steps
1. On startup, check `PROD_RENDER_API_BASE`.
2. Fire a fetch to `/health` if available, otherwise base URL.
3. Use `AbortController` with 1.5s timeout.
4. Skip in dev/test environments.
5. Ensure the call is fire-and-forget and never blocks UI.

# Decisions
- One warmup call per launch.
- No retries or logs.

# Acceptance criteria
- Warmup fires only when env var is set.
- Failures are silently ignored.
- No impact on UI readiness or gameplay.
