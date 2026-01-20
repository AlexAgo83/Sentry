## task_019_action_selection_screen - Replace Loadout modal with a dedicated Action Selection screen
> From version: 0.8.9  
> Understanding: 90%  
> Confidence: 80%  
> Progress: 0%

# Context
Clicking the **Change** button currently opens a modal (`LoadoutModal`) to select the active skill/recipe.

We want this flow to become a dedicated screen (not a modal), reachable **only** via the **Change** button.
It must not be a main navigation destination (not in top/bottom tabs).

This task executes `logics/backlog/item_017_action_selection_screen.md` (promoted from `logics/request/req_005_action_selection_screen.md`).

# Goal
Replace the modal-based action selection UX with a screen-based UX that feels like a “page” inside the app shell.

# UX options (implementation)
- Option A (recommended): hidden screen state (no URL)
  - Add an app-shell UI state like `activeScreen: "main" | "actionSelection"`.
  - Clicking **Change** sets `"actionSelection"` and renders a full-page `ActionSelectionScreen`.
  - Provide a **Back/Close** control to return to the previous screen.
  - Not present in `SidePanelSwitcher`, so it is only reachable via the button.
- Option B: hidden side-panel id (no tab)
  - Extend `activeSidePanel` with `"actionSelection"` but never show a tab for it.
  - Reuses existing “panel switching” plumbing but conceptually blurs “screen” vs “panel”.
- Option C: route-based (`/action-selection`) but no visible navigation
  - Best for deep-linking/back-button UX.
  - Requires a router and makes “only accessible by the button” less strict (URL can open it).

# Decision (default)
- Implement Option A unless a URL/back-button requirement emerges.

# Decisions (recommended defaults)
- Keep top/bottom app bars usable while on the screen (do not treat it as a modal).
- Single exit control: a top-left **Back** button.
- `Escape` triggers Back (parity with the old modal close behavior).
- Return to the panel the user came from (store `returnSidePanel` on open).
- Do not persist the screen state in saves; on reload start on the main app screen.

# Open questions (confirm before final polish)
- None for v1 if using the recommended defaults above.

# Scope (v1)
- Convert the existing modal content into a screen; no gameplay changes.
- Screen is reachable only from the **Change** button.
- Keep selection UX and validations equivalent (skill/recipe selection, missing item hints, start/pause flows).

# Plan
- [ ] 1. Add screen state to app shell UI
  - Introduce `activeScreen` (and optional `previousSidePanel`) to support returning to where the user came from.
  - Wire the **Change** button to open the Action Selection screen.
- [ ] 2. Implement `ActionSelectionScreen`
  - Reuse the current `LoadoutModal` UI logic and components, but render as an in-layout screen.
  - Add **Back/Close** action.
- [ ] 3. Remove modal-specific behavior for action selection
  - Remove the `LoadoutModal` from the modal stack.
  - Ensure “any modal open” logic and app bar hiding are not triggered by the Action Selection screen.
- [ ] 4. Update tests
  - Replace/adjust tests expecting a dialog on **Change**.
  - Add a test that the screen is not reachable via `SidePanelSwitcher`.
  - Add a test that Back/Close returns to the previous screen/panel.
  - Add a test that `Escape` returns to the previous screen/panel.
- [ ] FINAL. Validation
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - Quick manual check: desktop + mobile (Change → screen → Back, selection works).

# Acceptance
- Clicking **Change** opens a dedicated screen (not a dialog).
- The screen is not reachable through the top/bottom tab navigation.
- Back/Close returns the user to where they were before opening the screen.
- Existing action selection behavior remains correct (including missing item hints).
- Tests updated and CI passes.
