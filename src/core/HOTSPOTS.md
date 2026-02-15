# Core Hotspots

This folder contains the main game loop and runtime orchestration. A few files are intentionally split to keep behavior changes low-risk.

## Where To Put New Code

- `src/core/loop.ts`
  - Owns the `applyTick()` orchestration across players, dungeon ticks, quests, and progression.
  - Keep this file focused on wiring and aggregation.
- `src/core/loop/actionTick.ts`
  - Owns per-player action execution: stamina, crafting costs/rewards, inventory deltas, and action XP.
  - Prefer extending this module (or splitting further) instead of growing `loop.ts`.
- `src/core/runtime.ts`
  - Owns visibility handling, persistence retry policy, perf telemetry, and when to run offline catch-up.
  - Keep UI/feature logic out of this file.
- `src/core/runtime/offlineCatchUp.ts`
  - Owns the offline stepping loop implementation (capping, tick counting, and delta collection).
  - This is a good place for pure helpers around offline stepping invariants.

## Testing Touchpoints

- Offline stepping + caps: `tests/core/runtime.test.ts`, `tests/offlineLoop.test.ts`
- Tick invariants and economy: `tests/core/loop.test.ts`, plus domain tests under `tests/core/*`

