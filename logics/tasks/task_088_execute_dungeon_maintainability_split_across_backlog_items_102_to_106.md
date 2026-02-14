## task_088_execute_dungeon_maintainability_split_across_backlog_items_102_to_106 - Execute dungeon maintainability split across backlog items 102 to 106
> From version: 0.9.24
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_102_split_dungeonscreen_into_setup_live_replay_and_header_modules.md`
- `logics/backlog/item_103_extract_dungeon_playback_hooks_and_replay_derived_computations.md`
- `logics/backlog/item_104_modularize_dungeonarenarenderer_pixi_runtime_and_drawing_pipeline.md`
- `logics/backlog/item_105_split_arena_playback_frame_builder_into_focused_modules.md`
- `logics/backlog/item_106_add_dungeon_refactor_regression_and_non_regression_test_coverage.md`

This task orchestrates the full dungeon maintainability refactor as one execution stream while preserving behavior parity.

# Decisions (v1)
- No gameplay or balance changes are allowed in this task.
- UI behavior must remain unchanged (setup/live/replay parity).
- Split is executed incrementally in stable phases, with validation after each phase.
- Test additions are mandatory; refactor is not complete without regression coverage.

# Plan
- [ ] 1. Baseline and guardrails:
  - Capture baseline behavior and key snapshots of current dungeon setup/live/replay flows.
  - Identify existing tests to preserve and list missing coverage areas.
- [ ] 2. Execute `item_102` (DungeonScreen split):
  - Extract `DungeonHeaderActions`, `DungeonSetupView`, `DungeonLiveView`, `DungeonReplayView`.
  - Keep parent `DungeonScreen` as orchestration layer with unchanged external props.
- [ ] 3. Execute `item_103` (playback hooks + replay-derived logic):
  - Extract `useDungeonLivePlayback`, `useDungeonReplayPlayback`, and `useDungeonReplayDerived`.
  - Move replay-derived pure calculations into testable helpers.
- [ ] 4. Execute `item_104` (renderer modularization):
  - Split Pixi runtime lifecycle, draw primitives, frame update orchestration, and floating text management.
  - Keep renderer fallback behavior and visual semantics intact.
- [ ] 5. Execute `item_105` (arenaPlayback modularization):
  - Split `arenaPlayback` into focused modules (types/helpers/frame builder/public API facade).
  - Preserve public frame-builder API contracts and behavior.
- [ ] 6. Execute `item_106` (testing gate):
  - Add/update unit tests for extracted helpers/hooks.
  - Add/update integration/non-regression tests for replay controls, cursor timing, and view transitions.
- [ ] 7. Full validation pass:
  - Run lint, typecheck, tests, and build.
  - Fix regressions until all validations are green.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Pending execution.
