## req_040_settings_leaderboard_modal_and_cloud_username - Add leaderboard modal and editable cloud username
> From version: 0.9.26
> Understanding: 96%
> Confidence: 93%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a `Leaderboard` button in `Settings`.
- Place `Leaderboard` immediately after `Save options` in the Settings action list.
- Open a dedicated leaderboard modal from this button.
- Display users sorted by `virtualScore` (descending).
- For each leaderboard row, display:
  - username (or email fallback),
  - virtual score,
  - last save date,
  - last save app version.
- Allow logged-in users to define/edit a cloud username from Cloud Save UI.
- Username behavior:
  - default empty,
  - fallback to email when empty.
- Username editing UX should follow the same interaction pattern as hero name editing modal.

# Context
- Cloud save already stores `virtualScore` and `updatedAt` metadata server-side.
- Current user identity in cloud auth is email-based only.
- There is no global ranking view in-app yet.

# Goals
- Add an in-app leaderboard accessible from `Settings`.
- Reuse existing modal conventions for consistency.
- Introduce a user-friendly public display name system without breaking current email-based auth.

# Locked decisions (v1)
- Settings ordering:
  - `Leaderboard` is rendered right after `Save options`.
- Leaderboard sorting:
  - strict descending order by `virtualScore`.
- Display name:
  - `username` when non-empty,
  - otherwise fallback to a masked email (not full email).
  - mask rule example: `toto25@toto.com` -> `t****5@toto.com`.
- Username edition:
  - available only when authenticated in Cloud Save modal,
  - uses same UX model as hero rename modal (single-field edit/confirm flow).
- Username validation:
  - max `16` characters,
  - must be unique across users,
  - no spaces,
  - no special characters (alphanumeric only).
- Leaderboard loading:
  - same behavior as changelogs: infinite scrolling,
  - fetch next chunk when reaching list bottom,
  - page size remains `10` entries per request.
- Tie handling:
  - when multiple users have the same `virtualScore`, they are displayed as `ex aequo`.
- No gameplay logic changes.

# Scope detail (draft)
- Frontend:
  - Add `Leaderboard` action in `SystemModal`.
  - Add `LeaderboardModal` with:
    - loading/empty/error states,
    - scrollable ranking list,
    - per-row rank, display name, score, last save timestamp, and save app version.
  - Add cloud username edit trigger in authenticated Cloud Save section.
  - Reuse existing naming modal component/pattern for username edition where possible.
- Backend:
  - Extend user model with optional `username` field.
  - Add endpoint to update current user username.
  - Add endpoint to fetch leaderboard entries sorted by `virtualScore` with `updatedAt` and save `appVersion`.
  - Ensure response exposes safe display name logic (username fallback to email).
- Data:
  - Leaderboard row shape includes `displayName`, `virtualScore`, `updatedAt`, `appVersion`.
  - Include tie metadata (or enough data) so UI can mark `ex aequo` entries.

# Suggested API contract (draft)
- `GET /api/v1/leaderboard?page=<n>&perPage=10`
  - returns users with a save ordered by `virtualScore DESC`, then deterministic tie-breakers.
  - response includes `hasNextPage` for infinite scrolling.
  - each entry includes save `appVersion`.
- `PATCH /api/v1/users/me/profile`
  - payload: `{ username: string | null }`
  - trims input, stores `null`/empty as no username.
  - validates max length, uniqueness, and allowed characters.

# Technical references to update
- `src/app/components/SystemModal.tsx`
- `src/app/containers/AppModalsContainer.tsx`
- `src/app/components/` (new `LeaderboardModal.tsx`)
- `src/app/api/` (leaderboard/profile client calls)
- `src/app/components/CloudSavePanel.tsx`
- `src/app/components/HeroNameModal.tsx` (or shared modal abstraction reuse)
- `src/app/hooks/useCloudSave.ts`
- `backend/server.js` (or route modules if split)
- `prisma/schema.prisma` + migration for `User.username`
- `tests/app/systemModal.test.tsx`
- `tests/app/*leaderboard*.test.tsx`
- `tests/backend/cloudApi.test.ts` (profile update)
- `tests/backend/*leaderboard*.test.ts`

# Acceptance criteria
- `Settings` contains a `Leaderboard` action rendered immediately after `Save options`.
- Clicking `Leaderboard` opens a dedicated modal.
- Leaderboard list is sorted by `virtualScore` descending.
- Leaderboard uses infinite scrolling and loads additional entries by chunks of `10`.
- Each leaderboard row shows display name, virtual score, last save date, and save app version.
- If no username is set, leaderboard shows masked email fallback (not plain email).
- Authenticated users can edit their cloud username from Cloud Save modal.
- Username validation enforces:
  - max `16` chars,
  - uniqueness,
  - no spaces/special chars.
- Empty username falls back to masked email in leaderboard and related displays.
- Username update persists and is visible after refresh.
- Equal `virtualScore` entries are marked as `ex aequo`.
- Loading/empty/error states are handled clearly in leaderboard modal.
- Existing settings/cloud flows remain functional.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - frontend tests for settings ordering + leaderboard modal rendering/states,
  - frontend tests for infinite scroll loading batches of `10`,
  - frontend tests for `ex aequo` rendering on tied scores,
  - frontend tests for username edit flow (authenticated only),
  - backend tests for leaderboard ordering and payload shape,
  - backend tests for username validation/update + masked email fallback behavior,
  - backend tests for uniqueness rejection and allowed-character rules.

# Risks / open points
- Email masking logic must be consistent for all valid email shapes.
- Username uniqueness should be case-insensitive to avoid duplicates that differ only by case.
- Infinite scrolling must avoid duplicate rows and repeated fetch loops.
- Tie-breaking rules should remain deterministic even when showing `ex aequo`.

# Backlog
- `logics/backlog/item_119_add_settings_leaderboard_entry_and_modal_navigation.md`
- `logics/backlog/item_120_implement_backend_leaderboard_endpoint_sorted_by_virtual_score.md`
- `logics/backlog/item_121_add_cloud_username_field_and_profile_update_endpoint.md`
- `logics/backlog/item_122_build_leaderboard_modal_ui_with_loading_empty_error_states.md`
- `logics/backlog/item_123_add_cloud_save_username_edit_flow_with_email_fallback.md`
- `logics/backlog/item_124_add_leaderboard_and_username_feature_test_coverage_frontend_backend.md`
