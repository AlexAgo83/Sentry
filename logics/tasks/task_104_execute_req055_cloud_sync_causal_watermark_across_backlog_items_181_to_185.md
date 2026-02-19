## task_104_execute_req055_cloud_sync_causal_watermark_across_backlog_items_181_to_185 - Execute req055 cloud sync causal watermark across backlog items 181 to 185
> From version: 0.9.36
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Reliability / Cloud Sync Integrity
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_181_req055_add_local_sync_watermark_persistence_and_lifecycle_rules.md`
- `logics/backlog/item_182_req055_add_stable_save_fingerprint_utility_for_sync_decisions.md`
- `logics/backlog/item_183_req055_replace_bootstrap_autosync_heuristics_with_causal_decision_matrix.md`
- `logics/backlog/item_184_req055_ship_non_blocking_conflict_resolution_ux_in_cloud_save_surface.md`
- `logics/backlog/item_185_req055_expand_regression_coverage_for_watermark_fingerprint_and_divergence_paths.md`

Request reference:
- `logics/request/req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution.md`

This orchestration task delivers req055 end-to-end:
- causal local/cloud divergence detection via device-local watermark,
- deterministic sync decisions via fingerprint + revision matrix,
- non-blocking conflict resolution UX in Cloud Save surface,
- regression coverage for rename-only and delayed-wakeup edge cases.

# Decisions (v1)
- Add a device-local sync watermark storing:
  - `lastSyncedCloudRevision`
  - `lastSyncedLocalFingerprint`
- Use stable payload fingerprinting as the primary local-change signal.
- Replace bootstrap score/date-first sync decisions with causal matrix:
  - local unchanged + cloud unchanged -> no-op,
  - local changed + cloud unchanged -> overwrite cloud,
  - local unchanged + cloud changed -> load cloud,
  - local changed + cloud changed -> conflict.
- Missing watermark + both local/cloud populated is treated as ambiguous and resolved explicitly.
- Keep backend `expectedRevision` / `409` as final concurrency guardrail.
- Conflict UX is non-blocking:
  - no forced global blocking modal by default,
  - resolution actions stay in Cloud Save UI,
  - optional startup hint can deep-link to Cloud Save but must remain dismissible.

# Plan
- [x] 1. Execute `item_181` (watermark persistence + lifecycle):
  - Add typed local storage adapter for sync watermark.
  - Define reset semantics on logout and save-invalidating flows.
  - Ensure missing/legacy watermark states are safe.
- [x] 2. Execute `item_182` (stable fingerprint utility):
  - Implement canonical save fingerprint generation.
  - Add deterministic tests for equivalent/non-equivalent payloads.
  - Expose utility for sync orchestrator usage.
- [x] 3. Execute `item_183` (causal bootstrap decision matrix):
  - Replace heuristic-first bootstrap logic in cloud auto-sync.
  - Integrate watermark + fingerprint + cloud revision matrix.
  - Update watermark atomically after successful load/overwrite.
  - Align periodic push guards with fingerprint-based local-change detection.
- [x] 4. Execute `item_184` (non-blocking conflict UX):
  - Surface “both local and cloud changed” conflict state in Cloud Save UI.
  - Keep explicit user actions: `Load cloud save` / `Overwrite cloud with local`.
  - Ensure unresolved conflict blocks automatic writes until user decision.
  - Add optional non-blocking startup hint routing to Cloud Save, if included.
- [x] 5. Execute `item_185` (regression coverage + validation):
  - Add matrix tests (4 branches + ambiguous bootstrap).
  - Add watermark lifecycle/update tests.
  - Add rename-only divergence regression test.
  - Add delayed backend wakeup regression test.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

Recommended:
- `npm run build`
- `npm run test:e2e`

# Report
Track final delivery with:
- watermark persistence contract and lifecycle behavior,
- fingerprint utility and determinism guarantees,
- causal decision matrix implementation details,
- conflict UX behavior and resolution flow,
- tests added/updated,
- validation results and residual risks.
