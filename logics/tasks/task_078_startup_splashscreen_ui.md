## task_078_startup_splashscreen_ui - Add startup splashscreen UI
> From version: 0.9.10
> Owner: —
> Status: Planned
> Understanding: 95%
> Confidence: 93%
> Progress: 0%

# Summary
Create a minimal splashscreen with a gated Continue button on launch.

# Dependencies
- item_092_startup_splashscreen_ui
- task_077_startup_splashscreen_state

# Steps
1. Add a full-screen splash view with a title and `Continue` button.
2. Show `Loading...` until ready, then switch to `Ready`.
3. Disable the button until readiness is true.
4. Hide the splash after the user clicks `Continue`.

# Decisions
- Splash shown on every launch.
- No auto-continue.
- Minimal UI (no progress bar).

# Acceptance criteria
- Splashscreen appears on startup and blocks the main UI.
- Button only enables when ready.
- App proceeds only after user clicks `Continue`.
