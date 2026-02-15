## item_133_split_heavy_optional_ui_paths_with_lazy_loading_and_chunk_reduction - Split heavy optional UI paths with lazy loading and chunk reduction
> From version: 0.9.28
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Performance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Large optional UI surfaces are bundled too eagerly, contributing to oversized chunks and slower initial load.

# Scope
- In:
- Identify heavy optional modules in system modal flows and other non-critical startup paths.
- Introduce `React.lazy` + `Suspense` boundaries for low-frequency views (leaderboard/changelogs/cloud/devtools-style panels as applicable).
- Keep primary gameplay path eager to avoid runtime stalls in core screen transitions.
- Provide explicit loading placeholder states for lazy-loaded views.
- Out:
- No functional redesign of modal UX.
- No gameplay logic changes.

# Acceptance criteria
- Heavy optional UI modules are lazy-loaded.
- Startup chunk footprint is reduced relative to baseline build.
- No regression in modal navigation/back stack behavior.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md`.
