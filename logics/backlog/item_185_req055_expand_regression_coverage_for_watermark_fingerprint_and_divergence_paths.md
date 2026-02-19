## item_185_req055_expand_regression_coverage_for_watermark_fingerprint_and_divergence_paths - req055 expand regression coverage for watermark, fingerprint, and causal divergence paths
> From version: 0.9.36
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: Testing / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Req055 modifies high-risk sync decision logic. Without dedicated tests, regressions can reintroduce silent data loss or inconsistent conflict handling.

# Scope
- In:
- Add tests for the full causal decision matrix (4 core branches + ambiguous bootstrap).
- Add tests for watermark lifecycle and watermark updates on successful load/overwrite.
- Add tests for rename-only/non-score local edits being detected as local changes.
- Add tests ensuring delayed backend wakeup does not alter decision correctness.
- Add UI tests for non-blocking conflict surface and explicit resolution actions.
- Run and pass validation battery:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Out:
- Additional feature scope beyond req055.

# Acceptance criteria
- Automated tests cover req055 acceptance criteria and locked decisions.
- Critical sync regressions are caught in CI.
- Validation battery passes before task closure.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution.md`.
- Likely touch points:
  - `tests/app/*`
  - `tests/core/*`
  - `tests/backend/cloudApi.test.ts` (regression alignment)
