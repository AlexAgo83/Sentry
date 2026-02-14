## item_104_modularize_dungeonarenarenderer_pixi_runtime_and_drawing_pipeline - Modularize DungeonArenaRenderer Pixi runtime and drawing pipeline
> From version: 0.9.24
> Understanding: 92%
> Confidence: 89%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`DungeonArenaRenderer` mixes Pixi app lifecycle, drawing primitives, unit update orchestration, and floating-text pooling in a single file, which raises complexity and makes visual regression fixes risky.

# Scope
- In:
- Split `src/app/components/dungeon/DungeonArenaRenderer.tsx` into focused modules:
  - runtime bootstrap/teardown module or hook
  - arena/background drawing module
  - units/effects drawing module
  - floating text management module
  - thin renderer component orchestrating frame updates
- Preserve current rendering semantics and fallback behavior.
- Out:
- No art/style redesign.
- No change in frame model (`DungeonArenaFrame`).

# Acceptance criteria
- Renderer internals are split into responsibility-focused files.
- Visual behaviors remain equivalent (target ring, damage pulse, magic pulse, floating text, phase label).
- JSDOM fallback behavior remains intact.
- Build/lint/tests pass, with at least one renderer non-regression test path kept.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_037_split_dungeon_screen_and_arena_modules_for_maintainability.md`.
- Main reference: `src/app/components/dungeon/DungeonArenaRenderer.tsx`.
- Implemented via `logics/tasks/task_088_execute_dungeon_maintainability_split_across_backlog_items_102_to_106.md`.
