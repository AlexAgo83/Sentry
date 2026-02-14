## item_132_add_v3_save_import_export_regression_tests_and_validation_gates - Add v3 save import export regression tests and validation gates
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Compression and hash-validation logic is sensitive to serialization, encoding, and corruption edge cases, and can regress silently without dedicated tests.

# Scope
- In:
- Add adapter tests for v3 envelope:
  - create/parse round-trip,
  - decompression + checksum verification,
  - corrupted payload rejection,
  - corrupted checksum rejection,
  - unsupported encoding rejection.
- Add save management tests:
  - export emits v3 envelope string,
  - import accepts valid v3,
  - import rejects invalid v3.
- Run validation gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Out:
- No additional product behavior beyond validation coverage.

# Acceptance criteria
- New tests cover core v3 success/failure paths.
- Full validation command battery passes.
- No regression on local save modal workflows.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_042_local_save_import_export_compressed_and_hashed_payload.md`.
- Quality gate for items `item_128` through `item_131`.
