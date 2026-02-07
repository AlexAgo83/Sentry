## item_091_startup_splashscreen_state - Track readiness and continue gating
> From version: 0.9.10
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
We need a reliable readiness signal to enable a `Continue` button on startup.

# Scope
- In:
- Define a readiness flag (assets loaded + initial state ready).
- Add a `hasContinued` gate to hide the splash after user confirmation.
- Ensure no blocking if readiness is delayed.
- Out:
- No new loading pipeline or asset preloader.

# Decisions
- Readiness is a boolean derived from existing startup steps (save + definitions + app state ready).
- `Continue` is enabled only when ready.
- `hasContinued` is session-only (resets on reload).

# Acceptance criteria
- The app exposes a readiness flag for the splashscreen.
- `Continue` only activates when ready.

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from `logics/request/req_031_startup_splashscreen.md`.
