## req_005_action_selection_screen - Replace action selection modal with a dedicated screen
> Targeted version: 0.8.9
> Understanding: 90%
> Confidence: 80%

# Needs
- Clicking **Change** currently opens a modal for skill/recipe selection (loadout).
- Replace this modal with a dedicated **Action Selection** screen.
- The screen must be reachable **only** via the **Change** button (not via top/bottom tab navigation).
- Keep behavior equivalent (selection UX, missing item hints, start/pause flows).

# Recommended defaults
- Implement as an internal screen state (no URL/router in v1).
- Keep app bars usable while on the screen (not a modal).
- Provide a top-left **Back** button; `Escape` triggers Back.
- Return to the panel the user came from.
- Do not persist the screen state in saves.

# Execution
- Promoted to `logics/backlog/item_017_action_selection_screen.md`.
- Executed in `logics/tasks/task_019_action_selection_screen.md`.
