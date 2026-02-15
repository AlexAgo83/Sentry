## item_134_add_bundle_observability_and_budget_guardrails_for_split_strategy - Add bundle observability and budget guardrails for split strategy
> From version: 0.9.28
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Tooling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Bundle-size warnings are visible but not converted into actionable and stable guardrails tied to the new split strategy.

# Scope
- In:
- Update bundle analysis/check scripts to reflect expected post-split limits.
- Ensure bundle checks fail with clear diagnostics when thresholds are exceeded.
- Keep build artifact visibility (`bundle-report`) usable for follow-up optimization.
- Out:
- No changes to product UX.

# Acceptance criteria
- Bundle budget guardrails align with split goals.
- CI/local budget failure logs clearly identify offending chunks.
- `npm run bundle:check` remains deterministic.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md`.
