## item_181_req055_add_local_sync_watermark_persistence_and_lifecycle_rules - req055 add device-local sync watermark persistence and lifecycle rules
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Frontend / Persistence Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Auto-sync currently lacks a causal per-device baseline. Without a persisted watermark (`lastSyncedCloudRevision`, `lastSyncedLocalFingerprint`), the client cannot reliably decide whether local and cloud diverged.

# Scope
- In:
- Add a device-local watermark persistence contract and adapter.
- Persist and read:
  - `lastSyncedCloudRevision`
  - `lastSyncedLocalFingerprint`
  - optional diagnostic metadata (`updatedAtMs`, `schemaVersion`).
- Define lifecycle/reset rules:
  - clear on logout,
  - clear/reset on flows that invalidate prior sync assumptions (import/reset as defined by req055 policy).
- Expose typed helpers for read/write/clear watermark operations.
- Out:
- No bootstrap decision matrix changes (covered by item_183).

# Acceptance criteria
- Watermark can be read/written deterministically across app sessions on the same device.
- Logout and reset/import flows apply the agreed watermark reset policy.
- No runtime error when watermark is missing or legacy/invalid.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution.md`.
- Likely touch points:
  - `src/adapters/persistence/*`
  - `src/app/hooks/useCloudSave.tsx`
  - `tests/app/*` and/or adapter tests
