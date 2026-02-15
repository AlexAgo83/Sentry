## item_165_req049_frontend_cloud_autosync_toggle_and_orchestrator_state_machine - Add Auto Sync toggle and orchestration layer (auto-load + auto-save decisions)
> From version: 0.9.31
> Understanding: 92%
> Confidence: 88%
> Progress: 100%
> Complexity: High
> Theme: Frontend / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Auto-sync requires a controlled state machine: startup auto-load, ongoing auto-save, and safe handling for offline/warmup/auth failures. Without orchestration, the feature risks silent data loss or annoying spam/retries.

# Scope
- In:
- Add a Cloud Save option switch: `Auto sync` (default OFF).
- Implement the core auto-sync orchestrator:
  - startup decision: fetch cloud meta and decide whether to auto-load or schedule auto-save
  - only operate when:
    - user is logged in
    - toggle is enabled
    - app is not in a state that would make auto-load unsafe
  - ensure network failures do not force logout
- Add status exposure for UI (ex: `ready`, `warming`, `offline`, `error`, `conflict`).
- Out:
- No conflict UI yet (handled in a separate item).

# Acceptance criteria
- Auto-sync toggle exists and defaults to OFF.
- When enabled, app performs a safe startup auto-load/auto-save decision using cloud meta/token.
- Warmup/offline errors are recoverable and do not clear auth state.

# Implementation notes
- Likely touch points:
  - `src/app/hooks/useCloudSave.ts` (or a new dedicated auto-sync hook)
  - `src/app/api/cloudClient.ts`
  - `src/app/components/CloudSaveModal.tsx` / panel

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling.md`.
