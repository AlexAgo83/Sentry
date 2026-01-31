## adr_001_server_side_save_payload_validation_minimal_schema - Server-side save payload validation (minimal schema)
> Date: 2026-01-31
> Status: Proposed

# Context
The backend currently accepts any JSON for cloud saves. Corrupted or incompatible payloads can be stored and later
break clients. We need server‑side validation without blocking forward compatibility or adding heavy schema tooling.

# Decision
Implement a minimal, shallow save schema validation on the server:
- Require `version` and `players` at the top level.
- Validate types for optional fields (e.g., `schemaVersion`, `lastTick`, `inventory`, `quests`).
- Allow unknown fields for forward compatibility.
- Return 400 with a clear error message and log validation failures.

# Alternatives considered
- Full deep validation of all nested fields (high maintenance, version coupling).
- Client‑only validation (server still stores invalid data).
- JSON Schema runtime with a full schema (heavier deps and maintenance).

# Consequences
- Some malformed payloads will be rejected early (data integrity improves).
- Server stays shallow; clients retain migration responsibility.
- Error logs add visibility for invalid upload attempts.
