## item_136_update_leaderboard_frontend_infinite_scroll_to_cursor_contract - Update leaderboard frontend infinite scroll to cursor contract
> From version: 0.9.28
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Frontend leaderboard data client is tied to page-based pagination and must align with cursor backend contract for scalable traversal.

# Scope
- In:
- Update leaderboard API client to consume cursor-based responses.
- Keep infinite scroll UX (load next entries when reaching list bottom).
- Preserve duplicate filtering, rank rendering, and `ex aequo` labeling.
- Keep existing loading/empty/error states.
- Out:
- No leaderboard visual redesign beyond what contract adaptation requires.

# Acceptance criteria
- Leaderboard modal loads initial entries and continues with cursor pagination.
- No duplicates or ordering regressions when appending pages.
- Existing leaderboard tests are updated/extended and pass.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md`.
- Main references: `src/app/components/LeaderboardModal.tsx`, `src/app/api/leaderboardClient.ts`.
