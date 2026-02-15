## item_164_req049_backend_concurrency_token_and_conflict_responses_for_saves_latest - Add save concurrency token and 409 conflict support for auto-sync
> From version: 0.9.31
> Understanding: 92%
> Confidence: 84%
> Progress: 0%
> Complexity: High
> Theme: Backend / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Cloud auto-sync cannot be safe without conflict detection. Today the `PUT /api/v1/saves/latest` endpoint can overwrite a newer save silently.

# Scope
- In:
- Implement optimistic concurrency for cloud saves:
  - add a server-managed token (recommended: `revision` monotonic integer stored on the Save row)
  - return token from `GET /api/v1/saves/latest`
  - accept `expectedRevision` on `PUT /api/v1/saves/latest`
  - return `409 Conflict` when `expectedRevision` is stale, including current cloud meta/token for UI resolution.
- Add backend tests:
  - revision increments on successful save
  - stale expected token triggers 409
  - correct expected token allows save
- Out:
- No attempt to merge payloads across devices (conflict resolution is UX-driven).

# Acceptance criteria
- Backend rejects stale overwrites deterministically (409) and returns enough metadata for the client to resolve.
- Tests cover the concurrency token behavior.

# Implementation notes
- Likely touch points:
  - `prisma/schema.prisma` + migration (if introducing `revision`)
  - `backend/server.js` (or `backend/routes/*` if already split)
  - `tests/backend/*`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling.md`.

