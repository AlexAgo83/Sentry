## task_077_startup_splashscreen_state - Add readiness and continue gating
> From version: 0.9.10
> Owner: —
> Status: Done
> Understanding: 95%
> Confidence: 93%
> Progress: 100%

# Summary
Introduce a readiness signal and a session-only continue gate for startup.

# Dependencies
- item_091_startup_splashscreen_state

# Steps
1. Define a readiness boolean derived from save + definitions + app state ready.
2. Add a session-only `hasContinued` gate in app state.
3. Ensure readiness updates do not block the main UI.

# Decisions
- `Continue` enabled only when ready.
- `hasContinued` resets on reload (session-only).

# Acceptance criteria
- Readiness flag is available for the splashscreen.
- `Continue` is disabled until ready.
