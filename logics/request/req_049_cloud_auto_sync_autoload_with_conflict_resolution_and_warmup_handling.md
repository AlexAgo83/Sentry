## req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling - Add optional cloud auto-save/auto-load with conflict detection and warmup resilience
> From version: 0.9.31
> Understanding: 92%
> Confidence: 85%
> Complexity: High
> Theme: Feature / Reliability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add an **optional** cloud auto-sync mode (auto-save + auto-load) that can be enabled/disabled in Cloud Save options.
  - Default: **disabled**.
- Auto-sync must handle real-world edge cases safely:
  - user plays on two devices,
  - backend is “cold” (warmup / slow first response),
  - offline / flaky connectivity,
  - token expiry / refresh.
- The system must avoid **silent data loss** (accidental overwrites).

# Context
- Cloud save exists with auth + refresh-cookie flow and endpoints:
  - `GET /api/v1/saves/latest` (returns payload + meta)
  - `PUT /api/v1/saves/latest` (upserts payload + meta)
- The backend can be cold-started (Render warmup) and requests may time out or fail transiently.
- Today cloud is manual/explicit: user checks cloud, loads cloud, or overwrites cloud with local.

# Goals
- When enabled, keep cloud and local saves in sync automatically with minimal user friction.
- Never destroy progress silently:
  - detect conflicts,
  - stop auto-sync on conflict,
  - require an explicit user decision (or a clearly documented deterministic policy).
- Make warmup/network failures recoverable (no false logout).

# Non-goals
- Real-time multi-device merge of game states (this is not a CRDT).
- Guaranteed perfect “most progressed” selection without any user involvement in conflict scenarios.
- Background sync using platform-specific APIs (v1 uses in-app runtime triggers only).

# Locked decisions (v1)
## Toggle and defaults
- Cloud auto-sync is a Cloud Save option (switch) and defaults to **OFF** for all users.
- The toggle is only available when the user is logged in and cloud is configured.

## Safety: conflict detection is mandatory
- The system must include a conflict detection mechanism so one device cannot overwrite a newer cloud save silently.
- On conflict:
  - auto-sync is paused/disabled for this session,
  - UI shows a clear “Conflict detected” state,
  - user can pick resolution: “Load cloud” or “Overwrite cloud with local”.

## Warmup resilience
- Warmup/network errors must not clear auth state.
- Retry/backoff must be applied for auto-sync attempts to avoid hammering a cold backend.

# Suggested sync model (recommended)
## State comparison
- Maintain a “local snapshot meta” required for comparison:
  - local `lastTick` (from save payload)
  - local derived `virtualScore` (or other stable progress metric if already available)
- Cloud provides meta:
  - `updatedAt`, `virtualScore`, `appVersion`
  - payload includes `lastTick` if needed for deeper comparison

## Conflict detection (recommended approach)
- Introduce a lightweight optimistic concurrency token:
  - Option A (recommended): server-managed `revision` (monotonic int) stored with Save row and returned in responses.
  - Option B: use `updatedAt` as the expected token.
- Update contract:
  - `GET /api/v1/saves/latest` returns `meta` plus `revision` (or `updatedAt`)
  - `PUT /api/v1/saves/latest` accepts `expectedRevision` (or `expectedUpdatedAt`) and returns:
    - 200 on success
    - 409 Conflict when expected token is stale, including current cloud meta token for resolution UX.

## Auto-load policy (recommended)
- On app start (when auto-sync is enabled):
  1. attempt silent refresh (auth)
  2. fetch cloud meta
  3. if cloud is newer than local by token:
     - auto-load cloud (recommended), unless user has unsynced local changes (see below)
  4. if local appears newer:
     - schedule auto-save to cloud (with expected token)
- If “newer” cannot be safely determined (missing meta, corrupted meta):
  - do not auto-overwrite; fall back to conflict UX.

## Auto-save triggers (recommended)
- Auto-save must be rate-limited and only run when:
  - user is logged in,
  - auto-sync toggle ON,
  - backend reachable (or in “warming” state with backoff),
  - local save changed since last successful cloud sync.
- Candidate triggers:
  - on visibility hidden (tab close/background)
  - on a fixed interval (e.g. 30s) while visible
  - after significant events (manual save/import/reset, dungeon end, etc.)

## Offline / flaky connectivity handling
- Auto-sync uses:
  - per-attempt timeout (recommended 4s)
  - retry backoff: 1s, 2s, 4s, 8s, 16s (cap 30s) + jitter
- On repeated failures:
  - keep local running
  - surface a recoverable status (offline/warming) and a “Retry now” action

# Scope detail (draft)
## Backend
- Add concurrency token support to saves:
  - add `revision` (or rely on `updatedAt` but ensure consistent compare semantics)
  - extend routes:
    - `GET /api/v1/saves/latest` includes token
    - `PUT /api/v1/saves/latest` accepts `expected*` token and 409 on mismatch
- Add tests:
  - token increments on save
  - 409 conflict when expected token stale

## Frontend
- Add Cloud Save option switch: “Auto sync” (default OFF).
- Implement auto-sync orchestrator in `useCloudSave` (or a dedicated hook):
  - startup auto-load decision
  - auto-save triggers + debouncing
  - conflict handling state machine
  - warmup retry/backoff integration
- UI:
  - show current status: `ready`, `warming`, `offline`, `conflict`, `error`
  - show resolution actions on conflict:
    - “Load cloud”
    - “Overwrite cloud with local”
  - show last successful sync timestamp and token where useful (optional)

## Edge cases to explicitly cover
- Device A and B both online:
  - A saves, B tries to overwrite with stale token -> conflict.
- Device A plays offline, then reconnects:
  - attempts to push; if cloud changed, conflict triggers instead of silent overwrite.
- Backend warmup:
  - first requests fail/time out; system stays recoverable and retries later.
- Token expiry:
  - refresh occurs; auto-sync continues.
- User disables auto-sync:
  - background auto-sync stops immediately.

# Technical references to update (expected)
- `src/app/hooks/useCloudSave.ts`
- `src/app/api/cloudClient.ts`
- `src/app/components/CloudSavePanel.tsx` / `src/app/components/CloudSaveModal.tsx`
- `backend/server.js`
- `prisma/schema.prisma` (if adding `revision`)
- `tests/backend/*`
- `tests/app/*`
- `tests/e2e/*` (optional smoke for auto-sync toggle + conflict surface)

# Acceptance criteria
- Auto-sync toggle exists in Cloud Save options and defaults to OFF.
- When enabled, app can auto-load cloud on startup and auto-save local changes with rate-limits.
- Conflicts are detected and do not cause silent data loss; user can resolve explicitly.
- Warmup/offline errors are recoverable and do not force logout.
- Tests cover conflict detection and basic auto-sync flow.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended:
  - `npm run coverage:ci`
  - `npm run test:e2e`

# Risks / open points
- “Auto-load cloud vs preserve local unsynced progress” may need a UX choice if both diverged.
- Clock skew between devices means `lastTick` timestamps are not a perfect ordering key.
- Adding a server `revision` is the cleanest conflict token; using `updatedAt` may be sufficient but must be handled carefully.

# Backlog
- Backlog items should be generated next (backend token+409, frontend toggle+orchestrator, conflict UX, tests).

