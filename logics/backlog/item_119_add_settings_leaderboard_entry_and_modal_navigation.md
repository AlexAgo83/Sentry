## item_119_add_settings_leaderboard_entry_and_modal_navigation - Add Settings leaderboard entry and modal navigation
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users cannot access leaderboard data from the app because there is no `Leaderboard` action in `Settings` and no routed modal view for it.

# Scope
- In:
- Add a `Leaderboard` action in `Settings`.
- Place `Leaderboard` immediately after `Save options`.
- Wire the action to a dedicated leaderboard modal view in the existing system modal stack.
- Keep behavior consistent with existing back navigation (`Back` returns to previous view).
- Out:
- No leaderboard data fetching or ranking logic in this item.
- No username edition implementation in this item.

# Acceptance criteria
- `Settings` displays a `Leaderboard` action.
- `Leaderboard` is rendered right after `Save options`.
- Clicking `Leaderboard` opens the leaderboard modal shell.
- Closing/back navigation returns to the previous settings view without stacking issues.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`.
- Main references: `src/app/components/SystemModal.tsx`, `src/app/containers/AppModalsContainer.tsx`.
