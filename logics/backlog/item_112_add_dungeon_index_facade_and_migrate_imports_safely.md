## item_112_add_dungeon_index_facade_and_migrate_imports_safely - Add dungeon index facade and migrate imports safely
> From version: 0.9.24
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
A multi-file split can break imports across core/app/tests if no stable facade is introduced during migration.

# Scope
- In:
- Introduce `src/core/dungeon/index.ts` as stable public export surface.
- Migrate call sites incrementally to facade exports.
- Keep backward-compatible exports in `src/core/dungeon.ts` during transition.
- Remove temporary duplication once migration is complete.
- Out:
- No behavior changes.
- No gameplay changes.

# Acceptance criteria
- Call sites import dungeon APIs via stable facade.
- No broken imports during migration.
- Typecheck and tests remain green across migration steps.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Key references: `src/core/dungeon.ts`, `src/core/loop.ts`, `src/core/reducer.ts`, `src/core/runtime.ts`.
