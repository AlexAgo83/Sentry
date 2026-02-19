## item_184_req055_ship_non_blocking_conflict_resolution_ux_in_cloud_save_surface - req055 ship non-blocking conflict UX with explicit cloud/local resolution actions
> From version: 0.9.36
> Understanding: 94%
> Confidence: 89%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
When divergence is detected, users need a clear and safe resolution flow. A blocking global modal is not desired for v1; conflict handling should stay actionable without freezing gameplay.

# Scope
- In:
- Keep conflict resolution in Cloud Save surface (panel/modal) with explicit actions:
  - `Load cloud save`
  - `Overwrite cloud with local`
- Update conflict copy to explain that both local and cloud changed.
- Ensure conflict state blocks automatic writes until explicit user resolution.
- Optional startup hint (non-blocking, dismissible) may route users to Cloud Save but must not force immediate modal choice.
- Ensure successful resolution clears conflict state and resumes eligible auto-sync behavior.
- Out:
- No mandatory full-screen/blocking conflict modal.
- No merge tooling.

# Acceptance criteria
- Conflict is visible and actionable from Cloud Save UI without blocking the game.
- User can deterministically resolve by choosing cloud or local.
- Auto-sync does not silently proceed while conflict is unresolved.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution.md`.
- Likely touch points:
  - `src/app/components/CloudSavePanel.tsx`
  - `src/app/components/CloudSaveModal.tsx`
  - `src/app/hooks/useCloudSave.tsx`
