## item_060_dungeon_live_render_and_replay_viewer_arena - Dungeon live render and replay viewer arena
> From version: 0.8.22
> Understanding: 93%
> Confidence: 86%
> Progress: 0%

# Problem
Players need a readable live combat view and replay viewer that visualize simulation outcomes without becoming engine authority.

# Scope
- In:
  - Implement renderer with PixiJS for v1 dungeon live/replay visuals.
  - Build v1 top-down arena renderer (no pathfinding).
  - Render units using existing avatar head layers (face, hair, helmet visibility rules).
  - Add readability overlays: HP bars, damage/heal floats, target focus, death markers, boss phase marker.
  - Add live controls: pause/resume, speed x1/x2/x4, focus boss.
  - Add replay controls: timeline scrub, skip to first death, skip to wipe/end.
- Out:
  - Room traversal map rendering.
  - High-cost VFX passes that compromise mobile performance.

# Acceptance criteria
- Live screen displays all active entities and core combat readability overlays.
- Replay screen can play latest run timeline with deterministic event playback.
- Renderer consumes simulation events and does not alter outcomes.
- Mobile and desktop remain usable with stable frame pacing targets.
- PixiJS integration remains isolated to rendering layer and does not leak simulation authority.

# Priority
- Impact: High (player-facing payoff and debugging value).
- Urgency: Medium (depends on simulation and persistence readiness).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
