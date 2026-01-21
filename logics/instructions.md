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

Note: this repo does not use `logics/specs/` (removed).

### Backlog → Tasks

Use this lightweight flow to go from an idea to an executable plan:

1. Create a request in `logics/request/` (problem statement + context).
2. Promote it to `logics/backlog/` once the scope is clear (acceptance criteria + priority).
3. Create one or more tasks in `logics/tasks/` (step-by-step plan, progress tracking, validation commands).
4. Update `Understanding`, `Confidence`, and `Progress` as you learn and implement.

Mini example:

- `logics/request/2026-01-19-offline-recap-ui.md`: “Players want a clearer offline recap modal.”
- `logics/backlog/offline-recap-ui.md`: Acceptance: recap shows time away, item deltas, per-player XP.
- `logics/tasks/offline-recap-ui.md`: Plan: add selectors → update modal UI → add tests → run `npm run lint` / `npm run tests`.

Use the following indicators in request/backlog/task items:

* `From version: X.X.X` : The version when the need was first identified (QA/backlog/etc).
* `Understanding: ??%` : Your estimated understanding of the need.
* `Confidence: ??%` : Your confidence in solving the need.
* `Progress: ??%` : Your progress toward completing the backlog item or task.

## Automation

For consistent filenames (IDs + slugs) and templates, use `logics/skills/logics-flow-manager/scripts/logics_flow.py`.

## Local skills

The `logics/skills/` folder is a Git submodule pointing to the shared Logics kit. After a fresh clone/template, initialize it:

* `git submodule update --init --recursive`

These are the available skills under `logics/skills/`:

* `logics-flow-manager`: Create/promote request/backlog/task docs via templates and auto-incremented IDs.
* `logics-triage-assistant`: Turn raw ideas into a solid `logics/request/*.md`.
* `logics-backlog-groomer`: Turn a request into a scoped backlog item with acceptance criteria and priority.
* `logics-task-breakdown`: Turn a backlog item into one or more executable tasks with plans + validation.
* `logics-acceptance-to-tests`: Convert acceptance criteria into a concrete test/validation plan.
* `logics-bootstrapper`: Bootstrap `logics/*` folders and keep empty dirs versioned.
  - `python3 logics/skills/logics-bootstrapper/scripts/logics_bootstrap.py`
* `logics-estimation-helper`: Propose a rough estimate and the key complexity drivers.
  - `python3 logics/skills/logics-estimation-helper/scripts/add_estimate.py logics/backlog/<item>.md --size M`
* `logics-risk-reviewer`: Add risks/mitigations/rollback notes to backlog/tasks.
  - `python3 logics/skills/logics-risk-reviewer/scripts/add_risk_sections.py logics/backlog/<item>.md`
* `logics-progress-updater`: Update `From version` / `Understanding` / `Confidence` / `Progress` consistently.
  - `python3 logics/skills/logics-progress-updater/scripts/update_indicators.py <path> --progress 40%`
* `logics-doc-linter`: Validate filenames/headings/indicators across Logics docs.
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
* `logics-code-structure-reviewer`: Detect stack/framework signals and review code structure (large files, boundaries, suggested refactors).
  - `python3 logics/skills/logics-code-structure-reviewer/scripts/code_structure_review.py --out logics/CODE_REVIEW.md`
* `logics-relationship-linker`: Generate a cross-doc relationship report.
  - `python3 logics/skills/logics-relationship-linker/scripts/link_relations.py --out logics/RELATIONSHIPS.md`
* `logics-duplicate-detector`: Print duplicate candidates by title similarity.
  - `python3 logics/skills/logics-duplicate-detector/scripts/find_duplicates.py --min-score 0.55`
* `logics-global-reviewer`: Generate a global review report and propose improvements (placeholders, stale indicators, progress distribution).
  - `python3 logics/skills/logics-global-reviewer/scripts/logics_global_review.py --out logics/REVIEW.md`
* `logics-indexer`: Generate a consolidated index.
  - `python3 logics/skills/logics-indexer/scripts/generate_index.py --out logics/INDEX.md`
* `logics-release-notes`: Generate release notes from tasks with `Progress: 100%`.
  - `python3 logics/skills/logics-release-notes/scripts/generate_release_notes.py --out logics/RELEASE_NOTES.md`
* `logics-changelog-curator`: Generate a user-facing changelog from release notes.
  - `python3 logics/skills/logics-changelog-curator/scripts/curate_changelog.py --in logics/RELEASE_NOTES.md --out logics/CHANGELOG.md`
* `logics-pr-template-writer`: Generate a PR template from a task doc.
  - `python3 logics/skills/logics-pr-template-writer/scripts/generate_pr_template.py logics/tasks/<task>.md --out PR.md`
* `logics-architecture-decision-writer`: Create a new ADR in `logics/architecture/`.
  - `python3 logics/skills/logics-architecture-decision-writer/scripts/new_adr.py --title \"...\" --out-dir logics/architecture`
* `logics-metrics-owner`: Add owner + KPI + instrumentation notes to backlog/spec.
  - `python3 logics/skills/logics-metrics-owner/scripts/add_owner_metrics.py logics/backlog/<item>.md --owner \"@name\"`
* `logics-workstream-planner`: Generate a simple roadmap from backlog items.
  - `python3 logics/skills/logics-workstream-planner/scripts/generate_roadmap.py --out logics/ROADMAP.md`
* `logics-uiux-designer`: Propose UI/UX improvements and produce handoff artifacts (spec/backlog/tasks).
  - `python3 logics/skills/logics-uiux-designer/scripts/logics_uiux.py new --title \"...\"`

Use these commands to validate changes (start with the most relevant ones):
* `npm run lint`: Run ESLint on `src/**/*.{ts,tsx}` and `tests/**/*.{ts,tsx}`.
* `npm run tests`: Run the full local Vitest test suite via `scripts/run-tests.js`.
* `npm run test:ci`: Run Vitest in CI mode using `vitest.ci.mjs`.
* `npm run coverage`: Run Vitest with V8 coverage enabled and print the report.
* `npm run coverage:ci`: Run CI-mode Vitest with coverage enabled using `vitest.ci.mjs`.
* `npm run build`: Build the production bundle with Vite.
* `npm run typecheck`: Type-check the project without emitting files.
