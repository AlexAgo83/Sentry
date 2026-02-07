## item_092_startup_splashscreen_ui - Add startup splashscreen UI
> From version: 0.9.10
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
We need a simple splashscreen on launch with a gated `Continue` button.

# Scope
- In:
- Add a full-screen splash view shown on launch.
- Include a `Continue` button that uses the readiness flag.
- Style the view to be minimal and fast.
- Out:
- No complex animations or onboarding flow.

# Decisions
- Splash is shown on every launch until user continues.
- Button is disabled until readiness is true.
- No auto-continue; user must click `Continue`.
- Minimal UI: label + button (no progress bar).
- Add a small `Loading...` sublabel that flips to `Ready` when enabled.

# Acceptance criteria
- Splashscreen appears on startup.
- `Continue` becomes enabled only when ready.
- After continue, the main UI is shown.

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from `logics/request/req_031_startup_splashscreen.md`.
