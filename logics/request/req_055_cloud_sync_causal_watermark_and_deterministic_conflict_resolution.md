## req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution - Replace score/time freshness heuristics with causal sync watermark and deterministic conflict handling
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Complexity: High
> Theme: Reliability / Data integrity
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Prevent false "local is newer" or "cloud is newer" decisions caused by delayed backend wakeup and heuristic comparisons.
- Guarantee no silent overwrite when two devices diverge offline.
- Keep auto-sync usable while making conflict decisions deterministic and explainable.

# Context
- Current auto-sync bootstrap compares local/cloud mostly via `virtualScore` then `updatedAt`.
- This can misclassify divergence in real-world cases (example: rename-only change on device A, delayed startup on device B).
- Backend already supports optimistic concurrency with `revision` and `409 Conflict`.
- We need causal decision inputs, not inferred freshness from gameplay metrics.

# Goals
- Introduce per-device sync watermark metadata to determine divergence causally.
- Use a deterministic decision matrix for bootstrap sync and background sync.
- Keep `expectedRevision` writes and conflict UI as hard safety rails.
- Remove/avoid heuristic-first auto decisions in ambiguous divergence states.

# Non-goals
- Implement CRDT or field-level merge of game saves.
- Guarantee automatic conflict-free sync when both sides changed.
- Redesign cloud auth/session mechanics.

# Locked decisions (v1)
- Add a local per-device watermark store:
  - `lastSyncedCloudRevision`
  - `lastSyncedLocalFingerprint`
- Compute `localFingerprint` from a stable serialized local save payload at decision time.
- Deterministic bootstrap decision matrix:
  - Local unchanged + Cloud unchanged -> no-op.
  - Local changed + Cloud unchanged -> overwrite cloud (with `expectedRevision`).
  - Local unchanged + Cloud changed -> load cloud.
  - Local changed + Cloud changed -> conflict (no auto overwrite/load).
- If watermark is missing and both sides have save data -> treat as ambiguous and require explicit resolution.
- Keep `expectedRevision` on upload and keep server `409` handling as final concurrency guard.
- On successful `loadCloud` or `overwriteCloud`, watermark must be updated atomically with the successful operation result.
- Conflict UX v1:
  - no blocking global modal by default,
  - conflict is resolved from Cloud Save UI with explicit actions,
  - optional non-blocking startup prompt may deep-link to Cloud Save but must not block gameplay.

# Scope detail (draft)
## A. New local sync watermark model
- Add a local persistence layer for cloud sync watermark (device-local, not shared in cloud payload).
- Data shape:
  - `revision: number | null`
  - `localFingerprint: string | null`
  - optional metadata for diagnostics (`updatedAtMs`, `schemaVersion`).
- Clear/reset watermark on logout and hard reset/import when required by policy.

## B. Stable fingerprint strategy
- Add `buildSaveFingerprint(payload)` utility using canonical serialization + hash.
- Ensure deterministic output for equivalent saves.
- Use this fingerprint for both local current state and fetched cloud payload where needed.

## C. Bootstrap sync orchestrator rewrite
- Replace current heuristic-first bootstrap branch with causal matrix using:
  - watermark revision/fingerprint,
  - current cloud revision,
  - current local fingerprint.
- Keep current guards for availability/auth/backend warmup.
- If ambiguous state (missing watermark with both local+cloud present), enter `conflict` state with explicit user actions.

## D. Ongoing auto-sync behavior
- Keep interval/visibility triggers.
- For push-if-needed, compare current local fingerprint with last synced fingerprint instead of relying only on `updatedAt` heuristic.
- Keep existing conflict state blocking automated pushes until user resolves.

## E. Conflict UX clarifications
- Keep conflict handling inside Cloud Save panel/modal surface (non-blocking flow).
- Update conflict messaging to explain "both local and cloud changed" instead of generic stale conflict only.
- Keep two explicit resolution actions:
  - `Load cloud save`
  - `Overwrite cloud with local`
- If a startup hint is added, it should be dismissible and route users to Cloud Save instead of forcing an immediate modal decision.
- Resolving conflict updates watermark consistently.

## F. Migration and backward compatibility
- Existing users have no watermark initially.
- First sync after rollout:
  - no cloud save -> push local and initialize watermark.
  - cloud save exists + local default/no progress -> allow load cloud shortcut.
  - otherwise -> explicit conflict resolution required.

# Technical references likely impacted
- `src/app/hooks/useCloudSave.tsx`
- `src/app/api/cloudClient.ts`
- `src/app/components/CloudSavePanel.tsx`
- `src/app/components/CloudSaveModal.tsx`
- `src/adapters/persistence/*` (or new adapter for watermark)
- `src/core/serialization.ts`
- `tests/app/cloudSavePanel.test.tsx`
- `tests/app/cloudSaveModal.test.tsx`
- `tests/app/*useCloudSave*` (new/expanded)
- `tests/backend/cloudApi.test.ts` (existing conflict flow regression checks)

# Acceptance criteria
- Auto-sync decisions do not rely on `virtualScore`/`updatedAt` heuristics as primary divergence detector.
- Bootstrap sync uses watermark + revision + fingerprint matrix.
- Diverged local/cloud states are surfaced as conflict; no silent overwrite.
- Rename-only or non-score local edits are detected as local changes.
- Delayed backend wakeup does not cause incorrect freshness classification.
- Successful load/overwrite updates watermark.
- Existing `409` conflict handling remains functional and covered by tests.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - unit tests for decision matrix (all 4 states + ambiguous bootstrap).
  - tests for watermark update on successful load/overwrite.
  - regression test for rename-only local change triggering correct branch.
  - tests ensuring warmup delay does not alter decision correctness.

# Risks / open points
- Fingerprint stability must remain deterministic across versions/serialization changes.
- Ambiguous first-sync conflict may increase user prompts for legacy users.
- Policy for "local default/no progress" shortcut needs a precise and testable definition.

# Backlog
- `logics/backlog/item_181_req055_add_local_sync_watermark_persistence_and_lifecycle_rules.md`
- `logics/backlog/item_182_req055_add_stable_save_fingerprint_utility_for_sync_decisions.md`
- `logics/backlog/item_183_req055_replace_bootstrap_autosync_heuristics_with_causal_decision_matrix.md`
- `logics/backlog/item_184_req055_ship_non_blocking_conflict_resolution_ux_in_cloud_save_surface.md`
- `logics/backlog/item_185_req055_expand_regression_coverage_for_watermark_fingerprint_and_divergence_paths.md`
