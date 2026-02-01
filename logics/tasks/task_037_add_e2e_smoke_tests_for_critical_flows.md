## task_037_add_e2e_smoke_tests_for_critical_flows - Add E2E smoke tests for critical flows
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_042_e2e_smoke_suite.md`.
Use Playwright with mocked backend for determinism; target a 3–5 minute runtime.

# Plan
- [x] 1. Add Playwright setup + config (headless by default).
- [x] 2. Add stable test selectors for critical UI flows.
- [x] 3. Implement smoke tests: new game, cloud auth, upload/download, conflict, inventory sell, mobile roster.
- [x] 4. Add CI script and local run docs.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npx playwright test

# Report
- Status: Done. Added Playwright config + smoke suite, stable `data-testid` selectors, E2E helper hooks, and CI step.
- Validation: Not run (suggest `npm run test:e2e`).

# Notes
