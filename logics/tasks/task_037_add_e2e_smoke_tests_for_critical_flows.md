## task_037_add_e2e_smoke_tests_for_critical_flows - Add E2E smoke tests for critical flows
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_042_e2e_smoke_suite.md`.
Use Playwright with mocked backend for determinism; target a 3–5 minute runtime.

# Plan
- [ ] 1. Add Playwright setup + config (headless by default).
- [ ] 2. Add stable test selectors for critical UI flows.
- [ ] 3. Implement smoke tests: new game, cloud auth, upload/download, conflict, inventory sell, mobile roster.
- [ ] 4. Add CI script and local run docs.
- [ ] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npx playwright test

# Report
- Status: not started.
