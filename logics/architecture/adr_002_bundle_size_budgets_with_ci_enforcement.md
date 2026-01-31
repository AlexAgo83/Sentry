## adr_002_bundle_size_budgets_with_ci_enforcement - Bundle size budgets with CI enforcement
> Date: 2026-01-31
> Status: Proposed

# Context
Bundle size has no guardrails today. Regressions can slip into main without notice, impacting load time and UX.
We need a lightweight, CI‑enforced budget and a human‑readable report.

# Decision
Add build‑time bundle reporting + CI budgets:
- Generate `dist/bundle-report.html` via Vite/Rollup visualizer.
- Enforce max JS/CSS/total sizes using a small Node script reading `scripts/bundle-budgets.json`.
- Run the budget check in CI and release workflows after `npm run build`.

# Alternatives considered
- Manual review of build artifacts (easy to miss regressions).
- Lighthouse budgets only (slower to run and less direct on asset sizes).
- External SaaS bundle monitoring (not needed for current scope).

# Consequences
- CI will fail when budgets are exceeded, requiring deliberate budget updates.
- Budgets depend on a successful build (must run before check).
- Report is generated on each build for local inspection.
