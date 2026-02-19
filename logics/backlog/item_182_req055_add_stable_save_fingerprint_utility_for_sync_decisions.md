## item_182_req055_add_stable_save_fingerprint_utility_for_sync_decisions - req055 add stable save fingerprint utility for causal sync decisions
> From version: 0.9.36
> Understanding: 94%
> Confidence: 89%
> Progress: 0%
> Complexity: Medium
> Theme: Core / Deterministic Data Modeling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Heuristic freshness checks miss non-score changes (for example rename-only edits). We need a deterministic payload-level fingerprint to detect meaningful local changes.

# Scope
- In:
- Add `buildSaveFingerprint(payload)` utility based on canonical serialization + hash.
- Ensure fingerprint stability for semantically identical saves.
- Document and test edge cases:
  - key ordering,
  - optional/null fields,
  - legacy payload normalization boundaries.
- Integrate utility entry points required by sync orchestration.
- Out:
- No full orchestrator rewrite (covered by item_183).

# Acceptance criteria
- Equivalent payloads always generate the same fingerprint.
- Different payloads with meaningful gameplay/user changes generate different fingerprints.
- Utility is test-covered and reusable from cloud sync code.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_055_cloud_sync_causal_watermark_and_deterministic_conflict_resolution.md`.
- Likely touch points:
  - `src/core/serialization.ts` (or dedicated utility module)
  - `src/app/hooks/useCloudSave.tsx`
  - `tests/core/*` and `tests/app/*`
