## task_032_validate_cloud_save_payloads_server_side - Validate cloud save payloads server-side
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_037_validate_cloud_save_payloads.md`.
Shallow validation: version + top-level fields. Unknown fields allowed. Invalid payloads should return 400.

# Plan
- [ ] 1. Define minimal save schema + version contract (top-level fields only).
- [ ] 2. Implement server-side validator and reject invalid payloads with 400.
- [ ] 3. Add logging/telemetry for validation failures.
- [ ] 4. Add backend tests for valid and invalid payloads.
- [ ] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint

# Report
- Status: not started.
