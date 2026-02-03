## task_046_dungeon_live_renderer_and_replay_controls_arena - Dungeon live renderer and replay controls arena
> From version: 0.8.22
> Understanding: 92%
> Confidence: 86%
> Progress: 0%

# Context
Derived from:
- `logics/backlog/item_060_dungeon_live_render_and_replay_viewer_arena.md`

This task delivers the player-facing live/replay visual layer using a top-down arena style. Rendering must remain a consumer of simulation events only.

# Plan
- [ ] 1. Set up PixiJS rendering layer and hook it to dungeon simulation event stream.
- [ ] 2. Implement arena view with avatar head-layer rendering (face/hair/helmet visibility rules).
- [ ] 3. Add readability overlays: HP bars, damage/heal numbers, target focus, death markers, boss phase state.
- [ ] 4. Add live controls: pause/resume, speed x1/x2/x4, focus boss.
- [ ] 5. Add replay controls for latest run: timeline scrub, skip to first death, skip to wipe/end.
- [ ] 6. Validate mobile/desktop usability and apply performance guardrails (pooling, FX budgets).
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
