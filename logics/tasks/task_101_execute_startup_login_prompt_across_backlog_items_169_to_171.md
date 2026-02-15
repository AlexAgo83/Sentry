## task_101_execute_startup_login_prompt_across_backlog_items_169_to_171 - Execute startup login prompt across backlog items 169 to 171
> From version: 0.9.31
> Understanding: 94%
> Confidence: 88%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Cloud
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_169_req050_persist_login_prompt_opt_out_preference.md`
- `logics/backlog/item_170_req050_login_prompt_modal_trigger_and_routing_to_cloud_login.md`
- `logics/backlog/item_171_req050_prompt_behavior_tests_and_polish.md`

Request reference:
- `logics/request/req_050_startup_login_prompt_when_backend_online_with_dismiss_option.md`

This task adds a non-blocking startup prompt suggesting login when the backend is online and the user is logged out, with a persistent opt-out and safe warmup/offline behavior.

# Decisions (v1)
- Prompt is shown only when:
  - backend is online,
  - user is not authenticated,
  - prompt is enabled (opt-out not set),
  - it has not already been shown this session.
- User choices:
  - Log in (routes to Cloud Save login view)
  - Not now (dismisses for this session)
  - Don't ask again (persistent disable)
- Prompt must not show while backend is warming/offline.

# Plan
- [ ] 1. Execute `item_169` (preference persistence):
  - Persist opt-out preference (prefer save payload; local fallback if needed).
  - Add migration/normalization for missing/invalid fields.
- [ ] 2. Execute `item_170` (modal + trigger + routing):
  - Implement the prompt modal UI and trigger rules.
  - Wire Log in to route directly to Cloud Save login.
- [ ] 3. Execute `item_171` (tests + polish):
  - Add tests for show/hide rules, session-only dismiss, persistent opt-out, and routing.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

