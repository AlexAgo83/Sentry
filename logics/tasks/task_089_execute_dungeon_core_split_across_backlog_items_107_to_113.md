## task_089_execute_dungeon_core_split_across_backlog_items_107_to_113 - Execute dungeon core split across backlog items 107 to 113
> From version: 0.9.24
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_107_extract_dungeon_constants_and_pure_formulas_into_dedicated_modules.md`
- `logics/backlog/item_108_extract_dungeon_replay_and_event_capping_pipeline.md`
- `logics/backlog/item_109_extract_dungeon_state_factories_normalization_and_selectors.md`
- `logics/backlog/item_110_extract_dungeon_run_lifecycle_transitions_start_stop_floor_and_finalize.md`
- `logics/backlog/item_111_split_applydungeontick_into_phased_dungeon_tick_engine_module.md`
- `logics/backlog/item_112_add_dungeon_index_facade_and_migrate_imports_safely.md`
- `logics/backlog/item_113_expand_dungeon_split_regression_coverage_and_validation_gates.md`

This task executes the full core dungeon refactor from a monolithic `src/core/dungeon.ts` to a domain-focused module set while preserving gameplay/replay behavior.

# Decisions (v1)
- No balance changes or gameplay rule changes are allowed.
- Migration must keep stable public APIs through a facade/export compatibility layer.
- Tick split is executed last and validated with targeted non-regression tests.
- Every phase requires validation before moving to the next phase.

# Plan
- [x] 1. Baseline and migration guardrails:
  - Capture current behavior assumptions for start/stop/tick/replay/state normalization.
  - Identify and pin critical tests to protect before refactor.
- [x] 2. Execute `item_107` (constants + formulas extraction):
  - Create `constants.ts` and `formulas.ts`.
  - Move pure helpers and tuning constants with no behavior change.
- [x] 3. Execute `item_108` (replay pipeline extraction):
  - Move replay/event cap/truncation logic to `replay.ts`.
  - Preserve replay payload shape and capping semantics.
- [x] 4. Execute `item_109` (state extraction):
  - Move state factory/normalization/selectors to `state.ts`.
  - Keep save normalization and active-run selection parity.
- [x] 5. Execute `item_110` (lifecycle extraction):
  - Move run lifecycle transitions to `lifecycle.ts` (`start`, `stop`, floor init, finalize).
  - Keep reducer/loop/runtime integrations stable.
- [x] 6. Execute `item_111` (tick engine split):
  - Move `applyDungeonTick` to `tick.ts`.
  - Split into explicit phases while preserving ordering and side-effects.
- [x] 7. Execute `item_112` (facade + import migration):
  - Add `src/core/dungeon/index.ts` as stable entrypoint.
  - Migrate internal imports safely and keep temporary compatibility exports as needed.
- [x] 8. Execute `item_113` (test and validation gate):
  - Add/update focused unit + non-regression tests for extracted modules.
  - Validate full test matrix and resolve regressions.
- [x] 9. Final stabilization:
  - Remove migration leftovers/dead exports once all call sites are updated.
  - Ensure documentation and references match final structure.
- [x] 10. Final mandatory full test battery:
  - Run the complete validation suite at task end on the final code state.
  - Fix all failing checks before considering the task complete.
- [x] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- npm run lint
- npm run typecheck
- npm run typecheck:tests
- npm run tests
- npm run test:ci
- npm run coverage
- npm run build

# Report
- Implemented split modules:
  - `src/core/dungeon/constants.ts`
  - `src/core/dungeon/formulas.ts`
  - `src/core/dungeon/replay.ts`
  - `src/core/dungeon/state.ts`
  - `src/core/dungeon/lifecycle.ts`
  - `src/core/dungeon/tick.ts`
  - `src/core/dungeon/index.ts`
  - compatibility facade `src/core/dungeon.ts`
- Added dedicated split tests:
  - `tests/core/dungeonFormulasSplit.test.ts`
  - `tests/core/dungeonReplaySplit.test.ts`
- Final validation (mandatory gate) executed successfully:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run tests`
  - `npm run test:ci`
  - `npm run coverage`
  - `npm run build`
