## item_128_define_save_envelope_v3_with_compressed_payload_and_sha256_integrity - Define save envelope v3 with compressed payload and sha256 integrity
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The current exported local save text is plain JSON payload, which is larger than needed and not explicitly modeled for compression.

# Scope
- In:
- Introduce a `SaveEnvelopeV3` structure dedicated to compressed save payload transport.
- Define explicit v3 fields:
  - `schemaVersion: 3`
  - `savedAt`
  - `payloadEncoding`
  - `payloadCompressed`
  - `checksum`
- Keep checksum policy deterministic via SHA-256 over canonical uncompressed payload JSON.
- Add internal codec helpers for payload (compress/decompress + base64-safe representation).
- Out:
- No UI behavior changes in this item.
- No backward compatibility requirements for old manual import/export formats.

# Acceptance criteria
- `saveEnvelope` layer exposes v3 envelope typing and construction path.
- Compression/hash primitives are centralized and reusable by export/import flows.
- v3 envelope payload is fully text-safe for clipboard/prompt transport.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_042_local_save_import_export_compressed_and_hashed_payload.md`.
- Foundation item for `item_129` and `item_130`.
