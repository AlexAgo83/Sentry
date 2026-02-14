## task_093_execute_local_save_v3_compressed_hashed_flow_across_backlog_items_128_to_132 - Execute local save v3 compressed hashed flow across backlog items 128 to 132
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_128_define_save_envelope_v3_with_compressed_payload_and_sha256_integrity.md`
- `logics/backlog/item_129_update_local_export_flow_to_emit_v3_compressed_save_strings.md`
- `logics/backlog/item_130_enforce_v3_only_local_import_with_decompression_and_hash_validation.md`
- `logics/backlog/item_131_update_local_save_modal_guidance_for_compressed_hashed_format.md`
- `logics/backlog/item_132_add_v3_save_import_export_regression_tests_and_validation_gates.md`

Request reference:
- `logics/request/req_042_local_save_import_export_compressed_and_hashed_payload.md`

This task orchestrates end-to-end delivery of compressed and hash-verified local save import/export using a v3 envelope, without legacy manual format compatibility.

# Decisions (v1)
- Manual local save import/export uses v3 envelope only (`schemaVersion: 3`).
- Payload is compressed and transported as text-safe encoded string data.
- Integrity is mandatory with SHA-256 checksum over canonical uncompressed payload JSON.
- Import rejects invalid/corrupt/unsupported v3 payloads with existing generic invalid-save UX.
- Legacy manual import strings are out of scope and can be rejected.
- Delivery is phase-based with mandatory final full validation battery.

# Plan
- [x] 1. Baseline and guardrails:
  - Confirm current local save import/export flow and envelope behavior.
  - Identify existing tests touching `saveEnvelope` and `useSaveManagement`.
- [x] 2. Execute `item_128` (v3 envelope + codec foundation):
  - Add `SaveEnvelopeV3` data contract and codec helpers (compress/decompress + text-safe encoding).
  - Centralize deterministic checksum generation/verification primitives.
- [x] 3. Execute `item_129` (local export emits v3):
  - Update export path to emit v3 envelope JSON string.
  - Ensure checksum is generated from canonical uncompressed payload JSON.
- [x] 4. Execute `item_130` (v3-only import + verification):
  - Enforce v3 manual import path.
  - Decompress payload, verify checksum, then run existing migrate/validate pipeline.
  - Reject unsupported encoding and corrupted payload/checksum paths.
- [x] 5. Execute `item_131` (modal UX copy update):
  - Update local save modal helper text/messages to reflect compressed+hashed format.
  - Keep behavior and error wording aligned with current UX constraints.
- [x] 6. Execute `item_132` (tests and quality gate):
  - Add/extend adapter tests for v3 round-trip and corruption cases.
  - Add/extend save management tests for export/import success/failure behavior.
- [x] 7. Final stabilization:
  - Verify no regressions on local save modal import/export/reset workflows.
  - Ensure request/backlog docs stay aligned with implementation decisions.
- [x] 8. Final mandatory full test battery:
  - Run complete validation suite at task end.
  - Fix all failing checks before marking task complete.
- [x] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`

# Report
- Completed:
  - Added v3 envelope support in `saveEnvelope` with:
    - `schemaVersion: 3`,
    - `payloadEncoding: "deflate-base64"`,
    - compressed `payloadCompressed`,
    - SHA-256 checksum integrity verification.
  - Added dedicated v3 parser (`parseSaveEnvelopeV3`) with strict v3-only validation, decompression, canonical checksum verification, and migrate/validate pipeline.
  - Updated local manual export/import flow (`useSaveManagement`) to:
    - export v3 compressed envelope strings only,
    - import via v3 parser only (legacy manual strings rejected).
  - Updated local save modal helper copy to reflect compressed + integrity-checked behavior.
  - Added/updated tests for:
    - v3 envelope round-trip and corruption/error paths,
    - hook-level export v3 shape and invalid v3 import rejection.
- Validation:
  - `npm run lint`
  - `npm run typecheck -- --pretty false`
  - `npm run typecheck:tests -- --pretty false`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`
