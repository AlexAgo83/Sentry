## item_183_req055_replace_bootstrap_autosync_heuristics_with_causal_decision_matrix - req055 replace heuristic bootstrap sync with causal watermark/fingerprint matrix
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: Large
> Theme: Frontend / Sync Orchestration Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current bootstrap auto-sync decisions prioritize `virtualScore` and `updatedAt`, which can misclassify divergence after delayed backend wakeup or non-score local edits.

# Scope
- In:
- Replace startup sync decision logic with the req055 causal matrix:
  - local unchanged + cloud unchanged -> no-op,
  - local changed + cloud unchanged -> overwrite cloud,
  - local unchanged + cloud changed -> load cloud,
  - local changed + cloud changed -> conflict.
- Use watermark revision/fingerprint and current local/cloud fingerprint inputs.
- Treat missing-watermark + both sides populated as ambiguous conflict unless explicit safe shortcut criteria are met.
- Keep `expectedRevision` writes and 409 handling as final concurrency guard.
- Update watermark atomically after successful `loadCloud` or `overwriteCloud`.
- Align periodic push checks with fingerprint-diff semantics (not score/date heuristics).
- Out:
- Conflict UX polish details beyond orchestration hooks (covered by item_184).

# Acceptance criteria
- Bootstrap sync no longer relies on score/date as primary divergence detector.
- Diverged states are surfaced as conflict, never silently overwritten.
- Delayed backend wakeup does not alter causal decision correctness.
- Successful sync operations consistently refresh watermark state.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution.md`.
- Likely touch points:
  - `src/app/hooks/useCloudSave.tsx`
  - `src/app/api/cloudClient.ts`
  - `src/app/components/CloudSavePanel.tsx`
