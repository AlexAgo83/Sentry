## item_121_add_cloud_username_field_and_profile_update_endpoint - Add cloud username field and profile update endpoint
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Backend
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Cloud accounts are currently email-only and do not support a custom public username for leaderboard display.

# Scope
- In:
- Add optional `username` field to user persistence model.
- Add authenticated profile endpoint to update username:
  - `PATCH /api/v1/users/me/profile`
- Enforce username validation rules:
  - max length: `16`,
  - unique across users,
  - no spaces,
  - alphanumeric only (no special characters).
- Treat empty/blank value as `null` (no username).
- Ensure uniqueness strategy is deterministic (prefer case-insensitive uniqueness behavior).
- Out:
- No leaderboard UI changes in this item.
- No modal wiring in settings in this item.

# Acceptance criteria
- Schema supports optional username persistence.
- Authenticated users can update their username through the profile endpoint.
- Invalid usernames (too long, duplicate, contains space/special chars) are rejected with stable errors.
- Empty username is stored as unset (`null`) for email-fallback behavior.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`.
- Main references: `prisma/schema.prisma`, migration files, `backend/server.js`, auth middleware.
