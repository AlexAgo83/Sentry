## req_038_split_core_dungeon_module_into_domain_focused_files - Split core dungeon module into domain-focused files
> From version: 0.9.24
> Understanding: 96%
> Confidence: 93%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Split `src/core/dungeon.ts` into smaller domain-focused files to reduce complexity and regression risk.
- Keep gameplay behavior and save/replay compatibility unchanged.
- Improve testability of dungeon formulas and tick phases by extracting pure and semi-pure modules.

# Context
- Current file size and hotspot:
  - `src/core/dungeon.ts` is ~1673 lines.
  - `applyDungeonTick` alone is ~536 lines.
- `dungeon.ts` currently mixes too many responsibilities:
  - constants/tuning
  - formulas/stats multipliers
  - replay/event truncation/caps
  - run lifecycle (start/stop/finalize/floor init)
  - state normalization/selectors
  - full runtime tick engine
- This density makes review and safe iteration difficult for any dungeon change.

# Goals
- Isolate responsibilities into stable domain modules with explicit APIs.
- Keep existing public entrypoints available through a compatibility facade.
- Increase unit/integration coverage around extracted logic and tick behavior.

# Locked decisions (v1)
- No balance changes and no gameplay rule changes in this request.
- No state schema changes unless strictly required for internal typing hygiene.
- Public API remains stable through `src/core/dungeon.ts` compatibility exports during migration.
- Testing is mandatory per split phase.

# Proposed split structure (target)
- `src/core/dungeon/constants.ts`
  - Simulation constants, replay limits, tuning values.
- `src/core/dungeon/formulas.ts`
  - Pure combat formulas (attack interval, damage, armor multipliers, XP formulas, food cost formulas).
- `src/core/dungeon/replay.ts`
  - Replay building, event capping/truncation, critical-event fallback, event helpers.
- `src/core/dungeon/lifecycle.ts`
  - `startDungeonRun`, `stopDungeonRun`, `initializeFloor`, `finalizeRun` and run transition helpers.
- `src/core/dungeon/state.ts`
  - `createDungeonState`, `normalizeDungeonState`, selectors (`getDungeonRuns`, `getActiveDungeonRun`, etc.).
- `src/core/dungeon/tick.ts`
  - `applyDungeonTick`, split internally into phases:
    - pre-step setup
    - hero phase
    - enemy phase
    - heal/consumable phase
    - end-of-step/finalize phase
- `src/core/dungeon/index.ts`
  - Stable re-exports to preserve current call sites.

# Execution order (recommended)
1. Extract `constants.ts` and `formulas.ts` first (lowest risk).
2. Extract `replay.ts`.
3. Extract `state.ts` and `lifecycle.ts`.
4. Extract and refactor `tick.ts` last (highest behavior risk).
5. Keep a compatibility facade during the migration and remove only when all imports are updated.

# Technical references to update
- `src/core/dungeon.ts`
- `src/core/loop.ts`
- `src/core/reducer.ts`
- `src/core/state.ts`
- `src/core/runtime.ts`
- `tests/core/dungeon.test.ts`
- `tests/core/dungeonReplay.test.ts`
- `tests/core/dungeonState.test.ts`
- `tests/core/loop.test.ts`

# Acceptance criteria
- `src/core/dungeon.ts` is no longer the only implementation file for dungeon domain logic.
- Split modules are responsibility-focused and imported via stable public entrypoints.
- Gameplay/replay/state behavior remains equivalent.
- Existing dungeon/core tests pass.
- Additional focused tests cover extracted pure formulas and tick/replay edge paths.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run tests`
  - `npm run test:ci`
- Expected additions:
  - unit tests for extracted formulas and replay helpers,
  - non-regression tests for tick phase outcomes,
  - state normalization and lifecycle transition checks.

# Risks / open points
- `applyDungeonTick` split can introduce subtle timing/order regressions.
- Hidden coupling between lifecycle helpers and loop/reducer call sites.
- Replay event ordering assumptions may break if helper boundaries are wrong.
- Temporary dual-export period can create import drift if not enforced.

# Backlog
- `logics/backlog/item_107_extract_dungeon_constants_and_pure_formulas_into_dedicated_modules.md`
- `logics/backlog/item_108_extract_dungeon_replay_and_event_capping_pipeline.md`
- `logics/backlog/item_109_extract_dungeon_state_factories_normalization_and_selectors.md`
- `logics/backlog/item_110_extract_dungeon_run_lifecycle_transitions_start_stop_floor_and_finalize.md`
- `logics/backlog/item_111_split_applydungeontick_into_phased_dungeon_tick_engine_module.md`
- `logics/backlog/item_112_add_dungeon_index_facade_and_migrate_imports_safely.md`
- `logics/backlog/item_113_expand_dungeon_split_regression_coverage_and_validation_gates.md`
