# Codex Context

This file defines the working context for Codex in this repository.

## Language

Use English for all communication, code comments, and documentation.

## Workflow

The `logics` folder defines the product flow:

* `logics/architecture`: Architecture notes, decisions, and diagrams.
* `logics/request`: Incoming requests or ideas.
* `logics/backlog`: Core product items, possibly promoted from requests.
* `logics/tasks`: Execution plans derived from backlog items.

Use the following indicators in request/backlog/task items:

* `From version: X.X.X` : The version when the need was first identified (QA/backlog/etc).
* `Understanding: ??%` : Your estimated understanding of the need.
* `Confidence: ??%` : Your confidence in solving the need.
* `Progress: ??%` : Your progress toward completing the backlog item or task.

Use these commands to validate changes (start with the most relevant ones):
* `npm run lint`: Run ESLint on `src/**/*.{ts,tsx}` and `tests/**/*.{ts,tsx}`.
* `npm run tests`: Run the full local Vitest test suite via `scripts/run-tests.js`.
* `npm run test:ci`: Run Vitest in CI mode using `vitest.ci.mjs`.
* `npm run coverage`: Run Vitest with V8 coverage enabled and print the report.
* `npm run coverage:ci`: Run CI-mode Vitest with coverage enabled using `vitest.ci.mjs`.
* `npm run build`: Build the production bundle with Vite.
* `npm run typecheck`: Type-check the project without emitting files.
