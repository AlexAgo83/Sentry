## item_044_logics_hygiene_cleanup - Logics doc hygiene cleanup
> From version: 0.8.17
> Understanding: 93%
> Confidence: 92%
> Progress: 100%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
A few example docs still contain `??%` indicators and placeholder content, which reduces doc quality signals.

# Scope
- In:
  - Remove or update `??%` indicators in example docs.
  - Move template/example docs into `logics/external/`.
  - Run doc linter and ensure no placeholder warnings.
  - Add doc linter to CI.
- Out:
  - Major restructure of the Logics workflow.

# Acceptance criteria
- No `??%` indicators remain in active docs.
- Example/template docs are clearly separated or archived.
- `logics-doc-linter` passes cleanly.

# Priority
- Impact: Low (doc hygiene).
- Urgency: Low.

# Notes
- Keep this as a small, contained cleanup task.
