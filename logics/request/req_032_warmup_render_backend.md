## req_032_warmup_render_backend - Non-blocking warmup call on startup
> From version: 0.9.10
> Understanding: 72%
> Confidence: 64%

# Needs
- On app launch, fire a non-blocking, best-effort request to `PROD_RENDER_API_BASE` if defined.
- The request must never block the game (network failures should be ignored).

# Context
- Render-backed APIs can cold start. A warmup ping helps reduce first-call latency.
- The warmup should be invisible to users and resilient to network issues.

# Goals
- Trigger a background warmup request at startup.
- Keep the call non-blocking and safe in all network states.
- Avoid impacting gameplay or UI readiness.

# Locked decisions (v1)
- The call is made only if `PROD_RENDER_API_BASE` is defined.
- The call is best-effort and never blocks the game.
- Failures are ignored (no user-facing error).

# Scope detail (draft)
- Logic:
  - On startup, fire a fetch to `PROD_RENDER_API_BASE` (or a lightweight `/health` if available).
  - Use a short timeout or `AbortController` to guarantee non-blocking behavior.
- UX:
  - No UI changes.
  - No user notifications.

# Technical references to update
- `src/app/App.tsx` or `src/app/AppContainer.tsx`
- `src/app/hooks` (startup effects)
- `.env` / `.env.example` (document variable if needed)

# Acceptance criteria
- When `PROD_RENDER_API_BASE` is set, a background request is fired on startup.
- Network failures do not affect gameplay or UI readiness.
- No blocking or visible delays on launch.

# Risks / open points
- What exact endpoint to hit (root vs `/health`) if available.
- Whether to avoid firing in dev mode.

# Backlog
- To be split after approval.
