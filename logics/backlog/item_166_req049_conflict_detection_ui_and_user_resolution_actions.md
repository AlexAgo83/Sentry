## item_166_req049_conflict_detection_ui_and_user_resolution_actions - Add conflict UX and explicit resolution actions for auto-sync
> From version: 0.9.31
> Understanding: 90%
> Confidence: 82%
> Progress: 0%
> Complexity: High
> Theme: UX / Safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
When two devices diverge, auto-sync must not overwrite silently. The user needs a clear conflict UI and explicit actions to resolve.

# Scope
- In:
- Handle backend 409 conflicts from auto-sync:
  - pause/disable auto-sync for the session
  - surface a clear `Conflict detected` state in Cloud Save UI
- Provide explicit resolution actions:
  - `Load cloud` (replace local with cloud)
  - `Overwrite cloud with local` (retry save using latest expected token)
- Display helpful meta for user decision:
  - cloud last updated, cloud score, cloud version (as available)
  - local equivalents (as available)
- Ensure the flow is safe:
  - never auto-apply a destructive overwrite on conflict
  - after resolution, auto-sync resumes normally
- Out:
- No complicated merge tools.

# Acceptance criteria
- Conflict scenarios do not cause silent data loss.
- UI clearly communicates conflict and offers deterministic resolution actions.
- After resolution, auto-sync can continue.

# Implementation notes
- Likely touch points:
  - `src/app/hooks/useCloudSave.ts` (conflict state + actions)
  - `src/app/components/CloudSaveModal.tsx` / panel UI

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling.md`.

