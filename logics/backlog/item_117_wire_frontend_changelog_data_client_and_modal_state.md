## item_117_wire_frontend_changelog_data_client_and_modal_state - Wire frontend changelog data client and modal state
> From version: 0.9.24
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Frontend Data
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a backend endpoint and modal shell, the feature needs coordinated frontend state/data orchestration for pagination, retries, and robust UX.

# Scope
- In:
- Add frontend API client call for `/api/changelog/commits`.
- Add modal state management:
  - `page`, `perPage=10`,
  - loading/error/ready states,
  - retry action,
  - optional per-page in-memory cache during modal session.
- Connect fetched data to `ChangelogsModal`.
- Preserve predictable behavior when reopening modal (clear or controlled reset strategy).
- Out:
- No backend endpoint authoring.
- No e2e test authoring in this item.

# Acceptance criteria
- Opening modal triggers page 1 fetch and renders data.
- Pagination controls fetch/render corresponding pages correctly.
- Retry action replays the failed request and updates state properly.
- Offline/rate-limit failures are surfaced as clear recoverable UI states.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_039_settings_changelogs_modal_with_paginated_github_commits.md`.
- Main references: `src/app/api/*`, `src/app/components/*`, container wiring in modal stack.

