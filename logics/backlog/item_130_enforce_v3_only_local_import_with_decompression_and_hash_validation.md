## item_130_enforce_v3_only_local_import_with_decompression_and_hash_validation - Enforce v3-only local import with decompression and hash validation
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without strict v3 parsing, manual import may accept non-compressed legacy formats and bypass the new payload-integrity contract.

# Scope
- In:
- Update manual import parser flow to accept only valid v3 envelopes.
- Validate envelope fields and `payloadEncoding`.
- Decompress payload and verify SHA-256 checksum before save migration/validation.
- Reject invalid/tampered payloads (bad compression, bad checksum, malformed shape).
- Keep user-facing failure message unchanged (`Invalid save data.`).
- Out:
- No requirement to support v2/legacy manual import strings.

# Acceptance criteria
- Valid v3 imports restore save successfully.
- Corrupt/invalid v3 imports are rejected consistently.
- Old manual formats are not required and can be rejected.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_042_local_save_import_export_compressed_and_hashed_payload.md`.
- Depends on `item_128`.
