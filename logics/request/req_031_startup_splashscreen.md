## req_031_startup_splashscreen - Startup splashscreen with gated Continue button
> From version: 0.9.10
> Understanding: 70%
> Confidence: 62%

# Needs
- Show a simple splashscreen on app launch.
- The screen should include a `Continue` button that activates only when loading is complete.

# Context
- Players need a clear loading state on startup.
- A gated `Continue` button ensures the app is ready before entering the main view.

# Goals
- Provide a minimal loading screen at launch.
- Disable `Continue` until assets/state are fully loaded.
- Make the transition to the main app explicit.

# Locked decisions (v1)
- The splashscreen is shown on app launch.
- The `Continue` button is disabled until loading is complete.
- The splashscreen is simple and lightweight.

# Scope detail (draft)
- UI:
  - Full-screen splash view with loading label and `Continue` button.
  - Button becomes enabled when the app reports ready state.
- Logic:
  - Track readiness (assets loaded + initial state ready).
  - Once ready, allow user to proceed.
- UX:
  - Keep animations minimal and fast.
  - Avoid blocking interaction after readiness.

# Technical references to update
- `src/app/App.tsx` or `src/app/AppContainer.tsx` (startup gating)
- `src/app/hooks` (readiness state)
- `src/app/styles` (splash styling)

# Acceptance criteria
- On launch, the splashscreen is visible until user clicks `Continue`.
- `Continue` is disabled until loading is complete.
- After continue, the app shows the normal UI.

# Risks / open points
- Define what “fully loaded” means (assets, persisted state, routes, etc.).
- Should the splash appear on every launch or only cold start?

# Backlog
- To be split after approval.
