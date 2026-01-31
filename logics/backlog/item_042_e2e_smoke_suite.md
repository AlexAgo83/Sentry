## item_042_e2e_smoke_suite - Add E2E smoke tests for critical flows
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
Critical user flows lack end‑to‑end coverage, so regressions can slip despite unit tests.

# Scope
- In:
  - Add a minimal Playwright E2E suite.
  - Cover: new game creation, cloud auth, upload/download, conflict resolution, inventory sell, mobile roster view.
  - Prefer mocked backend for determinism; allow 1 optional real-backend test.
  - Add CI target for E2E smoke run (time budget 3–5 minutes).
- Out:
  - Full cross‑browser matrix; keep to 1–2 browsers in v1.

# Acceptance criteria
- E2E smoke tests run in CI and pass locally.
- Each critical flow has at least one green E2E test.
- Tests are stable and complete within a reasonable time budget.

# Priority
- Impact: Medium (regression prevention).
- Urgency: Medium.

# Notes
- Prefer data‑test selectors for stability.
