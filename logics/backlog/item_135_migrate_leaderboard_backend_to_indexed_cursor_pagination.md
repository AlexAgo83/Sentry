## item_135_migrate_leaderboard_backend_to_indexed_cursor_pagination - Migrate leaderboard backend to indexed cursor pagination
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Backend
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Offset pagination (`skip/take`) on leaderboard degrades with scale and is not optimal for high row counts.

# Scope
- In:
- Add/verify DB index supporting leaderboard ordering (`virtualScore DESC`, `updatedAt DESC`, `id ASC`).
- Introduce cursor-based API pagination contract for leaderboard fetches.
- Preserve deterministic ordering and `isExAequo` behavior.
- Keep response metadata sufficient for infinite scroll continuation (`nextCursor`/equivalent).
- Out:
- No UI restyling in this item.

# Acceptance criteria
- Leaderboard backend no longer relies on offset pagination for main traversal.
- API returns stable next-page cursor contract.
- Ordering and tie markers remain correct across page boundaries.
- Backend tests cover cursor progression and boundary conditions.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md`.
- Main references: `backend/server.js`, `prisma/schema.prisma`, `tests/backend/cloudApi.test.ts`.
