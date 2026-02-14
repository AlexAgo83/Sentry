## item_123_add_cloud_save_username_edit_flow_with_email_fallback - Add cloud save username edit flow with email fallback
> From version: 0.9.26
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Authenticated users currently cannot define a public display name for cloud/leaderboard identity, forcing raw email-only identity.

# Scope
- In:
- Add username edit action in Cloud Save when user is authenticated.
- Reuse hero rename modal interaction model:
  - open edit modal,
  - single text field,
  - confirm/cancel,
  - close on success.
- Connect edit flow to profile update API.
- Reflect saved username in cloud UI and related displays.
- Respect fallback behavior:
  - when username unset, display masked email fallback.
- Surface validation feedback to user for rejected usernames.
- Out:
- No backend schema/endpoint creation in this item.
- No leaderboard list rendering in this item.

# Acceptance criteria
- Username edit controls are visible only when logged in.
- Edit modal follows existing rename UX conventions.
- Successful update persists and is visible after refresh.
- Validation errors are displayed clearly.
- Unset username falls back to masked email display.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`.
- Main references: `src/app/components/CloudSavePanel.tsx`, `src/app/hooks/useCloudSave.ts`, `src/app/components/HeroNameModal.tsx`.
