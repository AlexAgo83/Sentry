## item_115_implement_backend_proxy_route_for_github_commit_feed - Implement backend proxy route for GitHub commit feed
> From version: 0.9.24
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Backend
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Fetching commits directly from frontend is fragile (rate limits, token exposure, CORS) and cannot safely support private repository scenarios.

# Scope
- In:
- Add backend endpoint for changelog commits with pagination:
  - `GET /api/changelog/commits?page=<n>&perPage=10`
- Proxy to GitHub commits API using:
  - `GITHUB_OWNER` (required)
  - `GITHUB_REPO` (required)
  - `GITHUB_TOKEN` (optional, recommended)
- Normalize response payload:
  - `items`, `page`, `perPage`, `hasNextPage`, `source`.
- Parse `Link` header (or equivalent) to compute `hasNextPage`.
- Map GitHub errors/rate limits to stable app-facing error responses.
- Out:
- No modal UI rendering.
- No frontend pagination controls.

# Acceptance criteria
- Endpoint returns normalized commit list for valid repo config.
- Endpoint works both with token and without token (public repo fallback).
- Rate-limit and upstream errors are mapped to explicit, user-facing error semantics.
- No token value is exposed in API payloads or logs.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_039_settings_changelogs_modal_with_paginated_github_commits.md`.
- Main references: `backend/server.js`, `backend/routes/*`, environment config.
