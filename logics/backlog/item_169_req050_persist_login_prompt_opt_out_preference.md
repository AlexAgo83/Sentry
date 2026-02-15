## item_169_req050_persist_login_prompt_opt_out_preference - Persist login prompt opt-out preference (and migrate safely)
> From version: 0.9.31
> Understanding: 94%
> Confidence: 88%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The startup login prompt needs a durable “don’t ask again” choice so users who intentionally never log in are not spammed across relaunches.

# Scope
- In:
- Decide and implement persistence location for the opt-out:
  - preferred: saved in the game save payload so it survives export/import/cloud
  - acceptable fallback: `localStorage` device-local preference (document tradeoffs)
- Add migration/normalization for missing/invalid preference fields.
- Ensure default behavior for new users is “enabled” (prompt allowed).
- Out:
- No auto-sync implementation (separate request).

# Acceptance criteria
- `Don't ask again` disables future prompts persistently.
- Default is enabled for new users.
- Preference does not break save hydration or export/import.

# Implementation notes
- Likely touch points:
  - `src/core/types.ts` / `src/core/serialization.ts` / `src/adapters/persistence/saveMigrations.ts` (if persisted in save)

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_050_startup_login_prompt_when_backend_online_with_dismiss_option.md`.

