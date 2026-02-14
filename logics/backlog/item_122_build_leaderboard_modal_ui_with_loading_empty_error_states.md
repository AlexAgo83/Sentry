## item_122_build_leaderboard_modal_ui_with_loading_empty_error_states - Build leaderboard modal UI with loading empty error states
> From version: 0.9.26
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with backend data, users need a clear and usable leaderboard presentation in-app with robust state handling.

# Scope
- In:
- Add dedicated `LeaderboardModal` component.
- Render ordered rows with:
  - display name,
  - virtual score,
  - last save date,
  - last save version.
- Show `ex aequo` indicator for tied `virtualScore` rows.
- Implement infinite scrolling behavior aligned with changelogs:
  - initial load of `10`,
  - fetch next chunk when list reaches bottom,
  - append results,
  - stop when `hasNextPage` is false.
- Implement state UX:
  - initial loading,
  - append loading,
  - empty,
  - error with retry.
- Keep layout responsive for desktop/mobile.
- Out:
- No backend leaderboard route creation in this item.
- No username editing flow in this item.

# Acceptance criteria
- Modal displays leaderboard rows in correct order.
- Each row shows display name, score, last save date, and save version.
- Infinite scroll loads next chunks of `10` entries without duplicates.
- `ex aequo` is visible for same-score rows.
- Loading, empty, and error states are clear and recoverable.
- Modal remains usable on desktop and mobile breakpoints.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`.
- Main references: `src/app/components/LeaderboardModal.tsx` (new), `src/app/styles/system.css`, leaderboard API client.
