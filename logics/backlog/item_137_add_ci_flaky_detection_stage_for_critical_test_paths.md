## item_137_add_ci_flaky_detection_stage_for_critical_test_paths - Add CI flaky detection stage for critical test paths
> From version: 0.9.28
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Flaky tests can pass locally but break CI unpredictably, reducing confidence in pipeline signal.

# Scope
- In:
- Add a repeat/stability command for selected high-risk tests.
- Integrate a dedicated flaky detection step in CI before expensive downstream steps.
- Ensure failure output identifies the unstable test path clearly.
- Out:
- No rewrite of full test architecture.
- No increase in total CI time beyond acceptable bounds for targeted repeats.

# Acceptance criteria
- CI includes a flaky detection stage for critical tests.
- Stage fails when repeats detect nondeterministic behavior.
- Logs identify failing iteration and target test.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md`.
- Suggested references: `.github/workflows/ci.yml`, `package.json`, test scripts/helpers.
