## item_114_add_settings_entrypoint_for_changelogs_modal - Add Settings entrypoint for changelogs modal
> From version: 0.9.24
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users cannot access repository change history from inside the app because there is no dedicated `Changelogs` entry in `Settings`.

# Scope
- In:
- Add a `Changelogs` action in Settings UI.
- Place `Changelogs` directly before `About` in the Settings button list.
- Wire action to open a dedicated changelogs modal route/state in the existing modal system.
- Keep alignment with existing settings action style and interaction patterns.
- Out:
- No data fetching in this item.
- No pagination logic in this item.

# Acceptance criteria
- `Settings` displays a `Changelogs` action.
- `Changelogs` is positioned immediately before `About`.
- Clicking `Changelogs` opens the expected modal shell.
- Existing settings actions continue to work unchanged.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_039_settings_changelogs_modal_with_paginated_github_commits.md`.
- Main references: `src/app/components/SystemModal.tsx`, `src/app/containers/AppModalsContainer.tsx`.
