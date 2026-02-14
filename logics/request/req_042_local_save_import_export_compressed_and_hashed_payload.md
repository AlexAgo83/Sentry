## req_042_local_save_import_export_compressed_and_hashed_payload - Compress and hash local save import/export payloads
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- When users export local save, the generated text must be compressed and hashed.
- When users import local save, compressed+hashed payload must be supported and validated.

# Context
- Current export flow serializes a JSON save envelope and copies it as plain JSON text.
- Current envelope (`schemaVersion: 2`) already includes a checksum, but payload is still uncompressed JSON object.
- Large saves are harder to copy/share manually and are more error-prone when edited or truncated.

# Goals
- Reduce export text size significantly through compression.
- Guarantee integrity at import time via hash verification.
- Preserve a safe migration path from old exports.

# Locked decisions (v1)
- Add a new save envelope format (`schemaVersion: 3`) for compressed payloads.
- Envelope remains JSON text (single string users can copy/paste), but save payload is compressed string data.
- Integrity hash remains mandatory and uses SHA-256 (hex).
- Import/export for manual local save actions uses v3 format only.
- Old import strings (v2/legacy) are explicitly out of scope and can be rejected.
- On import failure (invalid compression, invalid hash, invalid save shape), UX remains `Invalid save data.`
- This request is compression+integrity only, not encryption.

# Scope detail (draft)
- Save envelope
  - Introduce `SaveEnvelopeV3` with explicit fields for:
    - `schemaVersion: 3`
    - `savedAt`
    - `payloadEncoding` (e.g. `"deflate-base64"` or selected deterministic encoding)
    - `payloadCompressed` (string)
    - `checksum` (SHA-256 hex)
  - Keep `SaveEnvelopeV2` parser behavior unchanged.

- Export path
  - In local export flow, produce v3 envelope by default.
  - Compute checksum from canonical uncompressed payload JSON (same validation reference across versions).
  - Compress payload deterministically and serialize envelope as JSON string.

- Import path
  - Detect v3 envelope.
  - Decompress payload string.
  - Recompute checksum and reject on mismatch.
  - Run existing migration/validation pipeline (`migrateAndValidateSave`) on reconstructed save.

# Suggested data contract (draft)
- `SaveEnvelopeV3`
  - `schemaVersion: 3`
  - `savedAt: number`
  - `payloadEncoding: string`
  - `payloadCompressed: string`
  - `checksum: string`

- Checksum source
  - `sha256Hex(JSON.stringify(payloadSaveObject))`

# Technical references to update
- `src/adapters/persistence/saveEnvelope.ts`
- `src/app/hooks/useSaveManagement.ts`
- `src/app/components/LocalSaveModal.tsx` (optional helper text update)
- `tests/adapters/persistence/saveEnvelope.test.ts`
- `tests/adapters/persistence/saveMigrations.test.ts` (if parser paths are touched)
- `tests/app/hooks/useSaveManagement.test.tsx`

# Acceptance criteria
- Exported local save text is compressed and hash-protected (v3 envelope).
- Import accepts valid v3 payload and restores save correctly.
- Import rejects tampered/corrupt v3 payload (bad checksum/compression) as invalid.
- v2/legacy manual import strings are not required to be supported.
- Existing save migration/validation guarantees remain in place.
- No regression on local save modal export/import/reset flows.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - round-trip test: v3 create -> parse -> same save object
  - corruption tests:
    - modified `payloadCompressed`
    - modified `checksum`
    - unsupported `payloadEncoding`
  - save management tests:
    - export produces v3 envelope string
    - import path handles valid/invalid v3 strings

# Risks / open points
- Compression algorithm choice must be deterministic and available in browser + test runtime.
- Very old browsers/runtime may require polyfill/fallback for chosen compression primitive.
- Compressed payload should stay text-safe for clipboard/prompt flows (ASCII-safe encoding).
- Hash verification must use exactly the same canonical payload serialization to avoid false negatives.

# Backlog
- `logics/backlog/item_128_define_save_envelope_v3_with_compressed_payload_and_sha256_integrity.md`
- `logics/backlog/item_129_update_local_export_flow_to_emit_v3_compressed_save_strings.md`
- `logics/backlog/item_130_enforce_v3_only_local_import_with_decompression_and_hash_validation.md`
- `logics/backlog/item_131_update_local_save_modal_guidance_for_compressed_hashed_format.md`
- `logics/backlog/item_132_add_v3_save_import_export_regression_tests_and_validation_gates.md`
