## item_017_action_selection_screen - Action selection as a screen (replace Loadout modal)
> From version: 0.8.9
> Understanding: 90%
> Confidence: 80%
> Progress: 100%

# Context
Action selection is currently implemented as a modal (`LoadoutModal`) opened by the **Change** button.
This creates a “modal-heavy” UX and conflicts with the desire to treat action selection as a dedicated “page”.

# Goal
Replace the modal with a dedicated **Action Selection** screen that is reachable only via **Change**.

# Scope (v1)
- Convert the existing modal content into a screen (no gameplay changes).
- Screen is not part of the main tab navigation (`SidePanelSwitcher`).
- Provide Back/Close behavior that returns to the previous panel.

# Acceptance
- Clicking **Change** opens a dedicated screen (not a dialog).
- The screen is not reachable through top/bottom tab navigation.
- Back (and `Escape`) returns the user to the previous panel.
- Existing selection behavior remains correct (skill/recipe selection, missing item hints).
- Tests updated and CI passes.

# Status
- Delivered in `logics/tasks/task_019_action_selection_screen.md`.

# Problem
Describe the problem and user impact.

# Scope
- In:
- Out:

# Acceptance criteria
- Define acceptance criteria

# Priority
- Impact:
- Urgency:

# Notes
- Derived from `logics/request/req_005_action_selection_screen.md`.
