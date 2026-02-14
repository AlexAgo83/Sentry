## req_039_settings_changelogs_modal_with_paginated_github_commits - Add a Settings changelogs modal backed by GitHub commits
> From version: 0.9.24
> Understanding: 97%
> Confidence: 94%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a `Changelogs` entry in `Settings`.
- Open a dedicated modal that lists project commits from GitHub.
- Display commits in a scrollable list with pagination (`10` commits per page).

# Context
- The app currently has no in-app changelog history.
- Users need a quick way to check what changed without leaving the game UI.
- Source of truth should be repository history (GitHub commits), not a manually maintained static file.

# Goals
- Provide a reliable and readable in-app changelog experience.
- Keep UX simple:
  - newest commits first,
  - page navigation,
  - clear loading/error/empty states.
- Ensure implementation is testable and safe for offline/unstable network scenarios.

# Locked decisions (v1)
- Entry point: `Settings` includes a new `Changelogs` action button.
- Changelog view: modal-based, same modal system conventions as existing system/settings modals.
- Pagination: fixed `10` items per page.
- Commit fields shown in UI:
  - short SHA,
  - commit title (first line),
  - author name,
  - commit date/time,
  - optional external link to commit on GitHub.
- Data source:
  - use GitHub commits endpoint semantics (`page`, `per_page`),
  - prefer backend proxy endpoint for rate-limit control and future caching/token handling,
  - backend uses `GITHUB_TOKEN` when provided (recommended),
  - backend supports no-token fallback for public repos with graceful handling when rate-limited.
- No gameplay logic impact.

# Scope detail (draft)
- Settings/UI:
  - Add `Changelogs` button in Settings actions.
  - Add `ChangelogsModal` component with:
    - list container (scrollable),
    - pagination controls (prev/next + current page),
    - loading skeleton/state,
    - empty state,
    - retry state on error.
- Data layer:
  - Add frontend client method for changelog fetch.
  - Add backend endpoint to fetch/normalize GitHub commits payload.
  - Normalize output shape for UI consumption.
- State:
  - Local modal state for current page and request status.
  - Optional lightweight cache per page during modal session.

# Operational constraints (v1)
- Backend environment:
  - `GITHUB_OWNER` (required)
  - `GITHUB_REPO` (required)
  - `GITHUB_TOKEN` (optional but strongly recommended)
- Security:
  - token must remain server-side only,
  - no token value exposed to frontend payloads or logs.
- Rate-limit behavior:
  - when GitHub returns limit/throttling, API returns a stable, user-friendly error shape,
  - modal shows actionable retry feedback instead of generic failure text.

# Suggested API contract (draft)
- `GET /api/changelog/commits?page=<n>&perPage=10`
- Response:
  - `items: Array<{ sha: string; shortSha: string; message: string; author: string; committedAt: number; url: string }>`
  - `page: number`
  - `perPage: number`
  - `hasNextPage: boolean`
  - `source: "github"`

# Technical references to update
- `src/app/components/SystemModal.tsx`
- `src/app/containers/AppModalsContainer.tsx`
- `src/app/components/` (new `ChangelogsModal.tsx`)
- `src/app/api/` (new/updated changelog client)
- `backend/server.js`
- `backend/routes/*` (new changelog route module if route split exists)
- `tests/app/systemModal.test.tsx`
- `tests/app/containers/AppModalsContainer.test.tsx`
- `tests/backend/*` (new backend changelog route tests)
- `tests/e2e/*` (optional smoke path for modal open + pagination)

# Acceptance criteria
- `Settings` shows a `Changelogs` action.
- Clicking it opens a modal dedicated to changelogs.
- Modal loads commits from GitHub-backed source and renders them in descending chronology.
- Pagination works with exactly `10` commits per page.
- List area is scrollable and remains usable on desktop/mobile layouts.
- Loading, empty, and error states are handled and visually clear.
- If rate-limited or offline, modal shows a clear recoverable error state (retry + concise message).
- No regression on existing settings/modal flows.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - frontend modal tests (open/close/pagination/loading-error states),
  - backend route tests (mapping + pagination params + error mapping),
  - backend tests for token path and no-token path (including rate-limit mapping),
  - optional e2e smoke (`Settings -> Changelogs -> page change`).

# Risks / open points
- GitHub API unauthenticated rate limits can cause intermittent failures (especially without token).
- Token setup/rotation must be handled in deployment environments.
- Commit message formatting (multi-line bodies) needs safe truncation for UI readability.
- Timezone/date formatting should be consistent with existing app conventions.
- Need graceful degradation in offline mode (clear message + retry).

# Backlog
- `logics/backlog/item_114_add_settings_entrypoint_for_changelogs_modal.md`
- `logics/backlog/item_115_implement_backend_proxy_route_for_github_commit_feed.md`
- `logics/backlog/item_116_build_changelogs_modal_ui_with_scroll_and_pagination.md`
- `logics/backlog/item_117_wire_frontend_changelog_data_client_and_modal_state.md`
- `logics/backlog/item_118_add_changelogs_feature_tests_frontend_backend_and_optional_e2e.md`
