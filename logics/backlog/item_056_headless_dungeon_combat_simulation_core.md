## item_056_headless_dungeon_combat_simulation_core - Headless dungeon combat simulation core
> From version: 0.8.22
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Problem
Dungeon combat must be deterministic, simulation-first, and independent from rendering so live and replay views can consume the same authoritative outcomes.

# Scope
- In:
  - Implement headless tick-based dungeon combat simulation.
  - Use a fixed simulation step of 500ms in v1.
  - Support HP, damage in/out, hero deaths, enemy deaths, floor transitions, boss encounter, and wipe stop.
  - Support auto-restart after success with fixed 3-second delay when conditions are met.
  - Apply deterministic targeting rules: keep current target until death, then select lowest-HP target (tie-break by spawn index).
  - Emit deterministic event stream for renderer/replay consumers.
  - Keep simulation ready for future multi-party extension while executing one active party in v1.
- Out:
  - Manual skill casting and real-time tactical input.
  - Pathfinding and room traversal systems.

# Acceptance criteria
- Same seed and same input state produce identical run outcomes.
- Boss kill ends run immediately and can trigger auto-restart when allowed.
- Full party death ends run immediately (no checkpoint retry in v1).
- Simulation can run with no renderer attached.
- Target selection results are deterministic across reruns with the same seed and state.

# Priority
- Impact: High (engine foundation for the whole feature).
- Urgency: High (blocks all dungeon execution paths).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
