## item_037_validate_cloud_save_payloads - Validate cloud save payloads server-side
> From version: 0.8.17
> Understanding: 93%
> Confidence: 91%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
The server currently accepts any JSON payload for saves, which allows corrupted or incompatible data to be stored.

# Scope
- In:
  - Define a minimal save schema (version + top‑level shape) and validate on upload.
  - Reject invalid payloads with a clear 400 response.
  - Tolerate unknown fields (forward compatibility).
  - Add logging/telemetry for validation failures.
  - Add backend tests for valid/invalid payloads.
- Out:
  - Deep migration logic on the server.
  - Full schema validation for every nested field (v1 stays shallow).

# Acceptance criteria
- Invalid save uploads are rejected with a 400 + useful error message.
- Valid saves continue to be stored and returned as before.
- Validation covers version + required top‑level fields at minimum.
- Tests cover both valid and invalid save uploads.

# Priority
- Impact: High (data integrity).
- Urgency: Medium.

# Notes
- Keep client-side migrations; server only guards against malformed payloads.
- Provide a versioned JSON Schema (minimal) for validation.
