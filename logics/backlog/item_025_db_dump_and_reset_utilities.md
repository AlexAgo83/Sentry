## item_025_db_dump_and_reset_utilities - DB dump and reset utilities
> From version: 0.8.11
> Understanding: 92%
> Confidence: 86%
> Progress: 100%

# Problem
We need safe, repeatable tooling to dump and restore the full database for local and Render environments while enforcing schema safety rules.

# Scope
- In:
  - Scripts in Node JS (no TS runtime dependency): `scripts/db/dump.js`, `scripts/db/restore.js`, `scripts/db/reset-from-dump.js`.
  - Support `--target=local|render` (default local).
  - Enforce `schema=sentry` and refuse `schema=public`.
  - Dump full DB (data-only, no roles/privileges) using `pg_dump -Fc -Z 6`.
  - Optional `--sql` flag to also output a plain SQL dump.
  - Store dumps under `scripts/db/dumps/` (gitignored).
  - Support `--dump-file <path>` to restore a specific dump.
  - Support `--dry-run` to print commands without executing.
  - Reset-from-dump: drop & recreate `sentry` schema, then restore with `pg_restore --clean --if-exists --no-owner --no-privileges`.
  - Require `--confirm` for any reset; require `SCHEMA_RESET_FORCE=1` for production resets.
  - Render requires SSL (`PGSSLMODE=require`); allow `PGSSL_DISABLE=1` only for local.
  - Log executed commands in normal mode with credentials redacted.
  - Prevent overwriting existing dump files unless `--force` is provided (default: fail).
- Out:
  - No cross-environment copy tool beyond dump/restore.

# Acceptance criteria
- `db:dump` produces a timestamped custom dump for the chosen target.
- `db:reset:dump` restores from a dump after dropping/recreating the `sentry` schema.
- Scripts refuse `schema=public` and block prod resets without the force flag and confirm.
- Local/Render selection works via env vars and CLI flag.
- `--dump-file`, `--dry-run`, and `--force` behave as expected.

# Priority
- Impact: Medium (ops reliability).
- Urgency: Medium.

# Notes
- Source: req_009_offline_roster_tablets.
- Env vars: `DATABASE_URL_LOCAL`, `DATABASE_URL_RENDER`, fallback `DATABASE_URL`.
