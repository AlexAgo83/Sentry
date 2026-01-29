## task_027_db_dump_and_reset_utilities - DB dump and reset utilities
> From version: 0.8.11
> Understanding: 92%
> Confidence: 86%
> Progress: 0%

# Context
Derived from `logics/backlog/item_025_db_dump_and_reset_utilities.md`

# Plan
- [ ] 1. Add Node JS scripts for dump/restore/reset with CLI parsing and safety checks.
- [ ] 2. Implement target selection (local/render), SSL handling, and schema guards.
- [ ] 3. Add dump/restore behaviors (custom dump, optional SQL, dry-run, dump-file, force).
- [ ] 4. Add npm scripts and gitignore for dumps.
- [ ] 5. Add smoke tests (mocked child_process) for CLI parsing and safety paths.
- [ ] FINAL: Update related Logics docs if scope changes.

# Test plan
- Unit: CLI parsing, target selection, schema guard (`schema=sentry`), confirm/force checks.
- Unit: dry-run prints commands without execution.
- Integration: dump/restore commands assembled correctly for local/render.

# Validation
- npm run tests
- npm run lint
- node scripts/db/dump.js --target=local --dry-run
- node scripts/db/reset-from-dump.js --target=local --dump-file ./scripts/db/dumps/example.dump --dry-run

# Risks & rollback
- What can break: accidental data loss if reset is mis-targeted or guards fail.
- How to detect regressions: unit tests for safety checks + mandatory confirm/force gating.
- Rollback plan: restore from the latest dump; disable reset script in prod if needed.

# Report

# Estimate
- Size: M
- Drivers:
  - Unknowns: environment parity across local/Render; tool availability (`pg_dump`, `pg_restore`).
  - Integration points: env parsing, shell execution, CI mocks.
  - Migration/rollback risk: medium (operational risk).
