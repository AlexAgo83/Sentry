## task_039_logics_doc_hygiene_cleanup - Logics doc hygiene cleanup
> From version: 0.8.17
> Understanding: 93%
> Confidence: 92%
> Progress: 100%

# Context
Derived from `logics/backlog/item_044_logics_hygiene_cleanup.md`.
Move example docs to `logics/external/` and ensure doc linting is clean, with CI integration.

# Plan
- [x] 1. Move template/example docs to `logics/external/`.
- [x] 2. Update any references and remove `??%` indicators.
- [x] 3. Run doc linter and fix any remaining warnings.
- [x] 4. Add doc linter to CI.
- [x] FINAL: Update Logics docs and notes.

# Validation
- python3 logics/skills/logics-doc-linter/scripts/logics_lint.py

# Report
- Status: complete.
- Moved example docs to `logics/external/examples/` and removed `??%` indicators.
- Added Logics doc linter to CI and release workflows.
- `logics-doc-linter` passes cleanly.
