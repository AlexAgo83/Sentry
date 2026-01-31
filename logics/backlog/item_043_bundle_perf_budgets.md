## item_043_bundle_perf_budgets - Add bundle size and perf budgets
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
There is no guardrail against bundle growth or perf regressions.

# Scope
- In:
  - Add build size reporting (Vite + analyzer or custom script).
  - Define bundle size thresholds and fail CI when exceeded.
  - Generate an HTML report for inspection.
- Out:
  - Full performance profiling suite.

# Acceptance criteria
- CI fails when bundle size exceeds agreed thresholds.
- Build report is generated and easy to inspect.
- No changes to runtime behavior.

# Priority
- Impact: Medium (prevents slow regressions).
- Urgency: Low.

# Notes
- Keep thresholds adjustable via config.
