## item_120_implement_backend_leaderboard_endpoint_sorted_by_virtual_score - Implement backend leaderboard endpoint sorted by virtual score
> From version: 0.9.26
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Backend
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
There is no backend API to provide leaderboard rows ranked by `virtualScore`, including display-ready identity and save metadata (`updatedAt`, `appVersion`).

# Scope
- In:
- Add leaderboard endpoint with chunked pagination semantics for infinite scroll:
  - `GET /api/v1/leaderboard?page=<n>&perPage=10`
- Return users with save rows sorted by:
  - `virtualScore DESC`,
  - deterministic tie-breakers for stable ordering.
- Include normalized fields:
  - `displayName`,
  - `virtualScore`,
  - `updatedAt`,
  - `appVersion`,
  - tie indicator for `ex aequo` display.
- Apply display name fallback rules server-side:
  - use `username` when present,
  - otherwise use masked email (example: `toto25@toto.com` -> `t****5@toto.com`).
- Return `hasNextPage` for infinite loading.
- Out:
- No frontend rendering in this item.
- No username update endpoint in this item.

# Acceptance criteria
- Endpoint returns paginated leaderboard entries ordered by `virtualScore` descending.
- Email fallback is masked and never returns full email when username is empty.
- Each leaderboard entry includes last save version (`appVersion`).
- Response includes enough tie metadata for `ex aequo` rendering.
- Pagination metadata supports infinite scrolling (`page`, `perPage`, `hasNextPage`).
- Ordering is deterministic across repeated calls.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`.
- Main references: `backend/server.js`, `prisma/schema.prisma`, backend route modules if split.
