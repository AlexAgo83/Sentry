## req_009_offline_roster_tablets - Offline roster & tablets updates
> From version: 0.8.11
> Understanding: 94%
> Confidence: 85%

# Needs
- Increase the offline time limit to 7 days across all platforms (cap the processed window; keep recap messaging for capped time).
- Mobile only: rename the "Stats" button to "Roster".
- Mobile only: the roster panel must be visible only within the Stats screen (hidden elsewhere).
- Add an inventory equipment slot for tablets and allow tablets to be equipped.
- Limit tablet equipment to a single tablet in that slot (no multi-equip).
- Place the tablet equipment slot after weapons in the equipment UI.
- Add tablet charges: each tablet starts with 100 charges; each player action while a tablet is equipped consumes 1 charge; when charges reach 0, the tablet disappears.
- Show remaining charges on the tablet item info and in the equipment UI.
- Add tests for the new features, plus any quick missing tests that are easy to cover.
- Generate a virtual score (for now: sum of character skill levels) and show it subtly in the setup modal.
- Start a small companion backend for account creation, login, and cloud save sync.
- Allow players to either load the latest cloud save or overwrite cloud with local save.
- Highlight the date and score differences between local and cloud saves when choosing.
- Ensure the backend is optional: the app still runs locally/static/PWA; if backend is unavailable, the option is disabled until network is restored.
- Use a shared Postgres database with a fixed schema name `sentry` for the backend.
- Add DB utility commands:
  - Download the full DB dump (not just the schema).
  - Reset the DB from a dump.
  - Allow targeting either local DB or the Render DB.
  - Default dump format: `pg_dump` custom (`.dump`) with an optional `--sql` flag to also export plain SQL.
  - Store dumps under `scripts/db/dumps/` with timestamped names.

# Context
- Adjust mobile navigation and information layout so the roster is accessed via the Stats screen.
- Keep non-mobile behavior unchanged unless explicitly required.
- Tablets require a dedicated equipment slot and charge tracking that is visible to players.
- Cloud sync requires a lightweight backend and UI cues to resolve local vs cloud differences.
- Current offline cap: `GameRuntime.MAX_OFFLINE_CATCH_UP_MS = 12h` in `src/core/runtime.ts`.
- Reference projects to consult for shared DB setup:
  - /Users/alexandreagostini/Documents/BrickIdle/
  - /Users/alexandreagostini/Documents/PoleApp/
- Shared DB pattern (reference): DATABASE_URL must include `?schema=sentry`, service sets `search_path` on connect, and DB scripts guard against `schema=public` and unsafe resets.
- Backend env baseline: DATABASE_URL with schema param; optional `PGSSL_DISABLE=1` for local connections; Render requires SSL.

# Constraints / decisions
- Scope is limited to mobile UI copy and panel visibility, plus the offline time limit change.
- Tablet equipment is restricted to a single item in its slot; charges decrement per player action while equipped.
- Charges decrement on each completed player action (including offline catch-up). If charges hit 0 mid-action, the action completes and the tablet is removed afterward.
- Charges display: show `Charges: X/100` in item tooltip and as a small badge in the equipment slot.
- Mobile roster entry point stays the existing Stats button (bottom action bar); rename only. No other copy changes.
- Roster panel is hidden outside the Stats screen on mobile.
- Virtual score is computed live (not persisted) and shown as a subtle muted line in the setup modal footer (e.g., "Virtual score: 128").
- Backend must be non-blocking and optional; offline-first behavior remains intact.
- Backend v1 scope: email + password auth (bcrypt, no email verification), single latest save per account, endpoints for register/login, fetch latest, and upload/overwrite save. Store metadata for comparisons (updatedAt, virtualScore, appVersion).
- Auth tokens: issue a short-lived access token + long-lived refresh token; store refresh token in HttpOnly cookie (web) and access token in memory/local storage.
- No external OAuth (Google, etc.) for v1; stick to the simple email/password flow.
- Cloud vs local conflict UI compares updatedAt + virtualScore + appVersion, defaults to most recent, warns but does not block older overwrite, and does not persist the choice.
- Conflict UI: two explicit actions ("Load cloud save", "Overwrite cloud with local") plus a small diff block (date + score + version).
- When backend is unavailable, disable cloud actions with helper text + manual retry (no background queue).
- Suggested backend stack: Node.js + Fastify + Prisma on Render.
- Disallow using the public schema; enforce `schema=sentry` always.
- Environment isolation happens at the DB level (separate DBs per env; schema name stays `sentry`).
- Protect schema resets; require an explicit force flag for production resets.
- DB dump/reset commands must respect schema safeguards (no public schema, force flag + confirm for prod).
- Dump format default: `pg_dump -Fc` (custom) with `-Z 6`, data-only, no owner/privileges; optional SQL export via `--sql`.
- Dump naming default: `scripts/db/dumps/db_dump_<target>_YYYYMMDD_HHMMSS.dump`.
- Reset-from-dump default: drop & recreate `sentry` schema, then restore with `pg_restore --clean --if-exists --no-owner --no-privileges`. Dumps are data-only (no roles/privileges).
- Target selection default: `--target=local|render` (default local).
- Connection envs: `DATABASE_URL_LOCAL`, `DATABASE_URL_RENDER`, fallback to `DATABASE_URL`.
- SSL behavior: Render requires `PGSSLMODE=require`; `PGSSL_DISABLE=1` allowed only for local.
- Script defaults: `scripts/db/dump.ts`, `scripts/db/restore.ts`, `scripts/db/reset-from-dump.ts` with npm scripts `db:dump`, `db:restore`, `db:reset:dump` (+ `:render` variants).
- Tests to add:
  - Runtime offline cap (12h -> 7d) and capped recap messaging.
  - Tablet charge depletion (including offline catch-up).
  - UI charge display (tooltip + equipment badge).
  - Cloud conflict UI flow (diff fields + choice behavior).
  - DB script smoke coverage for dump/restore/reset.
  - Backend auth: register/login happy path, wrong password, duplicate email, token refresh.
  - Backend saves API: upload/overwrite, fetch latest, empty state, invalid payload, size limits.
  - Backend metadata: updatedAt/virtualScore/appVersion returned correctly.
  - Backend security: auth required for save endpoints, token expiry, rate limiting (if added).

# Open questions
- None for now; revisit if backend hosting, auth, or tooling constraints change.

# Backlog
- (none yet)
