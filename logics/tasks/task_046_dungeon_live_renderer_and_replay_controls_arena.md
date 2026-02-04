## task_046_dungeon_live_renderer_and_replay_controls_arena - Dungeon live renderer and replay controls arena
> From version: 0.8.22
> Understanding: 96%
> Confidence: 91%
> Progress: 100%

# Context
Derived from:
- `logics/backlog/item_060_dungeon_live_render_and_replay_viewer_arena.md`

This task delivers the player-facing live/replay visual layer using a top-down arena style. Rendering must remain a consumer of simulation events only.

# Plan
- [x] 1. Set up PixiJS rendering layer and hook it to dungeon simulation event stream.
- [x] 2. Implement arena view with avatar head-layer rendering (face/hair/helmet visibility rules).
- [x] 3. Add readability overlays: HP bars, damage/heal numbers, target focus, death markers, boss phase state.
- [x] 4. Add live controls: pause/resume, speed x1/x2/x4, focus boss.
- [x] 5. Add replay controls for latest run: timeline scrub, skip to first death, skip to wipe/end.
- [x] 6. Validate mobile/desktop usability and apply performance guardrails (pooling, FX budgets).
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Added a PixiJS arena renderer (`DungeonArenaRenderer`) isolated in the dungeon view layer with dynamic boot and safe fallback in non-visual/test environments.
- Added deterministic frame builders (`arenaPlayback`) for live and replay timelines from simulation events, including hero head visuals (skin/hair/helmet visibility), enemy placement, and event-window floating numbers.
- Added readability overlays and markers: HP bars, target ring, death cross, boss phase label, and focus-boss camera mode.
- Added live controls (pause/resume + x1/x2/x4 + focus boss) and replay controls (play/pause, speed, timeline scrub, skip first death, skip wipe/end).
- Added guardrails: bounded floating FX pool and capped replay log rendering in UI.
- Added tests for playback reconstruction and control surface rendering; validation passed with lint/typecheck/tests/build.
