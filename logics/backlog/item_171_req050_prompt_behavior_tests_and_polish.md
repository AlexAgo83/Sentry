## item_171_req050_prompt_behavior_tests_and_polish - Add tests for login prompt show/hide and opt-out behavior
> From version: 0.9.31
> Understanding: 90%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Testing / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The login prompt is easy to regress (showing too often, showing while offline/warming, or failing to persist opt-out). This needs test coverage.

# Scope
- In:
- Add UI-level tests for:
  - prompt shows only when backend online + logged out + enabled
  - prompt does not show when warming/offline
  - `Not now` dismisses for session only
  - `Don't ask again` persists and prevents future prompts
  - `Log in` routes to Cloud Save login view
- Ensure tests pass in CI and are not flaky (avoid timer races; mock backend status deterministically).
- Out:
- No broader onboarding scope.

# Acceptance criteria
- Automated tests cover prompt logic and persistence.
- CI test suite remains stable.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_050_startup_login_prompt_when_backend_online_with_dismiss_option.md`.
